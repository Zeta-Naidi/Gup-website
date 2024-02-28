<template>
  <v-dialog
    :v-model="localValue"
    persistent
    max-width="800"
  >
    <v-card style="border-color: #63adf2; border-style: solid">

      <v-card-title>
        <v-alert
          dense
          icon="mdi-export-variant"
          outlined
          prominent
          color="blue"
          type="info"
          style="width: 100%;"
        >
          {{ getTranslation('Export') }}
        </v-alert>
      </v-card-title>
      <v-tabs
        v-model="tab"
        background-color="transparent"
        color="primary"
        slider-size="2"
      >
        <v-tab
          v-for="(item, index) in items"
          :key="index"
          style="min-width: 33%"
        >
          {{ getTranslation(item) }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item
          :key="'pdf'"
        >
          <ExportPdfDialog
            v-if="tab === 0"
            :number-of-total-events="numberOfTotalEvents"
            :number-of-total-critical-events="numberOfTotalCriticalEvents"
            :osVersionFilter="osVersionFilter"
            :osTypeFilter="osTypeFilter"
            :criticalityFilter="criticalityFilter"
            :selectedDaysFilter="selectedDaysFilter"
            :eventTypesFilter="eventTypesFilter"
            :serialNumbersFilter="serialNumbersFilter"
            :clientsSelected="clientsSelected"
            :periodFilter="periodFilter"
            :tabSelected="tab === 0 && localValue"
            @exportPdf="(payload) => $emit('exportPdf', payload)"
            @close="$emit('close')"
          />
        </v-tab-item>

        <v-tab-item
          :key="'syslog'"
        >
          <ExportSyslogDialog
            v-if="tab === 1"
            :number-of-total-events="numberOfTotalEvents"
            :number-of-total-critical-events="numberOfTotalCriticalEvents"
            :osVersionFilter="osVersionFilter"
            :osTypeFilter="osTypeFilter"
            :criticalityFilter="criticalityFilter"
            :selectedDaysFilter="selectedDaysFilter"
            :eventTypesFilter="eventTypesFilter"
            :serialNumbersFilter="serialNumbersFilter"
            :clientsSelected="clientsSelected"
            :periodFilter="periodFilter"
            :tabSelected="tab === 1 && localValue"
            @close="$emit('close')"
          />
        </v-tab-item>

        <v-tab-item
          :key="'misp'"
        >
          <ExportMispDialog
            v-if="tab === 2"
            :number-of-total-events="numberOfTotalEvents"
            :number-of-total-critical-events="numberOfTotalCriticalEvents"
            :osVersionFilter="osVersionFilter"
            :osTypeFilter="osTypeFilter"
            :criticalityFilter="criticalityFilter"
            :selectedDaysFilter="selectedDaysFilter"
            :eventTypesFilter="eventTypesFilter"
            :serialNumbersFilter="serialNumbersFilter"
            :clientsSelected="clientsSelected"
            :periodFilter="periodFilter"
            :tabSelected="tab === 2 && localValue"
            @close="$emit('close')"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import ExportMispDialog from "@/components/home/dashboard/ExportMispDialog.vue";
import ExportSyslogDialog from "@/components/home/dashboard/ExportSyslogDialog.vue";
import ExportPdfDialog from "@/components/home/dashboard/ExportPdfDialog.vue";

export default {
  name: "ExportChoiceDialog",
  components: {
    ExportMispDialog,
    ExportSyslogDialog,
    ExportPdfDialog
  },
  data() {
    return {
      tab: 0,
      localValue: null,
      items: [
        'REPORT PDF', 'SYSLOG', 'MISP'
      ],
      periodFilter: null,
      osVersionFilter: null,
      osTypeFilter: null,
      criticalityFilter: null,
      selectedDaysFilter: null,
      eventTypesFilter: null,
      serialNumbersFilter: null,
      clientsSelected: null,
    }
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    bus: {
      type: Object,
      default: () => {
      }
    },
    numberOfTotalEvents: {
      type: Number,
      default: 0,
    },
    numberOfTotalCriticalEvents: {
      type: Number,
      default: 0
    }
  },
  created() {
    this.setPeriodFilterToLastWeek();
    this.bus.on("clientsSelected", (clientsSelected) => {
      this.clientsSelected = clientsSelected;
      this.clearFilters();
    })
    this.bus.on("periodFilter", (periodFilter) => {
      this.periodFilter = periodFilter
    });
    this.bus.on("osVersionFilter", (osVersionFilter) => {
      this.osVersionFilter = !!osVersionFilter ? osVersionFilter.toLowerCase() : undefined;
    });
    this.bus.on("osTypeFilter", (osTypeFilter) => {
      this.osTypeFilter = osTypeFilter.toLowerCase()
    });
    this.bus.on("removeOsFilters", () => {
      this.osTypeFilter = null;
      this.osVersionFilter = null;
    });
    /**
     * criticalityFilter = ['critic'?,'high'?,'medium'?,'low'?]
     */
    this.bus.on("criticalityFilter", (criticalityFilter) => {
      this.criticalityFilter = criticalityFilter
    });
    this.bus.on("selectedDaysFilter", (selectedDaysFilter) => {
      this.selectedDaysFilter = selectedDaysFilter;
    });
    this.bus.on("globalFilters", (globalFilters) => {
      this.eventTypesFilter = globalFilters.eventTypesFilter;
      this.serialNumbersFilter = globalFilters.serialNumbersFilter;
    });
  },
  methods: {
    clearFilters() {
      this.osVersionFilter = null;
      this.osTypeFilter = null;
      this.criticalityFilter = null;
      this.selectedDaysFilter = null;
      this.eventTypesFilter = null;
      this.serialNumbersFilter = null;
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    setPeriodFilterToLastWeek() {
      this.periodFilter = dateService.setPeriodComponentToLastWeek();
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>

</style>
