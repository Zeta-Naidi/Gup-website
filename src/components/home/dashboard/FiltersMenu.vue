<template>
  <div>
    <v-menu min-width="800" :close-on-content-click="false" v-model="isMenuOpen">
      <template v-slot:activator="{ props }">
        <div class="d-flex fake-button align-center"
             v-bind="props"

        >
          <div class="filter-title ml-5">{{ getTranslation('GLOBAL_FILTERS') }}</div>
          <v-badge
            bordered
            color="#63adf2"
            :offset-y="numberFiltersActive > 0 ? 20 : -120"
            offset-x="20"
            :content="numberFiltersActive"
          >
            <v-btn
              plain
              icon
              class="mr-3"
            >
              <v-icon>
                mdi-filter
              </v-icon>
            </v-btn>
          </v-badge>
        </div>

      </template>
      <v-card elevation="24" style="border-color: #63adf2 ; border-style: solid">
        <v-card-title class="d-flex align-center">
          <div class="filter-title">
            {{ getTranslation('GLOBAL_FILTERS') }}
          </div>
          <v-spacer></v-spacer>
          <v-icon style="color: red; cursor: pointer" @click="closeMenu">
            mdi-close
          </v-icon>
        </v-card-title>
        <v-card-text style="min-height:315px;">
          <div class="d-flex align-center mb-2">
            <v-autocomplete
              v-model="filterTableEventType"
              :items="eventTypes"
              :label="getTranslation('EVENT_TYPES')"
              v-model:search-input="searchEventTypeString"
              filled
              outlined
              hide-details="auto"
              :item-text="eventTypeText"
              item-title="key"
              item-value="value"
              multiple
              style="margin-right: 5px; max-width: 60%"
            >
              <template v-slot:selection="{item}">
                <v-chip
                  close
                  color="primary"
                  @click:close="removeEventTypeFilter(item)"
                >
                  {{ eventTypeText(item.raw) }}
                </v-chip>
              </template>
            </v-autocomplete>
            <v-switch
              v-model="filterSwitchEventType"
              :label="!!filterSwitchEventType ? getTranslation('SELECTED_INCLUDED') : getTranslation('SELECTED_EXCLUDED')"
            ></v-switch>
          </div>
          <v-divider class="my-2" />
          <div class="d-flex align-center">
            <div class="d-flex-wrap align-center mr-2" style="min-width: 60%">
              <v-autocomplete
                v-model="filterTableSerialNumber"
                :items="serialNumbers"
                :label="getTranslation('DEVICE_SERIALS')"
                :filter="customFilter"
                :item-text="deviceText"
                item-value="serialNumber"
                item-title="osType"
                v-model:search-input="searchSerialNumberString"
                return-object
                filled
                outlined
                hide-details="auto"
                multiple
              >
                <template v-slot:selection="{item}">
                  <v-chip
                    close
                    color="grey"
                    @click:close="removeSerialNumberFilter(item)"
                  >
                    <div class="d-flex align-center">
                      <v-icon :color="getColorIconOsType(item.osType)" class="pr-1">
                        {{ getNameIconOsType(item.raw) }}
                      </v-icon>
                      {{ item.name ??  item.serialNumber }}
                    </div>
                  </v-chip>
                </template>
                <template v-slot:item="{item}">
                  <div class="d-flex align-center">
                    <v-icon :color="getColorIconOsType(item.osType)" class="pr-1">
                      {{ getNameIconOsType(item.raw) }}
                    </v-icon>
                    {{ deviceText(item.raw)}}
                  </div>
                </template>
              </v-autocomplete>
            </div>
            <v-switch
              v-model="filterSwitchSerialNumber"
              :label="!!filterSwitchSerialNumber ? getTranslation('SELECTED_INCLUDED') : getTranslation('SELECTED_EXCLUDED')"
            ></v-switch>
          </div>
          <v-divider class="my-2" />

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="#6c757d"
            @click="clearFilters(true)"
            :loading="loadingItems"

          >
            {{ getTranslation('RESET_FILTERS') }}
          </v-btn>
          <v-btn
            color="primary"
            @click="applyTableFilters"
            :loading="loadingItems"
          >
            {{ getTranslation('APPLY') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import axios from "axios";
import dateService from "@/globalServices/dateService";
import deviceService from "@/globalServices/deviceService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";

export default {
  name: "FiltersMenu",
  components: {},
  data: () => ({
    eventTypes: [],
    filterSwitchEventType: true,
    filterSwitchSerialNumber: true,
    filterSwitchDevicesGroups: true,
    filterTableEventType: [],
    filterTableSerialNumber: [],
    filterTableDevicesGroups: [],
    filterTableEventTypeWhenOpenedMenu: [],
    filterTableSerialNumberWhenOpenedMenu: [],
    filterTableDevicesGroupsWhenOpenedMenu: [],
    changesAreValid: false,
    numberFiltersActive: 0,
    isMenuOpen: false,
    serialNumbers: [],
    devicesGroups: [],
    clientsFilter: undefined,
    searchSerialNumberString: '',
    searchEventTypeString: '',
    searchDevicesGroup: '',
    periodFilter: undefined,
    osVersionFilter: undefined,
    osTypeFilter: undefined,
    selectedDaysFilter: undefined,
    criticalityFilter: undefined,
    queueForCalls: [],
    loadingItems: false,
    loadingGroupsDevices: false,
    groupsFetchedForClients: [],
  }),
  props: {
    bus: {
      type: Object,
      default: () => {
      }
    },
    fetcher: {
      type: Function,
      default: () => {
      }
    }
  },
  mounted() {
    this.periodFilter = dateService.setPeriodComponentToLastWeek();
    this.bus.on("clientsSelected", (clientsSelected) => {
      this.clearFilters();
      this.clientsFilter = clientsSelected;
      this.pushInQueue();
    });
    this.bus.on("periodFilter", (periodFilter) => {
      this.periodFilter = periodFilter;
      if (!!this.clientsFilter)
        this.pushInQueue();
    });
    this.bus.on("osVersionFilter", (osVersionFilter) => {
      this.osVersionFilter = !!osVersionFilter ? osVersionFilter.toLowerCase() : undefined;
      this.pushInQueue();
    });
    this.bus.on("osTypeFilter", (osTypeFilter) => {
      this.osTypeFilter = osTypeFilter.toLowerCase()
      this.pushInQueue();
    });
    this.bus.on("removeOsFilters", () => {
      this.osTypeFilter = undefined;
      this.osVersionFilter = undefined;
      this.pushInQueue();
    });
    this.bus.on("selectedDaysFilter", (selectedDaysFilter) => {
      this.selectedDaysFilter = selectedDaysFilter;
      this.pushInQueue();
    });
    this.bus.on("criticalityFilter", (criticalityFilter) => {
      this.criticalityFilter = criticalityFilter
      this.pushInQueue();
    });
  },
  methods: {
    closeMenu() {
      this.isMenuOpen = false;
    },
    deviceText(item) {
      return item.name ? item.name + ' - ' + item.serialNumber : item.serialNumber;
    },
    eventTypeText(el) {
      return el.key + '-'
    },
    pushInQueue() {
      this.queueForCalls.push({
        clientIds: this.clientsFilter.map((el) => el.id),
        withDevice: true,
        deviceOsVersion: this.osVersionFilter,
        deviceOsType: this.osTypeFilter,
        period: this.periodFilter,
        selectedDays: this.selectedDaysFilter,
        criticality: this.criticalityFilter,
        groupBy: ['serialNumber', 'name', 'osType', 'osVersion'],
        selectAttributes: ['serialNumber', 'name', 'osType', 'osVersion'],
        orderBy: [{attribute: 'name', order: 'asc'}],
        eventTypesIncluded: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      if (!this.loadingItems)
        this.fetchDevicesAndEventTypes(this.queueForCalls.pop());
    },
    removeEventTypeFilter(item) {
      this.filterTableEventType = this.filterTableEventType.filter(el => el !== item.value);
    },
    removeSerialNumberFilter(item) {
      this.filterTableSerialNumber = this.filterTableSerialNumber.filter(el => el.serialNumber !== item.serialNumber);
    },
    removeGroupDeviceFilter(item) {
      this.filterTableDevicesGroups = this.filterTableDevicesGroups.filter(el => el.name !== item.name);
    },
    applyTableFilters() {
      this.bus.emit('globalFilters', {
        eventTypesFilter: this.filterTableEventType.length > 0 ?
          {
            items: this.filterTableEventType,
            include: this.filterSwitchEventType,
          }
          : undefined,
        serialNumbersFilter: (this.filterTableSerialNumber.length > 0 || this.filterTableDevicesGroups.length > 0) ?
          {
            items: [
              ...new Set(
                this.filterTableSerialNumber.map(el => el.serialNumber).concat(
                  ...this.filterTableDevicesGroups.map(el => el.devices))
              )
            ],
            include: this.filterSwitchSerialNumber
          }
          : undefined
      });
      this.numberFiltersActive = this.filterTableSerialNumber.length + this.filterTableEventType.length + this.filterTableDevicesGroups.length;
      this.changesAreValid = true;
      this.isMenuOpen = false;
    },

    clearFilters(fromButtonClicked = false) {
      this.numberFiltersActive = 0;
      this.filterTableEventType = [];
      this.filterTableSerialNumber = [];
      this.filterTableDevicesGroups = [];
      this.filterSwitchSerialNumber = true;
      this.filterSwitchEventType = true;
      this.osVersionFilter = null;
      this.osTypeFilter = null;
      this.criticalityFilter = null;
      this.selectedDaysFilter = null;
      if (fromButtonClicked) {
        this.changesAreValid = true;
        this.bus.emit('globalFilters', {
          eventTypesFilter: undefined,
          serialNumbersFilter: undefined
        });
      }
      this.isMenuOpen = false;
    },

    getNameIconOsType(item) {
      return deviceService.getNameIconOsType(item.osType);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    getEventTypeIcon(eventType) {
      return deviceService.getIconByEventType(eventType);
    },
    fetchDevicesAndEventTypes(filters) {
      this.loadingItems = true
      this.fetcher(filters).then((items) => {
        if (this.queueForCalls.length > 0) {
          this.fetchDevicesAndEventTypes(this.queueForCalls.pop());
          this.queueForCalls = [];
        } else {
          if (items === 'DONT_CALL_SERVER') {
            this.serialNumbers = []
            this.eventTypes = []
          } else {
            this.serialNumbers = items.rows
            this.eventTypes = items.eventTypesIncluded;
          }
          this.loadingItems = false;
        }
      })
        .catch((err) => {
          console.log(err)
          this.loadingItems = false
        });
    },
    async fetchDeviceGroups() {
      axios.defaults.withCredentials = true;
      try {
        this.loadingGroupsDevices = true;
        let response = await apiService.axiosToBackend().get("/api/device/groups", {
          params: {
            filters: JSON.stringify({
              clients: this.clientsFilter.map(el => el.id)
            })
          }
        });

        if (response?.data?.success) {
          this.devicesGroups = response.data.payload;
          this.groupsFetchedForClients = this.clientsFilter.map(el => el.id);
        }
      } catch (err) {
        utilsFunctions.handleServerResponseException(err);
      } finally {
        this.loadingGroupsDevices = false;
      }

    },
    customFilter(item, queryText) {
      const searchText = queryText.toLowerCase();
      const nameMatch = !!item.name ? item.name.toLowerCase().includes(searchText) : '';
      const serialNumberMatch = item.serialNumber.toLowerCase().includes(searchText);
      return nameMatch || serialNumberMatch;
    },
    watch: {
      filterTableEventType(newVal, oldVal) {
        if (newVal.length > oldVal.length)
          this.searchEventTypeString = '';
      },
      filterTableSerialNumber(newVal, oldVal) {
        if (newVal.length > oldVal.length)
          this.searchSerialNumberString = '';
      },
      isMenuOpen(newVal) {
        if (newVal) {
          this.changesAreValid = false
          this.filterTableSerialNumberWhenOpenedMenu = this.filterTableSerialNumber;
          this.filterTableDevicesGroupsWhenOpenedMenu = this.filterTableDevicesGroups;
          this.filterTableEventTypeWhenOpenedMenu = this.filterTableEventType;
          if (!utilsFunctions.arraysAreEqual(this.groupsFetchedForClients, this.clientsFilter.map(el => el.id))) {
            this.fetchDeviceGroups();
          }
        } else {
          if (!this.changesAreValid) {
            this.filterTableSerialNumber = this.filterTableSerialNumberWhenOpenedMenu;
            this.filterTableDevicesGroups = this.filterTableDevicesGroupsWhenOpenedMenu;
            this.filterTableEventType = this.filterTableEventTypeWhenOpenedMenu;
          }
        }
      }
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>
.filter-title {
  height: 32px;
  font-size: 22px;
  font-weight: 500;
  color: #63adf2;
  text-decoration: none solid rgb(99, 173, 242);
  line-height: 32px;
}

.fake-button {
  background-color: #272727 !important;
  border-radius: 8px !important;
}

.fake-button:hover {
  background-color: #3d3d3d !important;
}
</style>
