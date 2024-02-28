<template>
  <div>
    <div class="d-flex justify-center hover-center" v-if="loadingItems">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
    <v-data-table-server
      :height="dynamicHeight"
      :headers="headers"
      :items="items"
      :fixed-header="true"
      :multi-sort="true"
      :class="{divHovered: loadingItems}"
      :items-per-page-text="getTranslation('ROWS_PER_PAGE')"
      :show-current-page="true"
      :show-first-last-page="true"
      :items-per-page-options="[5,10,15]"
      :options.sync="optionsPagination"
      :items-length="totalRows"
      :page.sync="currentPage"
      :hover="true"
      @click:row="openDetailEventDialog"
      @update:options="updatePagination"
      mobile-breakpoint="0"
    >
      <template v-slot:header.score>
        {{ getTranslation('SEVERITY') }}
      </template>
      <template v-slot:header.clientId>
        {{ getTranslation('CLIENT') }}
      </template>
      <template v-slot:header.description>
        {{ getTranslation('DESCRIPTION') }}
      </template>
      <template v-slot:header.serialNumber>
        {{ getTranslation('DEVICE') }}
      </template>
      <template v-slot:header.detectionDate>
        {{ getTranslation('DATE') }}
      </template>
      <template v-slot:header.actions>
        {{ getTranslation('ACTIONS') }}
      </template>
      <template v-slot:item.score="{ item }">
        <div class="d-flex align-center">
          <div
            class="d-flex"
            :style="{'border-left': '5px solid ' + getColorSeverity(item.score), 'padding-left':'8px'}">
            {{ item.score + ' ' + getLabelSeverity(item.score) }}
          </div>
        </div>
      </template>
      <template v-slot:item.clientId="{ item }">
        <div class="d-flex align-center">
          <div v-if="clientsFilter && clientsFilter.find(el => el.id === item.clientId)">
            {{ getCompanyNameOfClient(item) }}
          </div>
        </div>
      </template>
      <template v-slot:item.detectionDate="{ item }">
        <v-text-field
          :model-value="getDateString(item.detectionDate)"
          :readonly="true"
          outlined
          hide-details="auto"
          class="py-2"
        />
      </template>
      <template v-slot:item.serialNumber="{ item }">
        <div class="d-flex align-center">
          <v-icon :color="getColorIconOsType(item.deviceOsType)" class="pr-1">
            {{ getNameIconOsType(item.deviceOsType) }}
          </v-icon>
          {{ item.deviceName ?? item.deviceSerialNumber }}
        </div>
      </template>
      <template v-slot:item.description="{ item }">
        <div class="d-block py-2" style="max-height: 100px !important; overflow: hidden;">
          <v-icon class="pr-1">
            {{ getEventTypeIcon(item.eventTypeKey) }}
          </v-icon>
          {{ getTranslation(item.description) }}
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex align-center">
          <v-btn
            v-if="!item.hasBeenSolved && item.remediationAction && !item.remediationActionStarted"
            color="primary"
            @click.stop="itemRepairDialog = item; isRepairDialogOpened = true;"
          >
            {{ getTranslation('REPAIR') }}
          </v-btn>
          <v-btn
            v-else-if="!item.hasBeenSolved && !item.remediationAction && !item.remediationActionStarted"
            dense
            @click.stop="redirectToChimpa(item)"
          >
            {{ getTranslation('MANUAL_REPAIR') }}
          </v-btn>
          <v-btn
            v-else-if="!item.hasBeenSolved && !!item.remediationActionStarted"
            dense
            color="orange"
            @click.stop=""
          >
            {{ getTranslation('COMMAND_SENT') }}
          </v-btn>
          <v-btn
            v-else
            dense
            color="green"
            @click.stop=""
          >
            {{ getTranslation('REPAIRED') }}
          </v-btn>
        </div>
      </template>
    </v-data-table-server>
    <DetailEventDialog
      :value="isDetailEventDialog"
      :eventChosen="eventOfRowClicked"
      :disable-next-button="lastIndexElementClicked != null && currentPage === lastPage && (((currentPage - 1) * rowsPerPage) + lastIndexElementClicked + 1) >= totalRows "
      :disable-prev-button="lastIndexElementClicked != null && currentPage === 1 && lastIndexElementClicked === 0"
      @repairEvent="itemRepairDialog = $event; isRepairDialogOpened = true;"
      @redirectToChimpa="redirectToChimpa($event)"
      @close="isDetailEventDialog = false; eventOfRowClicked = undefined"
      @next="focusNextElement"
      @prev="focusPrevElement"
    ></DetailEventDialog>
    <RepairDialog
      v-if="true"
      :value="isRepairDialogOpened"
      :item="itemRepairDialog"
      @close="isRepairDialogOpened = false"
      @eventResolved="updateEventInTable($event);isRepairDialogOpened= false;"
    ></RepairDialog>
  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import deviceService from "@/globalServices/deviceService";
import DetailEventDialog from "@/components/home/dashboard/DetailEventDialog.vue";
import RepairDialog from "@/components/common/RepairDialog.vue";
import utilsFunctions from "@/globalServices/utilsFunctions";
import axios from "axios";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import {nextTick, toRaw} from "vue";
import apiService from "@/globalServices/apiService";

export default {
  components: {
    DetailEventDialog,
    RepairDialog,
  },
  data() {
    return {
      headers: [
        {title: "Gravità", value: "score", sortable: true, width: "12%"},
        {title: "Cliente", value: "clientId", sortable: true, width: "10%"},
        {title: "Device", value: "serialNumber", sortable: true, width: "10%"},
        {title: "Data", value: "detectionDate", sortable: true, width: "200px"},
        {title: "Descrizione", value: "description", sortable: false, width: "40%"},
        {title: "", value: "actions", sortable: false, width: "5%"},
      ],
      loadingItems: false,
      items: [],
      periodFilter: undefined,
      osVersionFilter: undefined,
      osTypeFilter: undefined,
      clientsFilter: undefined,
      criticalityFilter: undefined,
      selectedDaysFilter: undefined,
      eventTypesFilter: undefined,
      serialNumbersFilter: undefined,
      isDetailEventDialog: false,
      eventOfRowClicked: undefined,
      totalRows: 0,
      rowsPerPage: 10,
      currentPage: 1,
      lastPage: 1,
      orderByFilters: [
        {attribute: "detectionDate", order: 'desc'}
      ],
      dynamicHeight: '',
      queueForCalls: [],
      optionsPagination: {},
      pointerToControllerToAbortCalls: undefined,
      isRepairDialogOpened: false,
      itemRepairDialog: undefined,
      lastIndexElementClicked: null,
    };
  },
  props: {
    bus: {
      type: Object,
      default: () => {
      },
    },
    fetcher: {
      type: Function,
    },
    giveMeNumberTotalEvents: {
      type: Boolean,
      default: false,
    },
    windowHeight: {
      type: Number,
    }
  },
  mounted() {
    this.dynamicHeight = this.windowHeight > 1000 ? '35vh' : 330;
    this.setPeriodFilterToLastWeek();

    this.bus.on("clientsSelected", async (clientsSelected) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.clientsFilter = clientsSelected;
      this.clearFilters();
      this.pushInQueue();
    })
    this.bus.on("osVersionFilter", (osVersionFilter) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.osVersionFilter = !!osVersionFilter ? osVersionFilter.toLowerCase() : undefined;
      this.pushInQueue();
    });
    this.bus.on("osTypeFilter", (osTypeFilter) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.osTypeFilter = osTypeFilter.toLowerCase()
      this.pushInQueue();
    });
    this.bus.on("removeOsFilters", () => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.osTypeFilter = undefined;
      this.osVersionFilter = undefined;
      this.pushInQueue();
    });
    this.bus.on("criticalityFilter", (criticalityFilter) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.criticalityFilter = criticalityFilter
      this.pushInQueue();
    });
    this.bus.on("periodFilter", (periodFilter) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.periodFilter = periodFilter;
      if (!!this.clientsFilter)
        this.pushInQueue();
    });
    this.bus.on("selectedDaysFilter", (selectedDaysFilter) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.selectedDaysFilter = selectedDaysFilter;
      this.pushInQueue();
    });
    this.bus.on("globalFilters", (globalFilters) => {
      this.optionsPagination.page = 1;
      this.currentPage = 1;
      this.eventTypesFilter = globalFilters.eventTypesFilter;
      this.serialNumbersFilter = globalFilters.serialNumbersFilter;
      this.pushInQueue();
    });
  },
  methods: {
    nextTick,
    pushInQueue() {
      this.queueForCalls.push({
        clientIds: this.clientsFilter.map((el) => el.id),
        criticality: this.criticalityFilter,
        deviceOsType: this.osTypeFilter,
        deviceOsVersion: this.osVersionFilter,
        eventTypes: this.eventTypesFilter,
        orderBy: this.orderByFilters,
        page: this.currentPage,
        paginate: true,
        period: this.periodFilter,
        rowsPerPage: this.rowsPerPage,
        selectedDays: this.selectedDaysFilter,
        serialNumbers: this.serialNumbersFilter,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        withDevice: true
      });
      if (!this.loadingItems)
        this.getData(this.queueForCalls.pop())
    },
    /**
     * groupBy:Array(0)
     * groupDesc:Array(0)
     * itemsPerPage:10
     * multiSort:false
     * mustSort:false
     * page:1
     * sortBy:Array(0)
     * sortDesc:Array(1)
     */
    updatePagination(optionsPagination) {
      this.currentPage = optionsPagination.page;
      this.rowsPerPage = optionsPagination.itemsPerPage;
      if (optionsPagination.sortBy.length > 0)
        this.orderByFilters = optionsPagination.sortBy.map((el, index) => ({
          attribute: this.getCorrectAttributeName(el),
          order: !!optionsPagination.sortDesc[index] ? 'desc' : 'asc'
        }));
      else
        this.orderByFilters = [
          {attribute: 'detectionDate', order: 'desc'}
        ]
      if (!!this.clientsFilter)
        this.pushInQueue();
    },
    focusNextElement() {
      if (this.lastIndexElementClicked != null && (this.lastIndexElementClicked + 1) < this.rowsPerPage) {
        this.eventOfRowClicked = this.items[this.lastIndexElementClicked + 1]
        this.lastIndexElementClicked++;
      }
      //have to update pagination
      else if (this.lastIndexElementClicked != null) {
        this.fetcher({
          clientIds: this.clientsFilter.map((el) => el.id),
          withDevice: true,
          deviceOsVersion: this.osVersionFilter,
          deviceOsType: this.osTypeFilter,
          period: this.periodFilter,
          criticality: this.criticalityFilter,
          selectedDays: this.selectedDaysFilter,
          eventTypes: this.eventTypesFilter,
          serialNumbers: this.serialNumbersFilter,
          orderBy: this.orderByFilters,
          paginate: true,
          page: ++this.currentPage,
          rowsPerPage: this.rowsPerPage,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).then((items) => {
          this.totalRows = items.rows.total;
          this.currentPage = items.rows.current_page;
          console.log(this.currentPage)
          this.lastPage = items.rows.last_page;
          this.items = items.rows.data.map(item => {
            return {
              id: item.id,
              deviceSerialNumber: item.deviceSerialNumber,
              detectionDate: item.detectionDate,
              score: item.score,
              type: item.type,
              description: item.description,
              remediationAction: item.remediationAction,
              hasBeenSolved: item.hasBeenSolved,
              subject: item.subject,
              deviceOsType: item.osType,
              deviceName: item.name,
              deviceOsVersion: item.osVersion,
              clientId: item.clientId,
              companyName: item.companyName,
              eventTypeKey: item.type,
              docs: JSON.parse(item.docs),
            }
          });
          this.loadingItems = false
          this.optionsPagination.page++;
          this.lastIndexElementClicked = 0;
          this.eventOfRowClicked = this.items[this.lastIndexElementClicked];
        })
          .catch(() => {
            this.loadingItems = false;
          });
      }
    },
    focusPrevElement() {
      if (this.lastIndexElementClicked != null && (this.lastIndexElementClicked - 1) >= 0) {
        this.eventOfRowClicked = this.items[this.lastIndexElementClicked - 1]
        this.lastIndexElementClicked--;
      }
      //have to update pagination
      else if (this.lastIndexElementClicked != null) {
        this.fetcher({
          clientIds: this.clientsFilter.map((el) => el.id),
          withDevice: true,
          deviceOsVersion: this.osVersionFilter,
          deviceOsType: this.osTypeFilter,
          period: this.periodFilter,
          criticality: this.criticalityFilter,
          selectedDays: this.selectedDaysFilter,
          eventTypes: this.eventTypesFilter,
          serialNumbers: this.serialNumbersFilter,
          orderBy: this.orderByFilters,
          paginate: true,
          page: --this.currentPage,
          rowsPerPage: this.rowsPerPage,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }).then((items) => {
          this.totalRows = items.rows.total;
          this.currentPage = items.rows.current_page;
          this.lastPage = items.rows.last_page;
          this.items = items.rows.data.map(item => {
            return {
              id: item.id,
              deviceSerialNumber: item.deviceSerialNumber,
              detectionDate: item.detectionDate,
              score: item.score,
              type: item.type,
              description: item.description,
              remediationAction: item.remediationAction,
              hasBeenSolved: item.hasBeenSolved,
              subject: item.subject,
              deviceOsType: item.osType,
              deviceName: item.name,
              deviceOsVersion: item.osVersion,
              clientId: item.clientId,
              companyName: item.companyName,
              eventTypeKey: item.type,
              docs: JSON.parse(item.docs),
            }
          });
          this.loadingItems = false
          this.optionsPagination.page--;
          this.lastIndexElementClicked = this.rowsPerPage - 1;
          this.eventOfRowClicked = this.items[this.lastIndexElementClicked];
        })
          .catch(() => {
            this.loadingItems = false;
          });
      }
    },
    getCorrectAttributeName(name) {
      if (name === 'clientId')
        return 'companyName'
      else if (name === 'serialNumber')
        return 'devices.name'
      else return name
    },
    getData(filters) {
      this.loadingItems = true;
      this.fetcher(filters).then((items) => {
        if (this.queueForCalls.length > 0) {
          this.getData(this.queueForCalls.pop());
          this.queueForCalls = [];
        } else {
          if (items === 'DONT_CALL_SERVER') {
            this.totalRows = 0;
            this.currentPage = 1;
            this.lastPage = 1;
            this.items = []
          } else {
            this.totalRows = items.rows.total;
            this.currentPage = items.rows.current_page;
            this.lastPage = items.rows.last_page;
            this.items = items.rows.data.map(item => {
              return {
                id: item.id,
                deviceSerialNumber: item.deviceSerialNumber,
                detectionDate: item.detectionDate,
                score: item.score,
                type: item.type,
                description: item.description,
                remediationAction: item.remediationAction,
                hasBeenSolved: item.hasBeenSolved,
                remediationActionStarted: !!item.remediationActionStarted,
                subject: item.subject,
                deviceOsType: item.osType,
                deviceName: item.name,
                deviceOsVersion: item.osVersion,
                clientId: item.clientId,
                companyName: item.companyName,
                eventTypeKey: item.type,
                docs: JSON.parse(item.docs),
              }
            });
          }
          this.loadingItems = false;
          let tablesInVew = document.getElementsByClassName('v-data-table__wrapper');
          if (tablesInVew.length === 1)
            tablesInVew[0].scrollTop = 0; // first one is client table, then data table
          else if (tablesInVew.length === 2)
            tablesInVew[1].scrollTop = 0;
          else //Default case, shouldn't fall here, update if new tables are inserted before datatable in dashboard
            tablesInVew[0].scrollTop = 0;
        }
      })
        .catch(() => {
          this.loadingItems = false;
        });
    },
    async redirectToChimpa(event) {
      try {
        const response = await apiService.axiosToBackend()
          .get("/api/redirectToChimpa/" + event.clientId)
        if (response.data.success) {
          const host = response.data.payload.clientHost;
          const baseUrl = response.data.payload.clientBaseUrl;
          //const base64Str = Buffer.from(event.deviceSerialNumber, 'utf8').toString('base64');
          window.open('https://' + host + '/' + baseUrl + '/' + '/panel/login', '_blank').focus();
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    updateEventInTable(item) {
      let itemToUpdate = this.items.find(tableItem => tableItem.id === item.id)
      if (import.meta.env.VUE_APP_MOD === 'production') {
        itemToUpdate.remediationActionStarted = true;
        // Repair command from detail dialog
        if (this.isDetailEventDialog)
          this.eventOfRowClicked.remediationActionStarted = true;
      } else {
        itemToUpdate.remediationActionStarted = true;
        setTimeout(() => {
          if (itemToUpdate?.remediationActionStarted)
            itemToUpdate.hasBeenSolved = true;
        }, 5000);
        // Repair command from detail dialog
        if (this.isDetailEventDialog) {
          this.eventOfRowClicked.remediationActionStarted = true;
          setTimeout(() => {
            if (this?.eventOfRowClicked?.remediationActionStarted)
              this.eventOfRowClicked.hasBeenSolved = true;
          }, 5000);
        }
      }
    },
    clearFilters() {
      this.osVersionFilter = null;
      this.osTypeFilter = null;
      this.criticalityFilter = null;
      this.eventTypesFilter = null;
      this.serialNumbersFilter = null;
      this.selectedDaysFilter = null;
    },
    /**
     * Return the color associated with the severity score
     * @param {Number} score
     */
    getColorSeverity(score) {
      if (Number(score) >= 8.5) return "#b60000";
      else if (Number(score) >= 7.0 && Number(score) < 8.5) return "#f02929";
      else if (Number(score) > 5.0 && Number(score) < 7.0) return "#f27516";
      else if (Number(score) <= 5.0) return "#fec601";
      else return "";
    },
    /**
     * Return the label associated with the severity score
     * @param {Number} score
     */
    getLabelSeverity(score) {
      if (Number(score) >= 8.5) return this.getTranslation('CRITICAL');
      else if (Number(score) >= 7.0 && Number(score) < 8.5) return this.getTranslation('HIGH');
      else if (Number(score) > 5.0 && Number(score) < 7.0) return this.getTranslation('MEDIUM');
      else if (Number(score) <= 5.0) return this.getTranslation('LOW');
      else return "";
    },
    setPeriodFilterToLastWeek() {
      this.periodFilter = dateService.setPeriodComponentToLastWeek();
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
    /**
     * Translates the key with the language chosen, return key only for description case, if is not found in the translations
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    /**
     * @param {String} date - date to convert, e.g. 2022-10-12 00:30:21
     * @returns {String}
     */
    getDateString(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen);
    },
    getCompanyNameOfClient(event) {
      return this.clientsFilter.find(el => el.id === event.clientId).companyName
    },
    getEventTypeIcon(eventType) {
      return deviceService.getIconByEventType(eventType);
    },
    openDetailEventDialog(clickEvent, row) {
      this.lastIndexElementClicked = row.index;
      this.eventOfRowClicked = row.item;
      this.isDetailEventDialog = true;
    },
  },
  watch: {
    //watching prop to catch event
    giveMeNumberTotalEvents(newVal) {
      if (newVal) {
        this.$emit('numberTotalEvents', this.totalRows);
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
<style lang="scss" scoped>
$colors: #8cc271, #69beeb, #f5aa39, #e9643b;
.cube {
  width: 20px;
  height: 20px;
  margin-right: 10px;

  @for $i from 1 through length($colors) {
    &:nth-child(#{$i}) {
      background-color: nth($colors, $i);
    }
  }

  &:first-child {
    animation: left 1s infinite;
  }

  &:last-child {
    animation: right 1s infinite 0.5s;
  }
}

// -----------------------------------------------------

@keyframes left {
  40% {
    transform: translateX(-60px);
  }
  50% {
    transform: translateX(0);
  }
}

@keyframes right {
  40% {
    transform: translateX(65px);
  }
  50% {
    transform: translateX(0);
  }
}

.hover-center {
  z-index: 10;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
}

.divHovered {
  opacity: 0.2;
}

</style>
