<template>
  <v-dialog
      :persistent="true"
      max-width="100vh"
      style="max-height: 120vh"
      v-model="profileAssociationDialogModel">
    <v-card>
      <v-card-title>
        {{ getTranslation('UPDATE_PROFILE_ASSOCIATION') }}: {{ type }}
      </v-card-title>

      <v-card-text style="max-height: 70vh">
        <v-data-table
            :headers="headers"
            :items="items"
            :items-per-page="5"
            show-select
            multiple
            item-key="id"
            v-model="localSelectedIds"
            fixed-header
            multi-sort
            mobile-breakpoint="0"
            :footer-props="{
              'items-per-page-text': getTranslation('ROWS_PER_PAGE'),
              'show-current-page': true,
              'show-first-last-page': true,
              'items-per-page-options':[3,5],
             }"
            class="fadeNewRows"
            transition="slide-y-transition">

          <template v-slot:header.header1>
            <template v-if="type === 'devices'">
              {{ getTranslation('NAME') }}
            </template>

            <template v-if="type === 'users'">
              {{ getTranslation('NAME') }} - {{ getTranslation('SURNAME') }}
            </template>

            <template v-if="type === 'tags'">
              {{ getTranslation('NAME') }}
            </template>
          </template>

          <template v-slot:header.header2>
            <template v-if="type === 'devices'">
              {{ getTranslation('OPERATING_SYSTEM') }}
            </template>

            <template v-if="type === 'users'">
              {{ getTranslation('EMAIL') }}
            </template>

            <template v-if="type === 'tags'">
              {{ getTranslation('NAME') }}
            </template>
          </template>

          <template v-slot:header.header3="{ item }">
            <template v-if="type === 'devices'">
              {{ getTranslation('SERIAL_NUMBER') }}
            </template>

            <template v-if="type === 'users'">
              {{ getTranslation('ROLE') }}
            </template>

            <template v-if="type === 'tags'">
              {{ getTranslation('NAME') }}
            </template>
          </template>

          <template v-slot:item.header1="{ item }">
            <template v-if="type === 'devices'">
              <v-icon v-if="item.operatingSystem === 'Windows'" style="color: #0076FD">mdi-microsoft-windows</v-icon>
              <v-icon v-else-if="item.operatingSystem === 'Apple'" style="color: #000000" >mdi-apple</v-icon>
              <v-icon v-else-if="item.operatingSystem === 'Android'" style="color: #3dda84">mdi-android</v-icon>
              <v-icon v-else>mdi-asterisk</v-icon>
            </template>

            <template v-if="type === 'users'">
              {{ item.surname }} {{ item.name }}
            </template>

            <template v-if="type === 'tags'">
              {{ item }}
            </template>
          </template>

          <template v-slot:item.header2="{ item }">
            <template v-if="type === 'devices'">
              {{ item.name }}
            </template>

            <template v-if="type === 'users'">
              {{ item.email }}
            </template>

            <template v-if="type === 'tags'">
              {{ item }}
            </template>
          </template>

          <template v-slot:item.header3="{ item }">
            <template v-if="type === 'devices'">
              {{ item.serial }}
            </template>

            <template v-if="type === 'users'">
              {{ item.role }}
            </template>

            <template v-if="type === 'tags'">
              {{ item }}
            </template>
          </template>

        </v-data-table>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="ml-3" color="red" @click="$emit('close')">
          {{ getTranslation('CLOSE') }}
        </v-btn>
        <v-btn class="ml-3" color="primary" @click="save">
          {{ getTranslation('SAVE') }}
        </v-btn>
      </v-card-actions>
    </v-card>

  </v-dialog>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";
import utilsFunctions from "@/globalServices/utilsFunctions";

export default {
  name: "ProfileAssociation",
  props:{
    type: String,
    profileAssociationDialog: Boolean,
    profileID: Number,
    selectedIds: Array
  },
  async created() {
    this.profileAssociationDialogModel = this.profileAssociationDialog

    if(this.type === "devices"){
      this.items = await this.LoadItemsApi(this.type)
    }
    else if (this.type === "users"){
      this.items = await this.LoadItemsApi(this.type)
    }
    else if (this.type === "tags"){
      this.items = []
    }
    else{
      this.items = []
    }
  },
  data(){
    return {
      profileAssociationDialogModel: false,
      headers: [
        {text: '', value: "header1", sortable: true, width: "20%"},
        {text: '', value: "header2", sortable: true},
        {text: '', value: "header3", sortable: true},
      ],
      items: [],
      selectedItems: this.selectedIds,
      localSelectedIds: []
    }
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  methods:{
    save(){
      this.$emit('save', {
        ids: this.localSelectedIds.map(item => item.id),
        type: this.type,
        profileID: this.profileID
      });
    },
    async LoadItemsApi(type){
      let url = "Devices";
      if(type === "users"){
        url = "Users";
      }
      try {
        // TODO: cambiare con l'API giusta - chiamata api singola, con type come parametro ?
        const response = await axios.get("http://localhost:3000/"+url);
        return response.data;

      } catch (error) {
        utilsFunctions.handleServerResponseException(error);
        return null;
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  watch:{
    async type(newVal){
      this.selectedItems = [];

      if(newVal === "devices"){
        this.items = await this.LoadItemsApi(this.type)
      }
      else if (newVal === "users"){
        this.items = await this.LoadItemsApi(this.type)
      }
      else if (newVal === "tags"){
        this.items = []
      }
      else{
        this.items = []
      }
    },
    selectedIds(newVal){
      this.localSelectedIds = newVal.map(el => ({
       id: el
      }));
    },
  }
}
</script>

<style scoped>

</style>
