<template>
  <div ref="dashboard">
    <div class="align-center"
         :class="{'d-flex-wrap': $vuetify.display.xs || $vuetify.display.sm, 'd-flex': !$vuetify.display.xs && !$vuetify.display.sm}">
      <v-card
        elevation="2"
        :height="makeSpaceForSlider ? 100 : 50"
        :class="{'mb-2': true, 'pt-5': makeSpaceForSlider}"
        style="flex-grow: 1"
      >
        <RangePeriodSlider
          :class="{'pt-10': makeSpaceForSlider}"
          :bus="busEvents"
          @reduceFatherDivHeight="makeSpaceForSlider = false"
          @enlargeFatherDivHeight="makeSpaceForSlider = true"
        ></RangePeriodSlider>
      </v-card>
      <FiltersMenu
        v-model="isMenuOpen"
        :bus="busEvents"
        :fetcher="fetchItems"
        :style="{'flex-grow': $vuetify.display.xs || $vuetify.display.sm ? 1 : 0}"
        class="ml-1"
      ></FiltersMenu>
      <v-btn class="ml-1" :loading="loadingButtonExport" @click="pdfButtonClicked"
             :style="{'flex-grow': $vuetify.display.xs || $vuetify.display.sm ? 10 : 0}">
        Export
        <v-icon class="pl-3">
          mdi-export-variant
        </v-icon>
      </v-btn>
    </div>
    <v-row>
      <v-col cols="12" sm="4">
        <v-card elevation="2" :max-height="windowHeight > 1000 ? '45vh' : '500'">
          <v-card-title>
            <div class="d-flex align-center">
              <div class="filter-title mr-2">{{ getTranslation('CLIENTS_LIST') }}</div>
              <!--              <TooltipInfo
                              :itemsToPrint="[getTranslation('TOOLTIP_CLIENTS_LIST')]"
                            ></TooltipInfo>-->
              <v-spacer/>
              <div>
                <v-text-field
                  v-if="isSearchBoxClientShowed"
                  v-model="searchClientInTable"
                  style="width: 200px;"
                  append-inner-icon="mdi-magnify"
                  hide-details="always"
                  clearable
                ></v-text-field>
              </div>
            </div>
          </v-card-title>
          <!--          <Transition>
                      <div v-if="subtitleClientToBeSelected" class="filter-subtitle">
                        {{ getTranslation("SELECT_CLIENT_TO_SEE_DATA") }}*
                      </div>
                    </Transition>-->
          <ClientTable
            :bus="busEvents"
            :search="searchClientInTable"
            :windowHeight="windowHeight"
            @clientSelectedForSubtitle="subtitleClientToBeSelected = false"
            @hideSearchBox="isSearchBoxClientShowed = false"
            @showSearchBox="isSearchBoxClientShowed = true"
          ></ClientTable>
        </v-card>
      </v-col>


      <v-col cols="12" sm="8" class="px-0">
        <v-card elevation="2" :max-height="windowHeight > 1000 ? '45vh' : '500'">
          <v-card-title style="padding-bottom: 2px !important; padding-top: 10px !important;">
            <div class="filter-title mr-2">
              {{ getTranslation('EVENTS_LIST') }}
            </div>
            <!--            <TooltipInfo
                          :itemsToPrint="[getTranslation('TOOLTIP_EVENTS_LIST')]"
                        ></TooltipInfo>-->
          </v-card-title>
          <DataTable
            :bus="busEvents"
            :fetcher="fetchItems"
            :give-me-number-total-events="datatableGiveMeNumberTotalEvents"
            @numberTotalEvents="numberTotalEventsHandler"
            :windowHeight="windowHeight"
          ></DataTable>
        </v-card>
      </v-col>
    </v-row>
    <v-row dense class="mt-1">

      <v-col cols="12" sm="6">
        <v-card elevation="2" :max-height="windowHeight > 1000 ? '45vh' : '500'">
          <v-card-title style="padding-bottom: 2px !important; padding-top: 10px !important;">
            <div class="d-flex align-center">
              <div class="filter-title mr-2">{{ getTranslation('EVENTS_BY_DATE') }}</div>
              <!--              <TooltipInfo
                              :itemsToPrint="[getTranslation('TOOLTIP_EVENTS_BY_DATE1')
                                , getTranslation('TOOLTIP_EVENTS_BY_DATE2')
                                , getTranslation('TOOLTIP_EVENTS_BY_DATE3')]"
                            ></TooltipInfo>-->
            </div>
          </v-card-title>
          <EventsChart
            :bus="busEvents"
            :fetcher="fetchItems"
            :windowHeight="windowHeight"
          ></EventsChart>
        </v-card>
      </v-col>
      <v-col cols="12" sm="2">
        <v-card elevation="2" :max-height="windowHeight > 1000 ? '45vh' : '500'">
          <v-card-title style="padding-bottom: 2px !important; padding-top: 10px !important;">
            <div class="filter-title mr-2">{{ getTranslation('SEVERITY_FILTERS') }}</div>
            <!--            <TooltipInfo
                          :itemsToPrint="[getTranslation('TOOLTIP_SEVERITY_FILTERS1'),
                           getTranslation('TOOLTIP_SEVERITY_FILTERS2'),
                           getTranslation('TOOLTIP_SEVERITY_FILTERS3')]"
                        ></TooltipInfo>-->
          </v-card-title>
          <SeverityFilter
            :bus="busEvents"
            :fetcher="fetchItems"
            :windowHeight="windowHeight"
            @amountCriticalEvents="amountCriticalEvents = $event"
          ></SeverityFilter>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card elevation="2" :max-height="windowHeight > 1000 ? '45vh' : '500'">
          <v-card-title style="padding-bottom: 2px !important; padding-top: 10px !important;"
                        class="d-flex align-center">
            <div class="filter-title mr-2">{{ getTranslation('EVENTS_BY_OS_VERSION') }}</div>
            <!--            <TooltipInfo
                          :itemsToPrint="[getTranslation('TOOLTIP_OSVERSION1'),
                           getTranslation('TOOLTIP_OSVERSION2'),
                           getTranslation('TOOLTIP_OSVERSION3')]"
                        ></TooltipInfo>-->
            <v-spacer></v-spacer>
            <!--            <v-select
                          v-model="versionSelector"
                          v-if="itemsSelectorSunburstChart.length > 0"
                          class="pt-0 mt-0"
                          :label="getTranslation('VERSION')"
                          hide-details="auto"
                          style="max-width: 145px"
                          color="primary"
                          @input="selectedVersionFromParent = versionSelector"
                          :items="itemsSelectorSunburstChart"
                          item-value="name"
                        >
                          <template v-slot:selection="{ item }">
                            <div class="d-flex align-center">
                              <v-icon :color="getColorIconOsType(item.osType)" class="pr-1">
                                {{ getNameIconOsType(item.osType)  }}
                              </v-icon>
                              {{ '"' + item.name + '"' + ': ' + item.value}}
                            </div>
                          </template>
                          <template v-slot:item="{ item }">
                            <div class="d-flex align-center">
                              <v-icon :color="getColorIconOsType(item.osType)" class="pr-1">
                                {{ getNameIconOsType(item.osType) }}
                              </v-icon>
                              {{ '"' + item.name + '"' + ': ' + item.value}}
                            </div>
                          </template>
                        </v-select>-->
          </v-card-title>
          <SunburstChart
            :bus="busEvents"
            :fetcher="fetchItems"
            :windowHeight="windowHeight"
            @selectedVersion="(payload) => {
              itemsSelectorSunburstChart = payload.newItems;
              if(!payload.onlyItems)
                versionSelector=payload.selectedVersion
            }"
            :selectVersionFromParent="selectedVersionFromParent"
          ></SunburstChart>
        </v-card>
      </v-col>
    </v-row>
    <!--    <div style="background-color: white !important;" v-if="loadingButtonExport">
          <LinearNetworkActivities :bus="busEvents"></LinearNetworkActivities>
          <PieAppUsages :bus="busEvents"></PieAppUsages>
          <PieEventsPerOS :bus="busEvents"></PieEventsPerOS>
          <BarEventsPerOs :bus="busEvents"></BarEventsPerOs>
          <LinearEventsPerNotificationType :bus="busEvents"></LinearEventsPerNotificationType>
        </div>-->
        <ExportChoiceDialog
          v-if="true"
          v-model="pdfDialogOpened"
          :bus="busEvents"
          :number-of-total-events="numberOfTotalEvents"
          :number-of-total-critical-events="amountCriticalEvents"
          @exportPdf="(payload) => callChildrenToSendRootGraph(payload)"
          @close="pdfDialogOpened = false; loadingButtonExport= false;"
        ></ExportChoiceDialog>
  </div>
</template>


<script>
//Dashboard components
import DataTable from "@/components/home/dashboard/DataTable";
import SunburstChart from "@/components/home/dashboard/SunburstChart";
import EventsChart from "@/components/home/dashboard/EventsChart";
import SeverityFilter from "@/components/home/dashboard/SeverityFilter.vue";
import RangePeriodSlider from "@/components/home/dashboard/RangePeriodSlider";
import FiltersMenu from "@/components/home/dashboard/FiltersMenu";
import ClientTable from "@/components/home/dashboard/ClientTable";
import ExportChoiceDialog from "@/components/home/dashboard/ExportChoiceDialog.vue";
//Utilities
import axios from "axios";
import TooltipInfo from "@/components/common/TooltipInfo";
import translateService from "@/globalServices/translate";
import exportService from "@/globalServices/exportService";
//ExportPdfComponents
//import BarEventsPerOs from "@/components/chartsForExport/BarEventsPerOs.vue";
//import LinearEventsPerNotificationType from "@/components/chartsForExport/LinearEventsPerNotificationType.vue"
//import PieEventsPerOS from "@/components/chartsForExport/PieEventsPerOS.vue";
//import PieAppUsages from "@/components/chartsForExport/PieAppUsages.vue"
//import LinearNetworkActivities from "@/components/chartsForExport/LinearNetworkActivities.vue"
//Global components
import deviceService from "@/globalServices/deviceService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import mitt from "mitt";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";
//Packages for websockets KEEP COMMENT

export default {
  name: "Dashboard",
  components: {
    ExportChoiceDialog,
    EventsChart,
    DataTable,
    SunburstChart,
    SeverityFilter,
    RangePeriodSlider,
    ClientTable,
    FiltersMenu,
    TooltipInfo,
     //  BarEventsPerOs,
    /*   LinearEventsPerNotificationType,
      PieEventsPerOS,
      PieAppUsages,
      LinearNetworkActivities*/
  },

  data: () => ({
    isMenuOpen: false,
    busEvents: mitt(),
    dialog: false,
    heightCardDataTable: 500,
    clientSectionToggle: 1,
    makeSpaceForSlider: false,
    listSerialNumbers: [],
    subtitleClientToBeSelected: true,
    rootGraphsArrived: 0,
    rootsChildrenGraphs: [],
    dataChildrenGraphs: new Map(),
    loadingButtonExport: false,
    pdfDialogOpened: false,
    errorDialogOpened: false,
    errorMessage: '',
    datatableGiveMeNumberTotalEvents: false,
    numberOfTotalEvents: 0,
    amountCriticalEvents: 0,
    searchClientInTable: '',
    isSearchBoxClientShowed: true,
    itemsSelectorSunburstChart: [],
    versionSelector: undefined,
    selectedVersionFromParent: undefined,
  }),
  props: {
    windowHeight: {
      type: Number,
    }
  },
  mounted() {
    /* KEEP COMMENT
    npm i laravel-echo
      let echo = new Echo({
          broadcaster: "pusher",
          key: process.env.VUE_APP_WEBSOCKETS_KEY,
          wsHost: "127.0.0.1",
          wsPort: 6001,
          forceTLS: false,
          //cluster: "mt1",
          disableStats: true,
          namespace: ''
        });
        let nameChannel = 'newEvents.' + this.$store.state.userModule.userCredentials.id
        echo.private(nameChannel)
          .listen('prova', (e) => {<
            console.log('PROVA', e);
          })
        ;*/
    this.busEvents.on('hereMyRootHiddenFather', (exportDTO) => {
      this.rootsChildrenGraphs.push({root: exportDTO.root, chartType: exportDTO.data.chartType});
      this.rootGraphsArrived++;
      if (this.rootGraphsArrived === 5) {
        this.exportPdf();
      }
    })
  },
  methods: {
    resolveEvent(item) {
      this.eventDisplayed = item;
      this.dialog = true;
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    pdfButtonClicked() {
      this.datatableGiveMeNumberTotalEvents = true;
      this.loadingButtonExport = true;
      this.pdfDialogOpened = true;
    },
    numberTotalEventsHandler(numberOfEvents) {
      this.numberOfTotalEvents = numberOfEvents;
      this.datatableGiveMeNumberTotalEvents = false;
    },
    /**
     * @param payloadFromExportPdfDialog
     * @returns {Promise<void>}
     */
    async callChildrenToSendRootGraph(payloadFromExportPdfDialog) {
      this.rootsChildrenGraphs = [];
      this.dataChildrenGraphs = new Map();
      this.rootGraphsArrived = 0;
      let paramsToPromises = {
        clientsFilter: payloadFromExportPdfDialog.clientsSelected,
        periodFilter: payloadFromExportPdfDialog.period,
        ...payloadFromExportPdfDialog.filters
      };
      this.listSerialNumbers = await this.fetchSerialNumbersFromEventsFiltered(paramsToPromises);
      this.dataChildrenGraphs.set('numberOfDevices', this.listSerialNumbers.length);
      this.dataChildrenGraphs.set('optionsFromDialog', payloadFromExportPdfDialog);
      let promisesToDo = [
        await this.fetchAppUsage(paramsToPromises),
        await this.fetchNetworkActivity(paramsToPromises),
        await this.fetchEventsByEventType(paramsToPromises),
        await this.fetchEventsByDateByOS(paramsToPromises),
        await this.fetchEventsByOS(paramsToPromises),
      ];
      if (payloadFromExportPdfDialog.modExportTableEvents === 'PDF')
        promisesToDo.push(this.fetchItems({
          withDevice: true,
          withEventType: !!paramsToPromises.eventTypesFilter ? undefined : true,
          clientIds: paramsToPromises.clientsFilter.map((el) => el.id),
          period: paramsToPromises.periodFilter,
          deviceOsVersion: paramsToPromises.osVersionFilter,
          deviceOsType: paramsToPromises.osTypeFilter,
          serialNumbers: paramsToPromises.serialNumbersFilter,
          eventTypes: paramsToPromises.eventTypesFilter,
          selectedDays: paramsToPromises.selectedDaysFilter,
          criticality: paramsToPromises.criticalityFilter,
          selectAttributes: ['event_types.key', 'deviceSerialNumber', 'devices.osType as deviceOsType', 'detectionDate', 'hasBeenSolved', 'score', 'description']
        }))
      //Setting data
      await Promise.all(promisesToDo).then((values) => {
        try {
          this.dataChildrenGraphs.set('appUsages', {items: values[0].data.payload})
          this.dataChildrenGraphs.set('networkActivities', {items: values[1].data.payload})
          this.dataChildrenGraphs.set('eventsByEventType', {items: this.clearItemsForEventTypePdfChart(values[2].data.payload.rows)})
          this.dataChildrenGraphs.set('eventsByDateByOs', {items: this.clearItemsForEventByDateByOsPdfChart(values[3].data.payload.rows)})
          this.dataChildrenGraphs.set('sunburst', {items: this.clearItemsForEventByOsPdfChart(values[4].data.payload.rows)})
          if (!!values[5])
            this.dataChildrenGraphs.set('listEvents', {items: values[5].rows})
        } catch (e) {
          console.log(e);
          this.dataChildrenGraphs.set('networkActivities', {items: []})
          this.dataChildrenGraphs.set('appUsages', {items: []})
          this.dataChildrenGraphs.set('eventsByEventType', {items: []})
          this.dataChildrenGraphs.set('eventsByDateByOs', {items: []})
          this.dataChildrenGraphs.set('sunburst', {items: []})
          this.dataChildrenGraphs.set('listEvents', {items: []})
        }
      })
        .catch(err => {
          console.log(err)
          this.dataChildrenGraphs.set('networkActivities', {items: []})
          this.dataChildrenGraphs.set('appUsages', {items: []})
          this.dataChildrenGraphs.set('eventsByEventType', {items: []})
          this.dataChildrenGraphs.set('eventsByDateByOs', {items: []})
          this.dataChildrenGraphs.set('sunburst', {items: []})
          this.dataChildrenGraphs.set('listEvents', {items: []})
        })
      const dataToBeRendered = this._generateDtoForExportPDf();
      this.busEvents.emit('hiddenChildSendMeYourRoot', dataToBeRendered);
    },
    async exportPdf() {
      try {
        await exportService.exportToPdf(this.rootsChildrenGraphs, this.dataChildrenGraphs);
        setTimeout(() => {
          this.pdfDialogOpened = false
          this.loadingButtonExport = false;
        }, 1500);
      } catch (e) {
        console.log(e);
        this.errorMessage = e.message;
        this.pdfDialogOpened = false
        this.loadingButtonExport = false;
      }
    },
    clearItemsForEventTypePdfChart(itemsToClear) {
      let eventsPerNotification = [];
      let eventsPerNotificationHashTable = new Map();
      for (const item of itemsToClear) {
        if (!eventsPerNotificationHashTable.get(item.date)) {
          let obj = {};
          obj[item.type] = item.num;
          eventsPerNotificationHashTable.set(item.date, obj);
        } else {
          let obj = eventsPerNotificationHashTable.get(item.date);
          obj[item.type] = !!obj[item.type] ? obj[item.type] + item.num : item.num;
        }
      }
      eventsPerNotificationHashTable.forEach((value, key) => {
        let obj = value;
        obj.date = key;
        eventsPerNotification.push(obj);
      })
      return eventsPerNotification;
    },
    clearItemsForEventByDateByOsPdfChart(itemsToClear) {
      let eventsPerOS = [];
      let eventsPerOsHashTable = new Map();
      for (const item of itemsToClear) {
        if (!eventsPerOsHashTable.get(item.date)) {
          let obj = {};
          obj[item.osType] = item.num;
          eventsPerOsHashTable.set(item.date, obj);
        } else {
          let obj = eventsPerOsHashTable.get(item.date);
          obj[item.osType] = !!obj[item.osType] ? obj[item.osType] + item.num : item.num;
        }
      }
      eventsPerOsHashTable.forEach((value, key) => {
        let obj = value;
        obj.date = key;
        eventsPerOS.push(obj);
      })
      return eventsPerOS;
    },
    clearItemsForEventByOsPdfChart(itemsToClear) {
      return {
        androidItems: itemsToClear.android,
        iosItems: itemsToClear.ios,
        windowsItems: itemsToClear.windows,
        osxItems: itemsToClear.osx,
      };
    },
    /**
     * @param {Array} dataTableItems
     * @private
     */
    _generateDtoForExportPDf() {
      return {
        eventsPerNotification: this.dataChildrenGraphs.get('eventsByEventType').items,
        eventsPerOSByDate: this.dataChildrenGraphs.get('eventsByDateByOs').items,
        eventsPerOS: this.dataChildrenGraphs.get('sunburst').items,
        appUsages: this.dataChildrenGraphs.get('appUsages').items,
        networkActivities: this.dataChildrenGraphs.get('networkActivities').items,
      }
    },
    async fetchAppUsage(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/appUsage", {
          params: {
            filters: JSON.stringify({
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              serialNumbers: filters.serialNumbersFilter,
            })
          }
        });

        return response.data;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchNetworkActivity(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/networkActivity", {
          params: {
            filters: JSON.stringify({
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              serialNumbers: filters.serialNumbersFilter,
            })
          }
        });

        return response.data;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchEventsByEventType(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/event", {
          params: {
            filters: JSON.stringify({
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              deviceOsVersion: filters.osVersionFilter,
              deviceOsType: filters.osTypeFilter,
              serialNumbers: filters.serialNumbersFilter,
              eventTypes: filters.eventTypesFilter,
              selectedDays: filters.selectedDaysFilter,
              criticality: filters.criticalityFilter,
              withDevice: true,
              onlyNumericData: true,
              groupBy: ['detectionDate', 'type'],
              selectAttributes: ['DATE(detectionDate) as date', 'type'],
              orderBy: [{attribute: 'detectionDate', order: 'asc'}],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          }
        });

        return response.data;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchEventsByDateByOS(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/event", {
          params: {
            filters: JSON.stringify({
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              deviceOsVersion: filters.osVersionFilter,
              deviceOsType: filters.osTypeFilter,
              serialNumbers: filters.serialNumbersFilter,
              eventTypes: filters.eventTypesFilter,
              selectedDays: filters.selectedDaysFilter,
              criticality: filters.criticalityFilter,
              withDevice: true,
              onlyNumericData: true,
              groupBy: ['detectionDate', 'osType'],
              selectAttributes: ['DATE(detectionDate) as date', 'osType'],
              orderBy: [{attribute: 'detectionDate', order: 'asc'}],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          }
        });

        return response.data;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchEventsByOS(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/event", {
          params: {
            filters: JSON.stringify({
              withDevice: true,
              groupBy: ['eventsPerSunburstChart'],
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              deviceOsVersion: filters.osVersionFilter,
              deviceOsType: filters.osTypeFilter,
              serialNumbers: filters.serialNumbersFilter,
              eventTypes: filters.eventTypesFilter,
              selectedDays: filters.selectedDaysFilter,
              criticality: filters.criticalityFilter,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          }
        });

        return response.data;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchSerialNumbersFromEventsFiltered(filters) {
      axios.defaults.withCredentials = true;
      this.isLoading = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/event", {
          params: {
            filters: JSON.stringify({
              withDevice: true,
              clientIds: filters.clientsFilter.map(el => el.id),
              period: filters.periodFilter,
              deviceOsVersion: filters.osVersionFilter,
              deviceOsType: filters.osTypeFilter,
              serialNumbers: filters.serialNumbersFilter,
              eventTypes: filters.eventTypesFilter,
              selectedDays: filters.selectedDaysFilter,
              criticality: filters.criticalityFilter,
              selectAttributes: ['osVersion', 'osType', 'deviceSerialNumber', 'count(*)'],
              groupBy: ['osVersion', 'osType', 'deviceSerialNumber'],
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          }
        });

        return response.data.payload.rows;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * load items displayed in table TODO update
     * @param {Object} filters
     * @param {boolean} [filters.countScoreInterval] - if set to true, api will return number of events per category
     * @param {boolean} [filters.withDevice] - if set to true, api will return device linked for each event
     * @param {string} [filters.deviceOsType] - osType of the event, selectable from: android, ios, windows
     * @param {number[]} [filters.clientIds] - ids of clients
     * @param {string[]} [filters.groupBy] - group by osVersion, osType
     * @return {Object[]} events returned
     */
    async fetchItems(filters) {
      this.isLoading = true;
      let items = [];
      try {
        if (filters.clientIds.length === 0) {
          this.isLoading = false;
          return 'DONT_CALL_SERVER';
        }

        let response = await apiService.axiosToBackend().get("/api/event", {
          params: {
            filters: JSON.stringify(filters)
          }
        });

        if (response?.data?.success) {
          items = response.data.payload;
        }
        return items;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
    getNameIconOsType(value) {
      if (!value) return '';
      return deviceService.getNameIconOsType(value.toLowerCase());
    },
    getColorIconOsType(osName) {
      if (!osName) return '';
      return deviceService.getColorIconOsType(osName.toLowerCase());
    }
  },
  watch: {},
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
};

</script>

<style scoped>
.filter-title {
  height: 32px;
  font-size: 24px;
  font-weight: 500;
  color: #63adf2;
  text-decoration: none solid rgb(99, 173, 242);
  line-height: 32px;
}

.filter-subtitle {
  width: 388px;
  height: 20px;
  font-size: 16px;
  color: #63adf2;
  text-decoration: none solid rgb(99, 173, 242);
  line-height: 24px;
  padding-left: 16px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
