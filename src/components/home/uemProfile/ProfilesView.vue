<template>
  <div>
    <PayloadTable
      :items="profileList"
      :currentPage="currentPage"
      :rowsPerPage="rowsPerPage"
      :totalItems="totalItems"
      :loading="loadingProfilesTable"
      @editPayload="editPayload"
      @deletePayload="deletePayload"
      @duplicatePayload="duplicatePayload"
      @downloadPayload="downloadPayload"
      @loadPayloadFromFile="loadPayloadFromFile"
      @handleFileUpload="handleFileUpload"
      @openDialogChooseOS="openDialogChooseOS"
      @refreshTable="refreshTableProfiles"
    >
    </PayloadTable>

    <!-- Dialog Choose OS-->
    <ChooseOSDialog v-model="dialogChooseOS" @openDialog="openDialogPayloadList"
                    @closeDialog="closeDialogChooseOS"></ChooseOSDialog>

    <!-- Payload Dialog -->
    <payload-dialog
      :title="dialogTitle"
      :isModalOpen="dialogOpen"
      :tabs="payloadTabs"
      :saving="saving"
      :operatingSystem="operatingSystemPayload"
      :payloadId="payloadId"
      @close-modal="closeDialog"
      @NewPayload="NewPayloadMethod"
      @SavePayload="SaveUpdatedPayload"
    ></payload-dialog>

  </div>
</template>

<script>
import PayloadDialog from '@/components/home/uemProfile/payloadComponents/PayloadDialog.vue';
import axios from "axios";
import ConfigurePayload from "@/components/home/uemProfile/payloadComponents/ConfigurePayload.vue";
import ChooseOSDialog from "@/components/global/ChooseOSDialog.vue";
import translateService from "@/globalServices/translate";
import PayloadTable from '@/components/home/uemProfile/payloadComponents/ProfilesTable.vue';
import utilsFunctions from "@/globalServices/utilsFunctions";
import ProfileAssociation from "@/components/home/uemProfile/payloadComponents/ProfileAssociation.vue";
import apiService from "@/globalServices/apiService";

export default {
  components: {
    ProfileAssociation,
    ConfigurePayload,
    PayloadDialog,
    ChooseOSDialog,
    PayloadTable
  },
  created() {
    this.loadingProfilesTable = true;
    this.LoadProfilesApi();
    this.loadingProfilesTable = false;
  },
  name: "GroupView",
  data() {
    return {
      loadingProfilesTable: false,
      profileList: [],
      updatedPayload: null,
      currentPage: 1,
      rowsPerPage: 10,
      totalItems:0,
      selectedLanguage: '',
      selectedDevicesGroup: [],
      selectedUsersGroup: [],
      textGroupName: '',
      selectedTabGruppi: 0,
      tabsGruppi: [],
      tabsCopyPastePayload: [],
      tabAddUpdateGroup: "",
      pageDevicesAddUpdateGroup: 1,
      itemsPerPageDevicesAddUpdateGroup: 20,
      headersTableDevicesAddUpdateGroup: [
        {title: '', align: 'start', key: 'icon',},
        {title: this.getTranslation('NAME'), key: 'name', align: 'start'},
        {title: this.getTranslation('SERIAL'), key: 'serial', align: 'start'},
        {title: this.getTranslation('STATUS'), key: 'status', align: 'start'},
        {title: this.getTranslation('ACTIONS'), sortable: false, key: 'actions', align: 'end'},
      ],
      devicesAddUpdateGroup: [],
      serverItemsDevicesAddUpdateGroup: [],
      loadingDevicesAddUpdateGroup: true,
      totalItemsDevicesAddUpdateGroup: 0,
      sortByDevicesAddUpdateGroup: [{key: 'id', order: 'asc'}],
      initialSortTableDevicesAddUpdateGroup: true,
      itemsDevicesAddUpdateGroup: [],
      pageUsersAddUpdateGroup: 1,
      itemsPerPageUsersAddUpdateGroup: 20,
      headersTableUsersAddUpdateGroup: [
        {
          title: '',
          align: 'start',
          key: 'avatar',
        },
        {title: this.getTranslation('USERNAME'), key: 'email', align: 'start'},
        {title: this.getTranslation('NAME/SURNAME'), key: 'name', align: 'start'},
        {title: this.getTranslation('ROLE'), key: 'role', align: 'start'},
        {title: this.getTranslation('ACTIONS'), key: 'actions', align: 'end'},
      ],
      usersAddUpdateGroup: [],
      serverItemsUsersAddUpdateGroup: [],
      loadingUsersAddUpdateGroup: true,
      totalItemsUsersAddUpdateGroup: 0,
      sortByUsersAddUpdateGroup: [{key: 'id', order: 'asc'}],
      initialSortTableUsersAddUpdateGroup: true,
      itemsUsersAddUpdateGroup: [],
      saving: false,
      operatingSystemPayload: null,
      indexPayloadToUpdate: 0,
      dialogChooseOS: false,
      dialogTitle: '',
      dialogOpen: false,
      dialogGroup: false,
      payloadTabs: [],
      NewPayloadReceived: {
        id: 0,
        name: "",
        description: "",
        operatingSystem: "",
        devices: [],
        users: [],
        tags: [],
        datetime: "",
        payloadList: []
      },
      payloadId: 0,
      dialogCopyPastePayload: false,
      selectedGroupsCopyPastePayload: [],
      headersGroupsCopyPastePayload: [
        {
          text: this.getTranslation('GRUPPI'),
          align: 'start',
          value: 'title',
        },
        {text: 'Seleziona', align: 'end', value: 'actions', sortable: false},
      ],
      selectedPayloadToCopy: [],
      selectedPayloadToMove: [],
      importedJsonFilePayload: [],
      editGroup: false,
      indexGroup: 0,
      tableFilters: {
        operatingSystem: '',
        startDate: '',
        endDate: '',
      }
    };
  },
  props: {
    isTabFocused: {
      type: Boolean,
      default: true,
    },
    windowHeight: {
      type: Number,
    }
  },
  methods: {
    refreshTableProfiles({operatingSystem, startDate, endDate}){
      this.tableFilters.operatingSystem = operatingSystem;
      this.tableFilters.startDate = startDate;
      this.tableFilters.endDate = endDate;

      this.LoadProfilesApi();
    },
    closeDialogChooseOS() {
      this.dialogChooseOS = false
    },
    openDialogChooseOS() {
      this.dialogChooseOS = true
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    async LoadProfilesApi() {
      try {
        const response = await apiService.axiosToBackend().get("/api/uem/profile", {
          params: {
            filters: JSON.stringify({
              paginate: true,
              page: this.currentPage,
              rowsPerPage: this.rowsPerPage,
              operatingSystem: this.tableFilters.operatingSystem,
              startDate: this.tableFilters.startDate,
              endDate: this.tableFilters.endDate,
            })
          }
        });
        this.profileList = response.data.payload.items;
        this.rowsPerPage = response.data.payload.rowsPerPage ?? 10
        this.currentPage = response.data.payload.page ?? 1
        this.totalItems = response.data.payload.totalItems ?? 0
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
    },
    closeDialog() {
      this.dialogOpen = false;
      this.LoadProfilesApi();
    },
    async NewPayloadMethod(newProfile) {
      this.$root.$dialogLoader.start(this.getTranslation('GENERATION'), {}, async () => {
        await this.SavePayload(newProfile)
      }, true);

    },
    async SavePayload(newProfile) {
      this.NewPayloadReceived.datetime = newProfile[0].datetime
      this.NewPayloadReceived.name = newProfile[0].name
      this.NewPayloadReceived.description = newProfile[0].description
      this.NewPayloadReceived.devices = []
      this.NewPayloadReceived.users = []
      this.NewPayloadReceived.tags = []
      this.NewPayloadReceived.operatingSystem = newProfile[0].operatingSystem
      newProfile.shift();
      this.NewPayloadReceived.payloadList = newProfile

      try {
        const response = await apiService.axiosToBackend().post("api/uem/profile/create",
          this.NewPayloadReceived
        );
        await this.LoadProfilesApi()
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
    },
    SaveUpdatedPayload(profilesList) {
      this.updatedPayload.datetime = profilesList[0].datetime
      this.updatedPayload.profileDisplayName = profilesList[0].name
      this.updatedPayload.profileDescription = profilesList[0].description
      profilesList.shift();
      this.updatedPayload.payloadList = profilesList

      this.$root.$dialogLoader.start(this.getTranslation('SAVING'), {}, async () => {
        await this.SaveUpdatedPayloadApi()
      }, true);

      this.saving = false;
    },
    async SaveUpdatedPayloadApi(){
      try {
        const response = await apiService.axiosToBackend().put("api/uem/profile/update/"+this.updatedPayload.id,
          this.updatedPayload
        );
        await this.LoadProfilesApi()
      } catch (error) {
        await this.LoadProfilesApi()
        utilsFunctions.handleServerResponseException(error);
      }
    },
    handleFileUpload(event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const jsonContent = event.target.result;
          try {
            this.importedJsonFilePayload = JSON.parse(jsonContent)
            this.loadPayloadMethod()
          } catch (error) {
            utilsFunctions.handleServerResponseException(error);
          }
        };

        reader.readAsText(selectedFile);
      }
    },
    loadPayloadProfile() {
      this.importedJsonFilePayload = [];
      this.NewPayloadReceived = [];
      this.$refs.jsonFileInput.value = ""; // Reimposta il valore dell'input di tipo file
      this.$refs.jsonFileInput.click();
    },
    downloadPayload(item) {
      this.downloadJSON(item, 'payload.json');
    },
    downloadJSON(jsonData, filename) {
      // Create a Blob object with the JSON data
      const blob = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      // Trigger a click event on the link element
      a.click();

      // Release the URL and remove the link element
      URL.revokeObjectURL(url);
    },
    async duplicatePayload(item) {
      const result = await this.$root.$confirm(
        this.getTranslation('DUPLICATE') + "?",
        this.getTranslation('DUPLICATE_SELECTED_PAYLOAD_PROFILE'),
        {color: 'primary'}
      );
      if (result) {
        this.$root.$dialogLoader.start(this.getTranslation('DUPLICATING'), {}, async () => {
          let duplicatedProfile = item
          duplicatedProfile.profileDisplayName = item.profileDisplayName + " - copy"

          await this.duplicatePayloadApi(duplicatedProfile)
        }, true);
      }

    },
    async duplicatePayloadApi(duplicatedProfile){
      try {
        const response = await apiService.axiosToBackend().post("api/uem/profile/create",
          duplicatedProfile
        );

        await this.LoadProfilesApi()
      } catch (error) {
        await this.LoadProfilesApi()
        utilsFunctions.handleServerResponseException(error);
      }
    },
    async deletePayload(item) {
      const result = await this.$root.$confirm(
        this.getTranslation('DELETE') + "?",
        this.getTranslation('DELETE_SELECTED_PAYLOAD_PROFILE'),
        {color: 'primary'}
      );
      if (result) {
        this.profileList = this.profileList.filter(arr => {
          if (arr.length > 0 && arr[0].id === item.id) {
            // Exclude the array where name and operatingSystem match
            return false;
          }
          // Include all other arrays
          return true;
        });

        this.$root.$dialogLoader.start(this.getTranslation('DELETING'), {}, async () => {
          await this.deletePayloadApi(item.id)
        }, true);
      }
    },
    async deletePayloadApi(index) {
      try {
        // Perform the actual API call for deletion here using the provided id
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await apiService.axiosToBackend().delete("api/uem/profile/"+ index);

        await this.LoadProfilesApi();

      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
    },
    async editPayload(item) {
      this.loadingProfilesTable = true;
      this.indexPayloadToUpdate = item.id;
      this.saving = true;
      let outputMergedPayloads = null;
      this.payloadId = parseInt(item.id)
      this.updatedPayload = item
      this.operatingSystemPayload = item.operatingSystem

      outputMergedPayloads = await this.callAPIPayload(item.operatingSystem)
      outputMergedPayloads = outputMergedPayloads.map(tab => ({
        name: tab.PayloadName,
        icon: tab.icon,
        Fields: tab.Fields,
        config: tab.config,
        ...(tab.categorized === true ? {categories: getUniqueCategories(tab.Fields)} : {}),
        ...(tab.osCategorized === true ? {osCategories: getUniqueCategoriesOS(tab.Fields)} : {})
      }));

      function getUniqueCategories(fields) {
        const categories = [];
        fields.forEach(field => {
          if (field.category && !categories.includes(field.category)) {
            categories.push(field.category);
          }
        });
        return categories;
      }

      function getUniqueCategoriesOS(fields) {
        const osCategories = [];

        fields.forEach(field => {
          if (field.os && Array.isArray(field.os)) {
            field.os.forEach(os => {
              if (!osCategories.includes(os)) {
                osCategories.push(os);
              }
            });
          }
        });
        return osCategories;
      }

      for (const payloadObj of outputMergedPayloads) {
        // Find the matching content based on PayloadName
        const matchingContent = item.payloadList.find(item => item.payloadDisplayName === payloadObj.name);
        if (matchingContent) {
          // Update Fields with matching content values based on id
          payloadObj.Fields.forEach(field => {
            // JSON_PARSE THE PARAMS OF THE PAYLOAD
            const matchingContentItem = JSON.parse(matchingContent.params).find(contentItem => contentItem.id === field.id);
            if (matchingContentItem) {
              if (matchingContentItem.input_type === 'form' && field.input_type === 'form') {

                for (const input1 of field.form_inputs) {
                  const matchingInput2 = matchingContentItem.form_inputs.find(input2 => input2.id === input1.id);
                  if (matchingInput2) {
                    input1.form_outputs = matchingInput2.form_outputs;
                  }
                }
              }

              field.value = matchingContentItem.value;
              field.options = matchingContentItem.options;

              if (field.form_outputs) {
                field.form_outputs = matchingContentItem.form_outputs;
              }
            }
          });
          // JSON_PARSE THE CONFIG OF THE PAYLOAD
          payloadObj.config = JSON.parse(matchingContent.config);
        }
      }

      this.payloadTabs = outputMergedPayloads

      this.dialogTitle = this.payloadTabs[0].Fields[0].value
      this.loadingProfilesTable = false
      this.dialogOpen = true;
    },
    async callAPIPayload(payloadType) {
      // chiamata api per prendere la lista di payloads in base al sistema operativo,
      // (serviva per json-server), eliminare e rimpiazzare con singola rotta.
      let response = [];

      try {
        response = await apiService.axiosToBackend().post("api/uem/profile/payloadList", {
          osType: payloadType
        }
      );
      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
      return response.data.payload;
    },
    async openDialogPayloadList(operatingSystem) {
      this.dialogChooseOS = false;

      this.payloadId = this.profileList?.length ?? 1 // TODO: remove
      this.operatingSystemPayload = operatingSystem;
      const payload = await this.callAPIPayload(operatingSystem)

      this.payloadTabs = payload.map(tab => ({
        name: tab.PayloadName,
        icon: tab.icon,
        Fields: tab.Fields,
        config: tab.config,
        ...(tab.categorized === true ? {categories: getUniqueCategories(tab.Fields)} : {}),
        ...(tab.osCategorized === true ? {osCategories: getUniqueCategoriesOS(tab.Fields)} : {})
      }));

      function getUniqueCategories(fields) {
        const categories = [];
        fields.forEach(field => {
          if (field.category && !categories.includes(field.category)) {
            categories.push(field.category);
          }
        });
        return categories;
      }

      function getUniqueCategoriesOS(fields) {
        const osCategories = [];

        fields.forEach(field => {
          if (field.os && Array.isArray(field.os)) {
            field.os.forEach(os => {
              if (!osCategories.includes(os)) {
                osCategories.push(os);
              }
            });
          }
        });
        return osCategories;
      }

      //TODO cambiare titolo in base a determinati fattori
      this.dialogTitle = 'Nuovo Profilo';
      this.dialogOpen = true;
    },
    async loadPayloadFromFile(loadedProfile) {
      this.$root.$dialogLoader.start(this.getTranslation('LOADING_PROFILE'), {}, async () => {

        try {
          const response = await apiService.axiosToBackend().post("api/uem/profile/loadfromfile",
            loadedProfile
          );
          await this.LoadProfilesApi();
        } catch (error) {
          utilsFunctions.handleServerResponseException(error);
        }
      }, true);

    },
    async loadPayloadMethod() {
      //cambiare l'id del payload in base agli id presenti in listaPayload del gruppo:
      const currentIdPayload = this.importedJsonFilePayload[0].id
      let newIdPayload = 0;

      // Trova il gruppo selezionato
      const selectedGroup = this.profileList;

      // Verifica se il currentId esiste in uno dei payload del gruppo selezionato
      const idExists = selectedGroup.listaPayload.some(payload => payload[0].id === currentIdPayload);

      // Se il currentId esiste, calcola il nuovo ID come il massimo ID + 1, altrimenti mantieni il currentId
      if (idExists) {
        const maxId = Math.max(
          ...this.tabsGruppi.flatMap(group => group.listaPayload.flatMap(payload => payload[0].id))
        );

        newIdPayload = maxId + 1;
      } else {
        newIdPayload = currentIdPayload;
      }
      //this.importedJsonFilePayload[0].id = newIdPayload

      this.NewPayloadReceived = this.importedJsonFilePayload;
      await this.SavePayload()
    }
  },
  watch:{
    loadingProfilesTable(newVal){
      this.loadingProfilesTable = newVal
    }
  }
}
</script>

<style>
.modal-header {
  padding: 0px !important;
  margin-bottom: 0px !important;
}

.h5-header {
  font-weight: 800 !important;
  font-size: 20px;
  line-height: 55px;
  color: white;
  margin: unset !important;
  text-align: center !important;
}

.modal-header {
  padding: 10px 25px !important;
  margin-bottom: 30px !important;
  text-align: left !important;
  border-bottom: 1px solid white;
}

#selectOs .fa {
  font-size: 10vh;
  line-height: 110px;
  cursor: pointer;
  width: 35vh;
  border-radius: 15px;
  text-align: center;
  padding: 19px 60px 40px 60px;
  margin: 0 15px;
  position: relative;
  display: table-cell;
  height: 23vh;
  margin: 15px;
  display: inline-block;
  box-shadow: 0 5px 10px rgb(0 0 0 / 15%)
}

#selectOs .fa span, #selectOs .fab span, #selectFilterMethod .fab span, #selectFilterMethod .fa span {
  font-family: "Gotham", "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #2c2c2c;
  line-height: 50px
}

#selectOs .fa:hover, #selectOs .fab:hover, #selectFilterMethod .fab:hover, #selectFilterMethod .fa:hover {
  color: white !important;
  background-color: #0059a9
}

#selectOs .fa:hover span, #selectOs .fab:hover span, #selectFilterMethod .fab:hover span, #selectFilterMethod .fa:hover span {
  color: white
}
</style>
