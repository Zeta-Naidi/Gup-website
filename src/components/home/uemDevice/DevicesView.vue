<template>
  <div>
    <v-data-table-server
      v-model="selectedDevices"
      class="elevation-1 devices-table-wrapper"
      ref="table"
      :headers="headers"
      :items="devices"
      :loading="loading"
      :options.sync="optionsPagination"
      :items-length="totalRows"
      :fixed-header="true"
      :items-per-page-text="getTranslation('ROWS_PER_PAGE')"
      :show-current-page="true"
      :show-first-last-page="true"
      :hover="true"
      :items-per-page-options="[5, 10, 20]"
      mobile-breakpoint="0"
      @update:options="updatePagination"
      @click:row="showDetails"
    >
      <template v-slot:top>
        <v-container class="dt__container">
          <v-row class="d-flex align-center justify-end mb-1">
            <v-col>{{ getTranslation('LIST_DEVICES') }}</v-col>
            <v-col
              v-for="(element, index) in elements"
              :key="index"
              class="d-flex flex-row flex-grow-0 flex-nowrap justify-content-end"
            >
              <v-btn
                color="primary"
                v-if="element.type === 'button'"
                @click="element.action"
                :aria-label="element.ariaLabel"
              >
                <v-icon
                  :class="element.text && 'mr-3'"
                  v-if="element.icon"
                >
                  {{ element.icon }}
                </v-icon>
                {{ element.text }}
              </v-btn>
              <v-text-field
                v-else-if="element.type === 'input'"
                :label="element.label"
                :aria-label="element.label"
                v-model="searchDevices"
                :hint="getTranslation('INSERT_AT_LEAST_4_CHARACTERS')"
                :style="{ width: element.width }"
                density="compact"
                hide-details="auto"
                :clearable="true"
              />
            </v-col>
          </v-row>
        </v-container>
      </template>
      <template #header.icon>{{ getTranslation("OS") }}</template>
      <template #header.name>{{ getTranslation("NAME") }}</template>
      <template #header.serial>{{ getTranslation("SERIAL") }}</template>
      <template #header.product>{{ getTranslation("PRODUCT") }}</template>
      <template #header.dep>{{ getTranslation("DEP") }}</template>
      <template #header.status>{{ getTranslation("STATUS") }}</template>
      <template #header.active>{{ getTranslation("ACTIVE") }}</template>
      <template v-slot:item.icon="{item}">
        <v-icon :style="getOsIcon(item.osType).style">
          {{ getOsIcon(item.osType).icon }}
        </v-icon>
      </template>
      <template v-slot:item.name="{item}"
                class="rowDevice__name"
                @click="deviceClicked(item)"
      >
        <div style="display: flex; flex-direction: column">
          <div>
            {{
              (item.deviceName?.length > 18
                ? item.deviceName?.substring(0, 18) + "..."
                : item.deviceName) || "N/A"
            }}
          </div>
          <span>
                  {{
              (item.serialNumber?.length > 18
                ? item.serialNumber?.substring(0, 18) + "..."
                : item.serialNumber) || "N/A"
            }}
                  </span>
        </div>
      </template>
      <template v-slot:item.serial="{item}">
        {{
          (item.serialNumber?.length > 18
            ? item.serialNumber?.substring(0, 18) + "..."
            : item.serialNumber) || "N/A"
        }}
      </template>
      <template v-slot:item.product="{item}">
        {{
          (item.modelName?.length > 18
            ? item.modelName?.substring(0, 18) + "..."
            : item.modelName) || "N/A"
        }}
      </template>
      <template v-slot:item.status="{item}">
        {{
          (item.dep?.length > 18
            ? item.dep?.substring(0, 18) + "..."
            : item.dep) || "N/A"
        }}
      </template>
      <template v-slot:item.dep="{item}">
        todo...
      </template>
      <template v-slot:item.active="{item}">
        <v-chip
          class="deviceState"
          variant="elevated"
          label
          :color="item.enrollmentType < 2 ? 'green' : 'red'"
        >
          {{
            getTranslation(
              getEnrollmentStatusTranslation(item.enrollmentType)
            )
          }}
        </v-chip>
      </template>
      <template v-slot:item.edit="{item}">
        <v-icon :color="getColor(item.active)">mdi-circle</v-icon>
      </template>

      <template v-slot:item.actions="{item}">
        <v-menu location="start" max-height="500vh">
          <template v-slot:activator="{ props }">
            <v-btn
              icon="mdi-menu"
              v-bind="props"
              @click.stop="showActions(item.id, item, $event)">
            </v-btn>
          </template>
          <ActionsMenu
            :show="showMenuActions"
            :loadingMenuActions = loadingMenuActions
            :actions="actionList"
            :offsetX="menuOffsetX"
            :offsetY="menuOffsetY"
            @actionSelected="actionSelected"
            @close="closeMenuActions"
          />
        </v-menu>
      </template>

    </v-data-table-server>
      <DetailsDrawer
        :drawer="drawer"
        :device="selectedItem"
        :details="deviceDetails"
        style="height: 100%"
        @close="closeDrawer"
      />
    <FiltersDialog
      :value="showDialog"
      @deviceFilters="fetchDevices"
      @close="showDialog = false;"
    />
    <EnrollmentDialog
        v-model="showEnrollmentDialog"
        :isOpen="showEnrollmentDialog"
        @closeEnrollment="closeEnrollmentDialog"
    />

    <DialogSimple
      v-model="showDialogSimpleActions"
      :selectedAction = selectedAction
      :appliedTo = actionAppliedTo
      :loadingBtn="loadingBtnActionDialog"
      :actionFormContent="actionFormContent"
      @close="closeDialogActions"
      @execute="executeAction"
    />

    <DialogFormSimple
      v-model="showDialogFormSimpleActions"
      :selectedAction = selectedAction
      :appliedTo = actionAppliedTo
      :loadingBtn="loadingBtnActionDialog"
      :actionFormContent="actionFormContent"
      @close="closeDialogActions"
      @execute="executeAction"
    />

  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import DetailsDrawer from "./DetailsDrawer";
import FiltersDialog from "./FiltersDialog";
import ActionsMenu from "@/components/home/actions/ActionsMenu.vue";
import DialogSimple from "@/components/home/actions/DialogSimple.vue";
import DialogFormSimple from "@/components/home/actions/DialogFormSimple.vue";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";
import EnrollmentDialog from "./enrollment/EnrollmentDialog.vue"
import {useUserStore} from "@/plugins/pinia/user";
import utilsFunctions from "@/globalServices/utilsFunctions";
import ActionsMapping from "@/globalServices/actionsMapping";

export default {
  name: "DevicesView",
  components: {
    DetailsDrawer,
    FiltersDialog,
    EnrollmentDialog,
    ActionsMenu,
    DialogSimple,
    DialogFormSimple
  },
  created() {
    this.fetchDevices();
  },
  data(ctx) {
    return {
      actionFormContent: null,
      showDialogFormSimpleActions: false,
      menuOffsetX: 0,
      menuOffsetY: 0,
      loadingBtnActionDialog: false,
      actionAppliedTo: [],
      selectedAction: null,
      showDialogSimpleActions: false,
      loadingDialogActions: false,
      showMenuActions: false,
      actionList: null,
      loadingMenuActions: false,
      timeoutNameOrSearch: null,
      showDialog: false,
      singleSelect: false,
      selected: [],
      selectedDevices: [],
      itemsLoadProfile: [{name: "DEVICES"}, {name: "ASSOCIATION"}],
      lastOptions: null,
      dialogAddPlaceholder: false,
      drawer: false,
      selectedItem: {},
      headers: [
        {
          align: "start",
          value: "icon",
          width: "1vh",
          sortable: false,
        },
        {
          value: "name",
          align: "start",
          width: "10rem",
        },
        {
          value: "serial",
          align: "start",
          width: "12rem",
        },
        {
          value: "product",
          align: "start",
          width: "12rem",
        },
        {
          value: "dep",
          align: "start",
          width: "9rem",
        },
        {
          value: "status",
          align: "start",
          width: "5rem",
        },
        {
          value: "active",
          align: "start",
          width: "5rem",
        },
        {
          title: "",
          value: "edit",
          align: "middle",
          sortable: false,
          width: "4rem",
        },
        {
          title: "",
          value: "actions",
          align: "middle",
          sortable: false,
          width: "4rem",
        },
      ],
      totalDevices: 0,
      serverItems: [],
      loading: true,
      sortBy: [{key: "id", order: "desc"}],
      initialSortTable: true,
      totalRows: 0,
      rowsPerPage: 10,
      currentPage: 1,
      optionsPagination: {
        page: 1,
      },
      serialOrName: "",
      searchDevices: "",
      items: [],
      elements: [
        // {
        //   type: "button",
        //   text: "",
        //   action: () => ctx.exportToCSV(),
        //   icon: "mdi-download",
        //   ariaLabel: "Download",
        // },
        // {
        //   type: "button",
        //   text: "IMPORT",
        //   action: null,
        //   icon: "mdi-inbox-arrow-up",
        //   ariaLabel: "Import",
        // },
        // {
        //   type: "button",
        //   text: "Aggiungi Segnaposto",
        //   action: () => ctx.openAddPlaceholderDialog(),
        //   ariaLabel: "Add bookmark",
        // },
        {
          type: "button",
          text: "Enrollment",
          action: () => ctx.openEnrollmentDialog(),
          width: "15rem",
          icon: "mdi-plus",
          ariaLabel: "Add device",
        },
        {
          type: "input",
          label: "Cerca",
          model: "",
          onInput: "",
          width: "15rem",
        },
        // {
        //   type: "button",
        //   text: "",
        //   action: () => alert("Button 4 clicked"),
        //   icon: "mdi-tag-multiple",
        //   ariaLabel: "Tags",
        // },
        {
          type: "button",
          text: "",
          action: () => ctx.toggleFiltersDialog(),
          icon: "mdi-filter",
          ariaLabel: "Filter",
        },
      ],
      selectedDevice: {},
      devices: [],
      deviceDetails: {},
      selectedItems: [],
      detailsDrawerKey: 0,
      paginate: true,
      enrollmentType: 5,
      filters: {},
      osTypeFilter: undefined,
      enrollmentTypeFilter: undefined,
      showEnrollmentDialog: false,
    }
  },
  methods: {
    async executeAction(actionIdentifier, deviceId, actionFormContent = null, formSimple = null){

      this.loadingBtnActionDialog = true

      try {
        const response = await apiService.axiosToBackend().post("/api/uem/action/execute/",
          {
            'actionIdentifier': actionIdentifier,
            'deviceId': deviceId,
            'actionFormContent': actionFormContent,
          }
        );


      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
      if(formSimple === 'formSimple'){
        this.showDialogFormSimpleActions = false;
        this.loadingBtnActionDialog = false;
      }else{
        this.showDialogSimpleActions = false;
        this.loadingBtnActionDialog = false;
      }

      utilsFunctions.handleServerResponseSuccess('ACTION_EXECUTED_SUCCESSFULLY');
    },
    closeDialogActions(formSimple = null){
      if(formSimple === 'formSimple'){
        this.showDialogFormSimpleActions = false;
        this.loadingBtnActionDialog = false;
      }else{
        this.showDialogSimpleActions = false;
        this.loadingBtnActionDialog = false;
      }
    },
    actionSelected(action){
      this.selectedAction = action;
      this.actionFormContent = ActionsMapping.getMappedActionDetails(action['actionIdentifier']);

      if(this.actionFormContent !== null){
        this.showDialogFormSimpleActions = true;
      }else{
        this.showDialogSimpleActions = true;
      }

    },
    closeMenuActions(){
      this.showMenuActions = false;
    },
    async showActions(itemId, item, event){
      this.menuOffsetX = event.clientX;
      this.menuOffsetY = event.clientY;

      this.showMenuActions = true;
      this.loadingMenuActions = true;

      try {
        const response = await apiService.axiosToBackend().get("/api/uem/action/device/"+itemId);

        if (response.data.success) {
          this.actionList = response.data.payload;
        } else {
          throw new Error("ERROR FINDING ACTIONS");
        }
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }

      this.loadingMenuActions = false;
      // get the actionAppliedTo Data:
      if(item.serialNumber){
        // pass all the data (to get it from the other dialog) ??
        this.actionAppliedTo['item'] = item;
        this.actionAppliedTo['type'] = 'device';

        // this.actionAppliedTo['id'] = item.id;
        // this.actionAppliedTo['type'] = 'device';
        // this.actionAppliedTo['osType'] = item.osType;
        // this.actionAppliedTo['identifier'] = item.serialNumber;
      }else{
        this.actionAppliedTo['id'] = item.id;
        this.actionAppliedTo['type'] = 'user';
        this.actionAppliedTo['identifier'] = item.username;
      }
    },
    getEnrollmentStatusTranslation(enrollmentType) {
      let statusKey;
      if (enrollmentType < 2) {
        statusKey = enrollmentType === 1 ? "ENROLLED" : "SUPERVISED";
      } else {
        statusKey = enrollmentType < 4 ? "NOT_ENROLLED" : "NOT_SUPERVISED";
      }
      return this.getTranslation(statusKey);
    },
    async deviceClicked(item) {
      await this.fetchDeviceDetails(item.id);
      this.showDetails(item);
    },
    updatePagination(optionsPagination) {
      this.currentPage = optionsPagination.page;
      this.rowsPerPage = optionsPagination.itemsPerPage;
      this.fetchDevices();
    },
    async fetchDevices(filters = {}) {
      this.loading = true;
      try {
        this.filters = {
          paginate: filters.paginate ?? this.paginate,
          serialOrName: filters.searchDevices ?? this.searchDevices,
          status: filters.enrollmentType ?? this.enrollmentType,
          rowsPerPage: filters.rowsPerPage ?? this.rowsPerPage,
          page: filters.currentPage ?? this.currentPage,
          osType: filters.osTypeFilter ?? null,
          enrollmentType: filters.enrollmentTypeFilter ?? null,
        };
        const response = await apiService.axiosToBackend().get("/api/uem/device",
          {
            params: {
              filters: JSON.stringify(this.filters),
            },
          }
        );

        if (response.data.success) {
          // TODO: rivedere
          this.devices = response.data.payload;
          this.page = response.data.payload.current_page;
          this.totalRows = response.data.payload.total ?? response.data.payload.length;
          this.lastPage = response.data.payload.last_page;
        } else {
          throw new Error("Cannot find devices");
        }
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
        this.devices = [];
        this.totalDevices = 0;
      } finally {
        this.loading = false;
      }
    },
    async fetchDeviceDetails(id) {
      this.loading = true;
      try {
        const response = await apiService.axiosToBackend().get("api/uem/device/details/" + id);
        let success = response.data.success;
        if (success) {
          const result = response.data.payload;
          Object.keys(result).map(
            (key) => (this.deviceDetails[key] = result[key])
          );
        } else {
          throw new Error("Cannot find devices");
        }
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
        this.deviceDetails = [];
      } finally {
        this.loading = false;
      }
    },
    openEnrollmentDialog() {
      this.showEnrollmentDialog = true;
    },
    closeEnrollmentDialog() {
      this.showEnrollmentDialog = false;
    },
    toggleFiltersDialog() {
      this.showDialog = true;
      this.filters = {};
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
    forceRenderer() {
      this.detailsDrawerKey += 1;
    },
    showDetails(device) {
      this.selectedItem = device;
      this.drawer = true;
      //this.$emit("dataReady", this.selectedItem);
      //this.forceRenderer();
    },
    closeDrawer(drawer) {
      this.drawer = drawer;
      this.selectedItem = {};
    },
    handleRowClick(event, item) {
      this.drawer = true;
      this.selectedItem = item;
    },
    selectItem(item) {
      this.selectedItem = item;
    },
    getColor(state) {
      if (state) {
        return "green";
      } else return "red";
    },
    openFileSelector() {
      this.$refs.jsonFileInput[1].value = "";
      this.$refs.jsonFileInput[1].click();
    },
    handleFileUpload(event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const csvContent = event.target.result;
          try {
            this.importedElements = this.parseCSV(csvContent);
          } catch (error) {
            utilsFunctions.handleServerResponseException(error);
          }
        };

        reader.readAsText(selectedFile);
      }
    },
    parseCSV(csvContent) {
      const lines = csvContent.split("\n");
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const values = line.split(",");
          data.push(values);
        }
      }
      return data;
    },
    addNewPlaceholder() {
      this.dialogAddPlaceholder = false;
      const device = {
        id: this.totalDevices + 1,
        osType: this.newPlaceholder.osType,
        imei:
          this.newPlaceholder.identifier === "IMEI"
            ? this.newPlaceholder.value
            : "",
        serialNumber:
          this.newPlaceholder.identifier === "Seriale"
            ? this.newPlaceholder.value
            : "",
      };
      this.$root.$dialogLoader.start(
        this.getTranslation("CREATING"),
        {},
        async () => {
          await this.addNewUserApi(device);
        },
        true
      );
    },
    async loadCSVApi() {
      // 0: SERIAL_NO
      // 1: OS_TYPE
      // 2: IMEI
      let objs = [];
      for (let i = 1; i < this.fileInput.length; i++) {
        const obj = {
          id: this.totalItems + 1,
          osType: this.fileInput[i][1],
          serial: this.fileInput[i][0],
          IMEI: this.fileInput[i][2],
        };
        objs.push(obj);
        this.totalItems += 1;
      }

      for (const obj of objs) {
        const response = await fetch(
          import.meta.env.VITE_API_BASE_URL + "devices/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(obj),
          }
        );
      }
    },
    exportToCSV() {
      const csvContent = this.convertToCSV(this.serverItems);
      const blob = new Blob([csvContent], {type: "text/csv"});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "exported_devices" + Date.now() + ".csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    convertToCSV(data) {
      const fields = ["operatingSystem", "serial", "IMEI"];
      const header = fields.join(",");
      const rows = data.map((item) => {
        const selectedFields = fields.map((field) => item[field]);
        return selectedFields.join(",");
      });

      return `${header}\n${rows.join("\n")}`;
    },
    showEditDialog(item) {
      this.dialogEditDevice = true;
      this.selectedDevice = item;
    },
    async deleteDevice() {
      this.dialogEditDevice = false;

      const result = await this.$root.$confirm(
        this.getTranslation("DELETE") + "?",
        this.getTranslation("DELETE_SELECTED_DEVICE_CONFIRM"),
        {color: "primary"},
        this.selectedDevice
      );
      if (result) {
        this.$root.$dialogLoader.start(
          this.getTranslation("DELETING"),
          {},
          async () => {
            await this.deleteDeviceApi(this.selectedDevice);
          },
          true
        );
      } else {
        this.dialogEditDevice = true;
      }
    },
    // async deleteDeviceApi(device) {
    //   try {
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     const response = await fetch(
    //         "http://localhost:3000/devices/" + device.id,
    //         {
    //           method: "DELETE",
    //           headers: {
    //             "Content-Type": "application/json",
    //           },
    //         }
    //     );
    //     let page = this.page;
    //     let itemsPerPage = this.itemsPerPage;
    //     let sortBy = this.sortBy;
    //
    //     await this.loadItems({page, itemsPerPage, sortBy});
    //   } catch (error) {
    //   }
    // },
    // async updateDevice() {
    //   this.dialogEditDevice = false;
    //   this.$root.$dialogLoader.start(
    //       this.getTranslation(
    //           "DELETING",
    //           this.languageChosen
    //       ),
    //       {},
    //       async () => {
    //         await this.updateDeviceApi(this.selectedDevice);
    //       },
    //       true
    //   );
    // },
    // async updateDeviceApi(device) {
    //   try {
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     const response = await fetch(
    //         "http://localhost:3000/devices/" + device.id,
    //         {
    //           method: "PUT",
    //           headers: {
    //             "Content-Type": "application/json",
    //           },
    //           body: JSON.stringify(device),
    //         }
    //     );
    //
    //     let page = this.page;
    //     let itemsPerPage = this.itemsPerPage;
    //     let sortBy = this.sortBy;
    //
    //     await this.loadItems({page, itemsPerPage, sortBy});
    //   } catch (error) {
    //   }
    // },
    downloadCSVData({}) {
      let csv =
        "SERIAL_NO,OS_TYPE,DEVICE_NAME,PRODUCT_NAME,IMEI,MACADDRESS\n";
      this.csvdata.forEach((row) => {
        csv += row.join(",");
        csv += "\n";
      });

      const anchor = document.createElement("a");
      anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
      anchor.target = "_blank";
      anchor.download = "nameYourFileHere.csv";
      anchor.click();
    },
    getColorStatus(status) {
      return (status === "Supervised" || status === "Enrolled") ? 'green' : 'red';
    },
    getOsIcon(osType) {
      switch (osType?.toLowerCase()) {
        case "windows":
          return {icon: "mdi-microsoft-windows", style: "color: #0076fd"};
        case "ios":
        case "apple":
        case "macos":
          return {icon: "mdi-apple", style: "color: #ffffff"};
        case "android":
          return {icon: "mdi-android", style: "color: #3dda84"};
        case "linux":
          return {icon: "mdi-linux", style: "color: #ffffff"};
        default:
          return {icon: "mdi-help", style: "color: #cccccc"};
      }
    },
  },
  props: {
    windowHeight: {
      type: Number
    }
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    searchDevices(newVal) {
      if (newVal?.length > 0 && newVal?.length < 4)
        return;
      if (!!this.timeoutNameOrSearch) {
        clearTimeout(this.timeoutNameOrSearch);
      }
      this.timeoutNameOrSearch = setTimeout(() => this.fetchDevices(), 300);
    },
  },
};
</script>

<style lang="scss" scoped>
:deep(.v-navigation-drawer__content) {
  overflow-y: hidden;
}

.activeRow {
  background-color: rgba(120, 120, 120, 0.9);
}

td > .deviceState {
  width: 80%;
  justify-content: center;
}

:deep(tr) {
  cursor: pointer;
}

.v-data-table-server
> .v-data-table-server__wrapper
.v-data-table-server__mobile-table-row {
  margin: 10px;
  border: 1px solid var(--v-theme-surface);
  display: block;
}

.v-data-table-server
> .v-data-table-server__wrapper
.v-data-table-server__mobile-row {
  border-bottom: 1px solid rgb(var(surface-lighter-1));
}

.v-chip.v-chip--density-default {
  width: 100%;
}

:deep(.table-filters) {
  align-items: end;
}


.dt__container {
  max-width: 100%;
  padding: 0 1rem;
}


:deep(
      .v-data-table
        .v-table__wrapper
        > table
        > thead
        > tr
        th.v-data-table-column--no-padding
    ) {
  padding: 0 16px;
}

:deep(.v-selection-control) {
  justify-content: flex-end;
}

span.v-chip.v-chip--label.v-theme--dark.text-green.v-chip--density-default.v-chip--size-default.v-chip--variant-tonal,
span.v-chip.v-chip--label.v-theme--dark.text-red.v-chip--density-default.v-chip--size-default.v-chip--variant-tonal,
span.v-chip.v-chip--label.v-theme--light.text-green.v-chip--density-default.v-chip--size-default.v-chip--variant-tonal,
span.v-chip.v-chip--label.v-theme--light.text-red.v-chip--density-default.v-chip--size-default.v-chip--variant-tonal {
  justify-content: center;
}

.v-table .v-table__wrapper {
  border-color: transparent;
}

:deep(.v-table > .v-container) {
  max-width: 100%;
  padding: 24px;
}

:deep(.v-data-table__wrapper::-webkit-scrollbar) {
  height: 0.7rem;
}

.v-data-table__wrapper > table > tr > td {
  padding: 0 1rem;
  cursor: pointer;
}

.v-data-table__wrapper > table > tr:hover {
  cursor: pointer;
}

.v-table .v-table__wrapper > table > tbody .rowDevice__name {
  cursor: pointer;
}

.v-table .v-table__wrapper > table > tbody .rowDevice__name:hover {
  cursor: pointer;
}

.v-table .v-table__wrapper > table > thead > tr,
.v-table .v-table__wrapper > table > tbody > tr {
  --v-border-opacity: 0.12;
}

.v-field__overlay {
  border-radius: 4px;
}

.v-field__loader {
}

.v-field--variant-filled .v-field__outline::before {
  border-color: transparent;
}

.v-field--appended {
  padding-inline-end: 0;
}

.v-selection-control__input i {
  color: rgb(var(--v-theme-primary));
}

</style>
