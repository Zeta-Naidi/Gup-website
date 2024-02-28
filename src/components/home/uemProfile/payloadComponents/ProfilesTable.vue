<template>

  <div>
    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="items"
      :loading="loading"
      :items-length="totalItems"
      @update:options="refreshTable()"
      fixed-header
      multi-sort
      mobile-breakpoint="0"
      :items-per-page-text="getTranslation('ROWS_PER_PAGE')"
      :show-current-page="true"
      :show-first-last-page="true"
      :items-per-page-options="[5, 10, 15, 20]"
      class="fadeNewRows"
      transition="slide-y-transition"
  >

    <template v-slot:top>
      <v-toolbar>
        <v-toolbar-title>
          <div class="d-flex ml-5" style="font-size: 20px">
            {{ getTranslation('PROFILES') }}
          </div>
        </v-toolbar-title>
        <v-spacer></v-spacer>
<!--        <v-row style="max-width: 40%;" class="mr-5 py-2" v-if="!$vuetify.display.mobile"> &lt;!&ndash;  &ndash;&gt;
          <v-col cols="6">
            <v-menu
                v-model="menuStartDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                    :value="startDate"
                    :label="getTranslation('FROM')"
                    prepend-icon="mdi-calendar"
                    readonly
                    hide-details="auto"
                    outlined
                ></v-text-field>
              </template>
              <v-date-picker
                  v-model="startDate"
                  @input="menuStartDate = false"
                  :locale="getDatePickerLanguage()"
              />
            </v-menu>
          </v-col>
          <v-col cols="6">
            <v-menu
                v-model="menuEndDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                    :value="endDate"
                    :label="getTranslation('TO')"
                    prepend-icon="mdi-calendar"
                    readonly
                    hide-details="auto"
                    outlined
                ></v-text-field>
              </template>
              <v-date-picker v-model="endDate" @input="menuEndDate = false"
                             :locale="getDatePickerLanguage()"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>-->

        <v-btn outlined color="primary" class="mr-2" @click="refreshTable">
          {{getTranslation('REFRESH_TABLE')}}
          <v-icon class="icons">
            mdi-refresh
          </v-icon>
        </v-btn>
        <v-btn outlined color="primary" class="mr-2" @click="AddProfileOpenChoosOsDialog">
          {{getTranslation('ADD')}}
          <v-icon class="icons">
            mdi-account-plus
          </v-icon>
        </v-btn>
        <input
          type="file"
          ref="jsonFileInput"
          accept=".json"
          style="display: none"
          @change="handleFileUpload"
        >
        <v-btn
          outlined color="primary" class="mr-2"
          @click="loadPaylodProfile">
          {{getTranslation('LOAD')}}
          <v-icon class="icons">
            mdi-account-arrow-right
          </v-icon>
        </v-btn>

        <v-spacer></v-spacer>

          <v-menu v-model="menuFilters" offset-y :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" outlined color="primary" class="mr-2">
                {{ getTranslation('FILTERS') }}
                <v-badge
                  v-if="numFilters() > 0"
                  color="#63adf2"
                  :offset-y="-10"
                  :offset-x="-5"
                  :content="numFilters()"
                >
                  <v-icon>
                    mdi-filter
                  </v-icon>
                </v-badge>
              </v-btn>
            </template>
            <v-card width="400" style="border-color: #63adf2; border-style: solid">
              <v-card-text style="height: 550px">
                <p>{{ getTranslation('FILTER_BY_OSTYPE') }}</p>
                <v-select
                  v-model="operatingSystem"
                  :items="osOptionsFilters"
                  :label="getTranslation('OPERATING_SYSTEM')"
                  item-title="key"
                  item-value="value"
                  density="comfortable"
                ></v-select>
                <v-divider></v-divider>

              <p>{{ getTranslation('FILTER_BY_DATE') }}</p>
              <VueDatePicker
                v-model="startDate"
                :placeholder="getTranslation('CLICK_TO_SELECT_THE_START_DATE')"
                text-input
                :month-change-on-scroll="false"
                auto-apply>
              </VueDatePicker>
              <br>
              <VueDatePicker
                v-model="endDate"
                :placeholder="getTranslation('CLICK_TO_SELECT_THE_END_DATE')"
                text-input
                :month-change-on-scroll="false"
                auto-apply>
              </VueDatePicker>
            </v-card-text>
            <v-card-actions style="height: 50px">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                @click="resetFilters"
                :loading="loading"
                class="mr-2"
              >
                {{ getTranslation('RESET_FILTERS') }}
              </v-btn>
              <v-btn
                color="primary"
                @click="refreshTable"
                :loading="loading"
                class="mr-2"
              >
                {{ getTranslation('APPLY') }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-toolbar>
    </template>

    <template v-slot:header.name>
      {{ getTranslation('NAME') }}
    </template>
    <template v-slot:header.devices>
      {{ getTranslation('DEVICES_ASSOCIATED') }}
    </template>
    <template v-slot:header.users>
      {{ getTranslation('USERS_ASSOCIATED') }}
    </template>
    <template v-slot:header.tags>
      {{ getTranslation('TAGS_ASSOCIATED') }}
    </template>
    <template v-slot:header.payloadList>
      {{ getTranslation('PAYLOADS') }}
    </template>
    <template v-slot:header.date>
      {{ getTranslation('DATE') }}
    </template>
    <template v-slot:header.actions>
      {{ getTranslation('ACTIONS') }}
    </template>

    <template v-slot:item.name="{ item }">
      <v-icon v-if="item.operatingSystem === 'Windows'" style="color: #0076FD">mdi-microsoft-windows</v-icon>
      <v-icon v-else-if="item.operatingSystem === 'Apple'" style="color: #000000" >mdi-apple</v-icon>
      <v-icon v-else-if="item.operatingSystem === 'Android'" style="color: #3dda84">mdi-android</v-icon>
      <v-icon v-else>mdi-asterisk</v-icon>
      {{item.profileDisplayName}}
    </template>

    <template v-slot:item.devices="{ item }">
      <v-chip
          style="margin-right: 3vh; background-color: #777; color: white"
          size="large"
          label
          @click="openProfileAssociationDialog('devices', item.id)"
      >
        <template v-if="item?.devices?.length > 1">
          <p style="font-weight: 700;font-size: 12px;margin-right: 1vh;">{{ getTranslation('DEVICES') }}: {{item.devices.length}}</p>
        </template>
        <template v-else>
          <p style="font-weight: 700;font-size: 12px">{{ getTranslation('EMPTY') }}</p>
        </template>
      </v-chip>
    </template>

    <template v-slot:item.users="{ item }">
      <v-chip
          style="margin-right: 3vh; background-color: #777; color: white"
          size="large"
          label
          @click="openProfileAssociationDialog('users', item.id)"
      >
        <template v-if="item?.users?.length > 1">
          <p style="font-weight: 700;font-size: 12px;margin-right: 1vh;">{{ getTranslation('USERS') }}: {{item.users.length}}</p>
        </template>
        <template v-else>
          <p style="font-weight: 700;font-size: 12px">{{ getTranslation('EMPTY') }}</p>
        </template>
      </v-chip>
    </template>

    <template v-slot:item.tags="{ item }">
      <v-chip
          style="margin-right: 3vh; background-color: #777; color: white"
          size="large"
          label
          @click="openProfileAssociationDialog('tags', item.id)"
      >
        <template v-if="item?.tags?.length > 1">
          <p style="font-weight: 700;font-size: 12px;margin-right: 1vh;">{{ getTranslation('TAGS') }}: {{item.tags.length}}</p>
        </template>
        <template v-else>
          <p style="font-weight: 700;font-size: 12px">{{ getTranslation('EMPTY') }}</p>
        </template>
      </v-chip>
    </template>

    <template v-slot:item.payloadList="{ item }">
      <v-chip
          style="margin-right: 3vh; background-color: #777; color: white; max-width: 35vh"
          size="large"
          :label="true"
          @click="payloadRowClicked(item)"
      >
        <template v-if="item?.payloadList?.length > 1">
          <p style="font-weight: 700;font-size: 12px;margin-right: 1vh;">{{ getTranslation('PAYLOADS') }}: {{item.payloadList.length-1}}</p>
        </template>
        <template v-else>
          <p style="font-weight: 700;font-size: 12px">{{ getTranslation('EMPTY') }}</p>
        </template>
      </v-chip>
    </template>

    <template v-slot:item.date="{ item }">
      <p class="v_text_field_datetime">{{ item.createdAt }}</p>
    </template>

    <template v-slot:item.actions="{ item, index }">
      <v-icon
          color="primary"
          class="icons"
          @click.stop="payloadRowClicked(item)">
        mdi-account-edit
      </v-icon>

      <v-icon
          color="primary"
          class="icons"
          @click.stop="downloadPayload(item)">
        mdi-download
      </v-icon>

      <v-icon
          color="primary"
          class="icons"
          @click.stop="duplicatePayload(item)">
        mdi-content-copy
      </v-icon>

      <v-icon
          color="red"
          class="icons"
          @click.stop="deletePayload(item)">
        mdi-delete
      </v-icon>
    </template>
  </v-data-table-server>

    <!-- Dialog Profile Association-->
    <ProfileAssociation :type="typeProfileAssociation" v-model="profileAssociationDialog" :profileID="profileID" :selectedIds="selectedIds" @close="closeProfileAssociationDialog" @save="saveProfileAssociationDialog"></ProfileAssociation>

  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import axios from "axios";
import utilsFunctions from "@/globalServices/utilsFunctions";
import ProfileAssociation from "@/components/home/uemProfile/payloadComponents/ProfileAssociation.vue";
import {useAppStore} from "@/plugins/pinia/app";
import ChooseOSDialog from "@/components/global/ChooseOSDialog.vue";

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

export default {
  name: "PayloadTableView",
  components:{
    ChooseOSDialog,
    ProfileAssociation,
    VueDatePicker
  },
  props:{
    items: Array,
    currentPAge: Number,
    rowsPerPage: Number,
    totalItems: Number,
    Loading: Boolean
  },
  computed: {
    languageChosen: {
      get() {
        return useAppStore().languageChosen;
      }
    },
  },
  data(){
    return {
      itemsPerPage:this.rowsPerPage,
      osOptionsFilters: [
        { key: this.getTranslation('ALL'), value: '' },
        { key: this.getTranslation('APPLE'), value: 'APPLE' },
        { key: this.getTranslation('ANDROID'), value: 'ANDROID' },
        { key: this.getTranslation('WINDOWS'), value: 'WINDOWS' },
        { key: this.getTranslation('MIXED'), value: 'MIXED' },
      ],
      filtersMenu: false,
      loading: true,
      dialogChooseOS: false,
      profileID: null,
      headers: [
        {text: '', value: "name", sortable: true, width: "20%"},
        {text: '', value: "devices", sortable: false, width: "10%"},
        {text: '', value: "users", sortable: false, width: "10%"},
        {text: '', value: "tags", sortable: false, width: "10%"},
        {text: '', value: "payloadList", sortable: false, width: "10%"},
        {text: '', value: "date", sortable: false, width: "15%", align: 'center'},
        {text: '', value: "actions", sortable: false, width: "15%", align: 'center'},
      ],
      headersProfileAssociation:[
        {text: '', value: "name", sortable: true, width: "15%"},
        {text: '', value: "devices", sortable: false, width: "10%"},
        {text: '', value: "users", sortable: false, width: "10%"},
        {text: '', value: "tags", sortable: false, width: "10%"},
        {text: '', value: "payloadList", sortable: false, width: "15%"},
        {text: '', value: "date", sortable: false, width: "15%", align: 'center'},
        {text: '', value: "actions", sortable: false, width: "15%", align: 'center'},
      ],
      itemsProfileAssociation: [],
      menuStartDate: undefined,
      menuEndDate: undefined,
      menuFilters: false,
      profileAssociationDialog: false,
      typeProfileAssociation: undefined,

      //filters:
      operatingSystem: '',
      startDate: '',
      endDate: '',

      selectedIds: []
    }
  },
  methods:{
    numFilters(){
      const filters = {
        operatingSystem: this.operatingSystem,
        startDate: this.startDate,
        endDate: this.endDate,
      };

      return Object.values(filters).filter(value => value !== '').length;
    },
    resetFilters(){
      this.filtersMenu = false

      this.operatingSystem = '';
      this.startDate = '';
      this.endDate = '';

      this.refreshTable()
    },
    profileShowCorrectDate(created_at, updated_at) {
      const createdDate = new Date(created_at);
      const updatedDate = new Date(updated_at);

      if (updatedDate > createdDate) {
        return updatedDate.toLocaleString();
      } else {
        return createdDate.toLocaleString();
      }
    },
    refreshTable(){
      this.filtersMenu = false;
      this.loading = true;

      let operatingSystem = this.operatingSystem;
      let startDate = this.startDate;
      let endDate = this.endDate;

      this.$emit('refreshTable', {operatingSystem, startDate, endDate});
    },
    AddProfileOpenChoosOsDialog(){
      this.$emit('openDialogChooseOS');
    },
    closeDialogChooseOS(){
        this.dialogChooseOS = false
    },
    saveProfileAssociationDialog(receivedInfo){
      this.profileAssociationDialog = false
      //TODO: aggiornare il profilo con i dati ritornati dal metodo:
      // merge dei dati nel profile
      const foundObject = this.items.find(item => item.id === receivedInfo.profileID);
      if(receivedInfo.type === "devices"){
        foundObject.devices = receivedInfo.ids
      }else if(receivedInfo.type === "users"){
        foundObject.users = receivedInfo.ids
      }else if(receivedInfo.type === "tags"){
        foundObject.tags = receivedInfo.ids
      }

      this.$root.$dialogLoader.start(this.getTranslation('SAVING'), {}, async () => {
        try {
          // Perform the actual API call for deletion here using the provided id
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const response = await fetch("http://localhost:3000/ProfilesList/"+receivedInfo.profileID, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(foundObject)
          })
          this.LoadProfilesApi()
              .then((data) => {
                this.profileList = data;
              })
        } catch (error) {
          utilsFunctions.handleServerResponseException(error);
        }
      }, true);


      this.profileAssociationDialog = false;
    },
    closeProfileAssociationDialog(){
      this.profileAssociationDialog = false;
    },
    async openProfileAssociationDialog(type,profileID){
      this.profileID = parseInt(profileID)
      this.typeProfileAssociation= type
      this.profileAssociationDialog = true;

      try {
        const response = await axios.get("http://localhost:3000/ProfilesList/"+profileID);

        this.selectedIds = response.data[type]

      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    payloadRowClicked(item) {
      this.loading = true
      this.$emit('editPayload', item);
    },
    deletePayload(item){
      this.$emit('deletePayload', item);
    },
    duplicatePayload(item){
      this.$emit('duplicatePayload', item);
    },
    downloadPayload(item){
      this.$emit('downloadPayload', item);
    },
    loadPaylodProfile(){
      this.importedJsonFilePayload = [];
      this.NewPayloadReceived = [];
      this.$refs.jsonFileInput.value = "";
      this.$refs.jsonFileInput.click();
    },
    handleFileUpload(event) {
      const selectedFile = event.target.files[0];

      if (selectedFile) {
        const reader = new FileReader();

        reader.onload = (event) => {
          const jsonContent = event.target.result;
          if (jsonContent) {
            try {
              this.$emit('loadPayloadFromFile', JSON.parse(jsonContent));
            } catch (error) {
              utilsFunctions.handleServerResponseException(error);
            }
          } else {
            console.error('File content is undefined.');
          }
        };

        reader.readAsText(selectedFile);
      }
    },
    addProfile(){
      this.$emit('addProfile');
    }
  },
  watch: {
    items() {
      this.loading = false
    }
  },
}
</script>

<style scoped>
*{
  font-size: 13px;
}

.v_text_field_datetime{
  font-size: 13px;
}

.icons{
  margin-right: 2vh;
  font-size: 20px
}
</style>
