<template>
  <div class="d-flex align-center">
    <div class="filter-title">{{ getTranslation('EVENTS_LIST') }}</div>
    <div style="max-width: 300px">
      <v-progress-linear
        color="primary"
        buffer-value="0"
        stream
      ></v-progress-linear>
    </div>
    <v-spacer/>
    <v-menu offset-y :close-on-content-click="false">
      <template v-slot:activator="{ props }">
        <v-btn
          icon
          v-bind="props"
        >
          <v-icon>
            mdi-cog-outline
          </v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <div class="d-flex align-center">
            {{ getTranslation('CRITICAL_EVENTS_NOTIFICATIONS') }}
            <v-switch
              v-model="notificationsCritic"
              class="ml-1"
              hide-details="auto"
              color="primary"
            ></v-switch>
          </div>
        </v-list-item>
        <v-list-item>
          <div class="d-flex align-center">
            {{ getTranslation('HIGH_EVENTS_NOTIFICATIONS') }}
            <v-switch
              v-model="notificationsHigh"
              class="ml-1"
              hide-details="auto"
              color="primary"
            ></v-switch>
          </div>
        </v-list-item>
        <v-list-item v-if="appMod === 'development'" class="d-flex">
          <v-list-item-title>{{ getTranslation('CHANGE_MOD_FROM_DEV_TO_PROD') }}</v-list-item-title>
          <v-switch
            v-model="modality"
            hide-details="auto"
            color="primary"
            prepend-icon="mdi-test-tube"
            append-icon="mdi-test-tube-off"
          ></v-switch>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
  <LiveDataTable
    :dynamic-height="windowHeight > 1000 ? 1000 : 700"
    :new-items="tableItems"
    :new-items-to-update="tableItemsToUpdate"
    :pageSelected.sync="pageSelectedInTable"
    :itemsPerPage.sync="itemsPerPageInTable"
    @rowClicked="rowLiveDataTableClicked"
    @resolveEvent="itemRepairDialog = $event; repairDialogOpened = true;"
  ></LiveDataTable>
  <CriticAlertDialog
    :value="criticAlertDialogOpened"
    :items="criticItems"
    @close="criticAlertDialogOpened = false"
    @resolveEvent="itemRepairDialog = $event; repairDialogOpened = true;"
    @manualRepair="redirectToChimpa"
  ></CriticAlertDialog>
  <DetailEventDialogOperations
    :value="detailEventDialogOpened"
    :items="detailEventDialogItems"
    :index-item-selected="detailEventDialogIndexItemSelected"
    :new-items-inserted="newItemsInserted"
    @close="detailEventDialogOpened = false"
    @resolveEvent="itemRepairDialog = $event; repairDialogOpened = true;"
    @manualRepair="redirectToChimpa"
  ></DetailEventDialogOperations>
  <RepairDialog
    :value="repairDialogOpened"
    :item="itemRepairDialog"
    @close="repairDialogOpened = false"
    @eventResolved="updateEventInTable($event);repairDialogOpened= false;"
  ></RepairDialog>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";

import LiveDataTable from "@/components/home/operations/LiveDataTable.vue";
import CriticAlertDialog from "@/components/home/operations/CriticAlertDialog";
import DetailEventDialogOperations from "@/components/home/operations/DetailEventDialogOperations";
import RepairDialog from "@/components/common/RepairDialog.vue";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import GlobalEventsHandler from "@/globalServices/GlobalEventsHandler";

export default {
  name: "StatisticAnalysis",
  components: {
    LiveDataTable,
    CriticAlertDialog,
    DetailEventDialogOperations,
    RepairDialog,
  },
  data: () => ({
    dialog: false,
    eventDisplayed: undefined,
    criticAlertDialogOpened: false,
    snackbarHighEvents: false,
    criticItems: undefined,
    highItems: undefined,
    tableItems: [],
    tableItemsToUpdate: [],
    newItemsFromServer: undefined,
    notificationsHigh: true,
    notificationsCritic: true,
    detailEventDialogOpened: false,
    detailEventDialogItems: [],
    detailEventDialogIndexItemSelected: undefined,
    repairDialogOpened: false,
    itemRepairDialog: undefined,
    lastDateFetched: undefined,
    callerForNewEvents: undefined,
    pageSelectedInTable: 1,
    itemsPerPageInTable: 10,
    newItemsInserted: [],
    appMod: import.meta.env.VITE_APP_MOD,
    modality: false,
  }),
  props: {
    isTabFocused: {
      type: Boolean,
      default: true,
    },
    windowHeight: {
      type: Number,
    }
  },
  async mounted() {
    let from = new Date()
    let to = new Date()
    to.setSeconds(to.getSeconds() + 10)
    from = from.toISOString().substring(0, 10) + ' ' + from.toISOString().substring(11, 19)
    to = to.toISOString().substring(0, 10) + ' ' + to.toISOString().substring(11, 19)
    this.callerForNewEvents = setInterval(async () => {
      try {
        this.newItemsFromServer = await this.fetchItems();
      } catch (err) {
        console.log(err)
      }
    }, 30000);

  },
  beforeDestroy() {
    clearInterval(this.callerForNewEvents);
  },
  methods: {
    async redirectToChimpa(event) {
      axios.defaults.withCredentials = true;
      try {
        const response = await axios
          .get(process.env.VUE_APP_BASEURL + "/api/redirectToChimpa/" + event.clientId)
        if (response.data.success) {
          let host = response.data.payload.clientHost;
          let baseUrl = response.data.payload.clientBaseUrl;
          //const base64Str = Buffer.from(event.deviceSerialNumber, 'utf8').toString('base64');
          window.open('https://' + host + '/' + baseUrl + '/' + '/panel/login', '_blank').focus();
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    /**
     * load items displayed in table
     * @param {Object} filters
     * @param {boolean} filters.countScoreInterval - if set to true, api will return number of events per category
     * @param {boolean} filters.withDevice - if set to true, api will return device linked for each event
     * @param {string} filters.deviceOsType - osType of the event, selectable from: android, ios, windows
     * @param {number[]} filters.clientIds - ids of clients
     * @param {string[]} filters.groupBy - group by osVersion, osType
     * @return {Object[]} events returned
     */
    async fetchItems(filters) {
      let items = []
      try {
        let response;
        if (import.meta.env.VUE_APP_MOD === 'production' || this.modality) {
          response = await apiService.axiosToBackend()
            .get("/api/event", {
              params: {
                filters: JSON.stringify({
                  withDevice: true,
                  withClient: true,
                  withEventType: true,
                  selectAttributes: ['events.*', 'osType', 'osVersion', 'name', 'serialNumber', 'event_types.value'],
                  period: {
                    considerAlsoUpdate: true,
                    from: this.lastDateFetched ?? (() => {
                      // done only one time
                      const from = new Date();
                      from.setSeconds(from.getSeconds());
                      const date = from.toISOString().split('T')[0];
                      const time = from.toISOString().split('T')[1].substring(0, 8);
                      return `${date} ${time}`

                    })(),
                    to: (() => {
                      let to = new Date();
                      to.setDate(to.getDate() + 1);
                      const date = to.toISOString().split('T')[0];
                      const time = to.toISOString().split('T')[1].substring(0, 8);
                      if (!this.lastDateFetched) {
                        const from = new Date();
                        const date = from.toISOString().split('T')[0];
                        const time = from.toISOString().split('T')[1].substring(0, 8);
                        this.lastDateFetched = `${date} ${time}`;
                      }

                      return `${date} ${time}`
                    })()
                  }
                })
              },
            });
        } else {
          response = await apiService.axiosToBackend()
            .get("/api/test", {
              params: {
                filters: JSON.stringify({
                  withDevice: true,
                })
              }
            });
        }
        if (response?.data?.success) {
          items = (import.meta.env.VUE_APP_MOD === 'production' || this.modality) ? response.data.payload.rows : response.data.payload;
          items.forEach(el => {
            const checkNewDate = new Date(el.updatedAt ?? el.detectionDate);
            checkNewDate.setSeconds(checkNewDate.getSeconds() + 1)
            const fromDate = new Date(this.lastDateFetched)
            if (checkNewDate > fromDate) {
              let _date = new Date(
                // Date.utc returns the number of milliseconds, new Date(date) returns the date in utc if format is YYYY:MM:DD hh:mm:ss
                Date.UTC(
                  checkNewDate.getFullYear(),
                  checkNewDate.getMonth(),
                  checkNewDate.getDate(),
                  checkNewDate.getHours(),
                  checkNewDate.getMinutes(),
                  checkNewDate.getSeconds()
                )
              );
              const date = _date.toISOString().split('T')[0];
              const time = _date.toISOString().split('T')[1].substring(0, 8);
              this.lastDateFetched = `${date} ${time}`;
            }
          })
        }
        return items;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    /**
     * @param {Object} payloadFromChild
     * @param {any[]} payloadFromChild.items - Items in liveDataTable
     * @param {number} payloadFromChild.id - index of element clicked in the array items
     */
    rowLiveDataTableClicked(payloadFromChild) {
      console.log(payloadFromChild)
      this.detailEventDialogItems = payloadFromChild.items;
      this.detailEventDialogIndexItemSelected = payloadFromChild.index// + ((this.pageSelectedInTable - 1) * this.itemsPerPageInTable);
      this.detailEventDialogOpened = true;
    },
    /**
     * Translates the key with the language chosen
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      return translateService.getTranslation(this.languageChosen, key);
    },
    updateEventInTable(item) {
      let itemToUpdate = this.tableItems.find(tableItem => tableItem.id == item.id)
      if (import.meta.env.VUE_APP_MOD === 'production')
        itemToUpdate.remediationActionStarted = true;
      else {
        itemToUpdate.remediationActionStarted = true;
        setTimeout(() => {
          if (itemToUpdate?.remediationActionStarted)
            itemToUpdate.hasBeenSolved = true;
        }, 5000);
      }
    }
  },
  watch: {
    newItemsFromServer(newVal) {
      //let eventsToUpdate = new Map();
      let eventsToUpdate = [];
      newVal.forEach(eventToAdd => {
        if (!!eventToAdd.updatedAt)
          eventsToUpdate.push(eventToAdd);
      });
      if (eventsToUpdate.length > 0)
        this.tableItemsToUpdate = eventsToUpdate;
      /*      const detectionDate = new Date (eventToAdd.detectionDate);
            const updatedAt = new Date (eventToAdd.updatedAt);
            if(updatedAt > detectionDate){
              eventsToUpdate.set(eventToAdd.id, eventToAdd);
            }
          })
         if(eventsToUpdate.size > 0){
            this.tableItems.forEach(eventInTable => {
              if(Array.from(eventsToUpdate.keys()).includes(eventInTable.id)){
                eventInTable.hasBeenSolved = eventsToUpdate.get(eventInTable.id).hasBeenSolved;
                eventInTable.remediationActionStarted = eventsToUpdate.get(eventInTable.id).remediationActionStarted;
              }
            })
          }
          let eventsToInsert = newVal.filter(el => !Array.from(eventsToUpdate.keys()).includes(el.id));*/
      this.tableItems = newVal.map(item => {
        return {
          deviceSerialNumber: item?.device?.serialNumber ?? item.serialNumber,
          deviceName: item.name,
          detectionDate: item.detectionDate,
          score: item.score,
          description: item.description,
          remediationAction: item.remediationAction,
          remediationActionStarted: item.remediationActionStarted,
          hasBeenSolved: item.hasBeenSolved,
          id: item.id,
          checked: false,
          justInserted: true,
          osType: item?.device?.osType ?? item.osType,
          client: item.client,
          eventTypeKey: item?.event_type?.value ?? item.value,
        }
      });

      if (!!this.detailEventDialogOpened)
        this.newItemsInserted = newVal

      let newCriticEvents = [];
      let newHighEvents = [];
      newVal.forEach(item => {
        if (Number(item.score) > 9)
          newCriticEvents.push(item);
        else if (Number(item.score) >= 7 && Number(item.score) <= 9)
          newHighEvents.push(item);
      });
      if (newCriticEvents.length > 0) {
        if (this.criticAlertDialogOpened)
          this.criticItems.push(...newCriticEvents)
        else
          this.criticItems = newCriticEvents;
      }
      if (newHighEvents.length > 0)
        this.highItems = newHighEvents;
    },
    criticItems(newVal) {
      if (Array.isArray(newVal) && newVal.length > 0 && this.notificationsCritic && this.isTabFocused) {
        this.criticAlertDialogOpened = true;
      }
    },
    highItems(newVal) {
      if (Array.isArray(newVal) && newVal.length > 0 && this.notificationsHigh) {
        GlobalEventsHandler.showNotificationSnackbar('yellow', 'NEW_EVENTS_OF_HIGH_CRITICALITY', 'mdi-alert');
      }
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
};
</script>

<style>
</style>

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
  height: 24px;
  font-size: 16px;
  color: #ffffff;
  text-decoration: none solid rgb(255, 255, 255);
  line-height: 24px;
  margin-bottom: 15px;
  margin-top: 10px;
}
</style>
