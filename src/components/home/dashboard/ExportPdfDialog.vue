<template>
  <div>
    <v-card-text style="max-height: 60vh; overflow-y: scroll">
      <v-list
        subheader
        two-line
      >
        <v-subheader inset>{{ getTranslation('GENERAL_INFO') }}</v-subheader>

        <v-list-item>
          <v-list-item-avatar color="blue">
            <v-icon
              color="black"
            >
              mdi-information
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <div v-if="clientsSelected" class="d-flex">
              <v-text-field
                hide-details="auto"
                class="pr-1"
                readonly
                outlined
                :label="getTranslation('SELECTED_CLIENT')"
                :value="clientsSelected.map(el => el.companyName).join(',')"
              ></v-text-field>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar color="blue">
            <v-icon
              color="black"
            >
              mdi-calendar
            </v-icon>
          </v-list-item-avatar>

          <v-list-item-content v-if="periodFilter">
            <div class="d-flex">
              <v-text-field
                hide-details="auto"
                class="pr-1 pl-1"
                readonly
                outlined
                :label="getTranslation('FROM')"
                :value="new Date(periodFilter.fromUtcString).toLocaleString()"
              ></v-text-field>
              <v-text-field
                hide-details="auto"
                class="pr-1"
                readonly
                outlined
                :label="getTranslation('TO')"
                :value="new Date(periodFilter.toUtcString).toLocaleString()"
              ></v-text-field>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-divider inset></v-divider>

        <v-subheader v-if="atLeastOneFilterSelected" inset>{{ getTranslation('Filtri selezionati') }}</v-subheader>

        <v-list-item v-if="osTypeFilter">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">{{ getNameIconOsType(osTypeFilter) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content style="font-size: 18px">
            {{ getTranslation('DEVICES') + ' ' + osTypeFilter.toUpperCase() }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="osVersionFilter">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">mdi-counter</v-icon>
          </v-list-item-avatar>
          <v-list-item-content style="font-size: 18px">
            {{ getTranslation('VERSION') + ' ' + osVersionFilter }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="criticalityFilter && Array.isArray(criticalityFilter) && criticalityFilter.length > 0">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">mdi-chart-areaspline-variant</v-icon>
          </v-list-item-avatar>
          <v-list-item-content style="font-size: 18px">
            <div class="d-flex">
              {{ getTranslation('SEVERITY') }}
              <div v-for="(criticality, index) in criticalityFilter" :key="index">
                &nbsp;
                {{ getTranslation(criticality !== 'critic' ? criticality.toUpperCase() : 'CRITICAL') }}
                {{ criticalityFilter[index + 1] ? ',' : '' }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="selectedDaysFilter && Array.isArray(selectedDaysFilter) && selectedDaysFilter.length > 0">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">mdi-calendar-blank</v-icon>
          </v-list-item-avatar>
          <v-list-item-content style="font-size: 18px">
            <div class="d-flex">
              {{ getTranslation('SELECTED_DAYS') }}:
              <div v-for="(selectedDay, index) in selectedDaysFilter" :key="index">
                &nbsp;
                {{ selectedDay }}
                {{ selectedDay[index + 1] ? ', ' : '' }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!!eventTypesFilter && !!eventTypesFilter.items">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">mdi-list-status</v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="d-flex-wrap" style="font-size: 18px">
            <div>
              {{
                eventTypesFilter.include ? getTranslation('INCLUDED_EVENT_TYPES') : getTranslation('EXCLUDED_EVENT_TYPES')
              }}
              <div v-for="(eventTypeSelected, index) in eventTypesFilter.items" :key="index">
                {{ getTranslation(itemsEventTypes.find(el => el.value === eventTypeSelected).key) }}
                {{ eventTypeSelected[index + 1] ? ', ' : '' }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-list-item v-if="!!serialNumbersFilter && !!serialNumbersFilter.items">
          <v-list-item-avatar color="yellow">
            <v-icon color="black">mdi-numeric</v-icon>
          </v-list-item-avatar>
          <v-list-item-content style="font-size: 18px" class="d-flex-wrap">
            <div>
              {{
                serialNumbersFilter.include ? getTranslation('INCLUDED_SERIALS') : getTranslation('EXCLUDED_SERIALS')
              }}
              <div v-for="(serialNumberSelected, index) in serialNumbersFilter.items" :key="index">
                {{ serialNumberSelected }} {{ serialNumberSelected[index + 1] ? ', ' : '' }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>

        <v-divider v-if="atLeastOneFilterSelected" inset></v-divider>

        <v-subheader inset>{{ getTranslation('ADVANCED_OPTIONS') }}</v-subheader>
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-icon color="black">mdi-message-bulleted</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-text-field
              :label="getTranslation('NOTES')"
              outlined
              v-model="notesText"
              hide-details="auto"
              :rules="[(value) => value.length <= 64 || 'Max 64 characters'] "
            ></v-text-field>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-icon color="black">mdi-format-list-numbered</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <div class="d-flex align-center">
              <v-text-field
                :value="numberOfTotalEvents"
                readonly
                outlined
                hide-details="auto"
                :label="getTranslation('NUMBER_OF_EVENTS')"
              ></v-text-field>
              <v-text-field
                prepend-icon="mdi-alert"
                class="force-red-text ml-5"
                :value="numberOfTotalCriticalEvents"
                readonly
                color="red"
                outlined
                hide-details="auto"
                :label="getTranslation('NUMBER_OF_CRITICAL_EVENTS')"
              ></v-text-field>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-icon color="black">mdi-export</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <div class="d-flex align-center">
              <div style="font-size: 15px; width: 30%" class="pl-2">
                {{ getTranslation("EXPORT_TABLE_IN_FORMAT") }}
              </div>
              <v-btn-toggle
                v-model="modExportTableEvents"
                :class="{'disable-button': numberOfTotalEvents > 500}"
                color="blue"
                mandatory
              >
                <v-btn>
                  <v-icon>mdi-file-pdf-box</v-icon>
                </v-btn>
                <v-btn>
                  <v-icon>mdi-microsoft-excel</v-icon>
                </v-btn>
              </v-btn-toggle>
              <div style="font-size: 12px" class="pl-2">
                {{ numberOfTotalEvents > 500 ? getTranslation("PDF_CHOICE_NOT_POSSIBLE_TOO_MANY_EVENTS") : '' }}
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-icon color="black">mdi-watermark</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <div class="d-flex pl-2">
              <v-switch v-model="watermarkSwitch" color="primary" label="Watermark"></v-switch>
              <v-text-field
                v-if="watermarkSwitch"
                v-model="watermarkText"
                class="pl-2"
                :label="getTranslation('TEXT')"
                :rules="[(value) => value.length <= 32 || 'Max 32 characters'] "
              ></v-text-field>
            </div>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-avatar color="grey">
            <v-icon color="black">mdi-file</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <div class="d-flex pl-2">
              <v-text-field
                v-model="fileName"
                :label="getTranslation('FILENAME')"
                :rules="[(value) => value.length <= 64 || 'Max 64 characters',(value) => !value.includes('.') || 'Carattere punto non permesso'] "
              ></v-text-field>
            </div>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <div class="d-flex justify-end">
        <v-btn :loading="waitingExportToFinish" color="red" @click="$emit('close')">
          {{ getTranslation('CLOSE') }}
        </v-btn>
        <v-btn
          :loading="waitingExportToFinish"
          color="primary"
          class="ml-3"
          @click="exportPdf"
          :disabled=" (Array.isArray(clientsSelected) && clientsSelected.length === 0) || !!watermarkText && watermarkText.length > 32
            || !!notesText && notesText.length > 64 || !!fileName && fileName.length > 64"
        >
          {{ getTranslation('EXPORT') }}
        </v-btn>
      </div>
    </v-card-actions>
  </div>
</template>

<script>
import translateService from '@/globalServices/translate'
import axios from "axios";
import deviceService from "@/globalServices/deviceService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";

export default {
  name: "ExportPdfDialog",
  data: () => ({
    notesText: '',
    watermarkSwitch: false,
    watermarkText: 'CONFIDENTIAL',
    waitingExportToFinish: false,
    modExportTableEvents: 1, // 0 pdf , 1 excel
    itemsEventTypes: [],
    fileName: '',
  }),
  props: {
    numberOfTotalEvents: {
      type: Number,
      default: 0,
    },
    numberOfTotalCriticalEvents: {
      type: Number,
      default: 0
    },
    tabSelected: {
      type: Boolean,
      default: false,
    },
    clientsSelected: {
      type: Array,
      default: () => ([])
    },
    periodFilter: {
      default: null
    },
    osVersionFilter: {
      default: null
    },
    osTypeFilter: {
      default: null
    },
    criticalityFilter: {
      default: null
    },
    selectedDaysFilter: {
      default: null
    },
    eventTypesFilter: {
      default: null
    },
    serialNumbersFilter: {
      default: null
    },
  },
  created() {
    this.fetchEventTypes();
    if (Array.isArray(this.clientsSelected) && this.clientsSelected.length > 0)
      this.fileName = this.clientsSelected[0].companyName.replace(/\s/g, "_") + '_' + new Date().toISOString().substring(0, 10);
  },
  methods: {
    exportPdf() {
      this.$emit('exportPdf', {
        watermark: this.watermarkSwitch ? this.watermarkText : undefined,
        notes: this.notesText ? this.notesText : undefined,
        period: this.periodFilter,
        clientsSelected: this.clientsSelected,
        languageChosen: this.languageChosen,
        fileName: this.fileName,
        modExportTableEvents: this.modExportTableEvents === 0 ? 'PDF' : 'CSV',
        numberTotalEvents: this.numberOfTotalEvents,
        numberTotalCriticalEvents: this.numberOfTotalCriticalEvents,
        eventTypesSelectedText: !!this.eventTypesFilter ? this.eventTypesFilter.items.map(el =>
          this.getTranslation(this.itemsEventTypes.find(eventType => eventType.value === el).key)
        ) : undefined,
        filters: {
          osVersionFilter: this.osVersionFilter,
          osTypeFilter: this.osTypeFilter,
          criticalityFilter: this.criticalityFilter,
          selectedDaysFilter: this.selectedDaysFilter,
          eventTypesFilter: this.eventTypesFilter,
          serialNumbersFilter: this.serialNumbersFilter,
        }
      })
      this.waitingExportToFinish = true;
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    //nuova versione
    async fetchEventTypes() {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        const response = await apiService.axiosToBackend().get("/api/eventType");

        if (response?.data?.success) {
          this.itemsEventTypes = response.data.payload;
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    //vecchio versione
    async fetchEventTypes2() {
      axios.defaults.withCredentials = true;
      try {
        let response = await axios
          .get(process.env.VUE_APP_BASEURL + "/api/eventType", {})
        if (response?.data?.success)
          this.itemsEventTypes = response.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
  },
  watch: {
    numberOfTotalEvents(newVal) {
      if (newVal > 500)
        this.modExportTableEvents = 1;
    },
    tabSelected(newVal) {
      if (newVal) {
        this.notesText = '';
        this.watermarkSwitch = false;
        this.watermarkText = 'CONFIDENTIAL';
        this.waitingExportToFinish = false;
        if (Array.isArray(this.clientsSelected) && this.clientsSelected.length > 0)
          this.fileName = this.clientsSelected[0].companyName.replace(/\s/g, "_") + '_' + new Date().toISOString().substring(0, 10);
      }
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
    ,
    atLeastOneFilterSelected() {
      return !!this.osVersionFilter || !!this.osTypeFilter ||
        (!!this.criticalityFilter && Array.isArray(this.criticalityFilter) && this.criticalityFilter.length > 0) ||
        (!!this.selectedDaysFilter && Array.isArray(this.selectedDaysFilter) && this.selectedDaysFilter.length > 0);
    },
  }
}
</script>

<style>
.disable-button {
  pointer-events: none
}

.force-red-text .v-label--active {
  color: #f02929 !important;
  caret-color: #f02929 !important;
}

.force-red-text .v-icon {
  color: #f02929 !important;
  caret-color: #f02929 !important;
}
</style>
