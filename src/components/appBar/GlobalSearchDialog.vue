<template>
    <v-card
      class="visible"
    >
      <v-toolbar
        flat
        color="primary"
      >
        <v-btn
          class="pl-5"
          icon
          @click="$emit('close')"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title>{{getTranslation('GLOBAL_SEARCH')}}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>

        <v-progress-linear
          v-if="isLoading"
          indeterminate
          color="primary"
        ></v-progress-linear>
        <v-list
          three-line
          subheader
        >
          <v-list-subheader>{{getTranslation('DEVICES')}}</v-list-subheader>
          <v-list-item
            v-for="(device, index) in devicesFound"
            :key="index"
            style="cursor: pointer"
            @click="redirectTo('HANDLE_DEVICES', device)"
          >
            <v-list-item-media>
              <v-list-item-title>{{device.name}}</v-list-item-title>
              <v-list-item-subtitle>{{device.serialNumber}}</v-list-item-subtitle>
            </v-list-item-media>
          </v-list-item>
        </v-list>
        <v-divider></v-divider>
      </v-card-text>

      <div style="flex: 1 1 auto;"></div>
    </v-card>
</template>

<script>
import translateService from "@/globalServices/translate";
import axios from "axios";
import {useAppStore} from "@/plugins/pinia/app";
import {mapWritableState} from "pinia";
import apiService from "@/globalServices/apiService";

export default {
  name: "GlobalSearchDialog",
  data: () => ({
    localValue: false,
    devicesFound: [],
    isLoading: false,
    timeOutSearchText: null,
  }),
  props:{
    isOpen:{
      default: false,
      type: Boolean
    },
    searchText:{
      type: String
    }
  },
  methods:{
    searchDevice() {
      if (!this.searchText || this.searchText.length < 4) return
      if (this.isLoading) return

      this.isLoading = true
      axios.defaults.withCredentials = true;
      apiService.axiosToBackend()
        .get("/api/device", {
          params: {
            filters: {
              serialOrName: this.searchText,
              selectAttributes: ['name','serialNumber','id']
            }
          }
        })
        .then(res => {
          this.devicesFound = res.data.payload;
          this.isLoading = false;
        })
        .catch(err => {
          console.log(err)
          this.devicesFound = [];
          this.isLoading = false;
        })
    },
    typing(newSearchText){
      if(!!this.timeOutSearchText)
        clearTimeout(this.timeOutSearchText)
      this.timeOutSearchText = setTimeout(() => {
        this.callFetchers();
      }, 300);
    },
    callFetchers(){
      this.searchDevice();
    },
    redirectTo(where,item){
      switch (where){
        case 'HANDLE_DEVICES':
          this.$router.push({name: 'handleDevices', params: {deviceChosen: item}}).catch((e) => {
            //Case already In Handle Device View
            this.$store.commit('setDataNeededAfterComponentReload', {
              itemToSearch: item
            });
            this.$router.go();
          });
          this.$emit('close')
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
    isOpen(newVal){
      this.localValue = newVal;
    },
    searchText(newVal){
      this.typing(newVal)
    }
  },
  computed: {
    ...mapWritableState(useAppStore, ['languageChosen'])
  }
}
</script>
<style scoped>
.visible {
  animation: fadeIn 0.5s;
}
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(900px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
