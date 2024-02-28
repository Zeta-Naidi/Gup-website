<template>
  <v-container>
    <v-card>
      <v-card-title class="text-h5">
        {{ getTranslation('HANDLE_DEVICES') }}
      </v-card-title>
      <v-card-text>
        <v-autocomplete
          v-model="model"
          :items="items"
          :label="getTranslation('SEARCH_DEVICE_BY_NAME_OR_SERIAL')"
          v-model:search-input="search"
          :loading="isLoading"
          :item-text="itemText"
          item-value="id"
          item-title="name"
          :placeholder="getTranslation('INSERT_AT_LEAST_4_CHARACTERS')"
          prepend-icon="mdi-cellphone-link"
          return-object
          cache-items
          @input="fetchDevice(model)"
        >

          <template #selection="{item}">
            <v-chip
              close
              color="primary"
              @click:close="model = null"
            >
              {{ itemText(item.raw) }}
            </v-chip>

          </template>

        </v-autocomplete>
      </v-card-text>
      <v-divider></v-divider>
      <v-expand-transition v-if="!!model">
        <DetailDevice
          :device-serial-number="model.serialNumber"
          :device-name="model.name"
          :load-linked-apps="false"
        />

      </v-expand-transition>
    </v-card>
  </v-container>
</template>

<script>
import translateService from "@/globalServices/translate";
import DetailDevice from "@/components/global/DetailDevice.vue";
import axios from "axios";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";

export default {
  name: "HandleDevices",
  components: {DetailDevice},
  data() {
    return {
      entries: [],
      isLoading: false,
      model: undefined,
      search: "",
      filterItems: [],
      items: [],
      enrollmentTypes: [
        {id: 1, name: "ENROLLED"},
        {id: 2, name: "SUPERVISED"},
        {id: 3, name: "NOT_ENROLLED"},
        {id: 4, name: "NOT_SUPERVISED"},
        {id: 5, name: "EXTRA"},
      ],
    };
  },
  methods: {
    async created() {
      try {

        if (this.route.params?.deviceChosen) {
          const deviceChosen = this.route.params.deviceChosen;
          await this.fetchDevice(deviceChosen.serialNumber);
          this.model = deviceChosen;
        } else if (!!this.dataNeededAfterComponentReload) {
          const deviceChosen = this.dataNeededAfterComponentReload.itemToSearch;
          if (!!deviceChosen) {
            await this.fetchDevice(deviceChosen.serialNumber);
            this.model = deviceChosen;
          }
          this.setDataNeededAfterComponentReload = null;
        }
      } catch (e) {
        this.setDataNeededAfterComponentReload = null;
        console.log(e)
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    itemText(el) {
      return !!el.name ? el.name + ' - ' + el.serialNumber : el.serialNumber
    },
    removeItemTypeFilter(item) {
      this.filterItems = this.filterItems.filter(
        (el) => el !== item.id
      );
    },
    async fetchDevice(serialOrName) {
      try {
        this.isLoading = true;
        axios.defaults.withCredentials = true;
        let res = await apiService.axiosToBackend().get("/api/device", {
          params: {
            filters: JSON.stringify({
              serialOrName: serialOrName,
              selectAttributes: ['name', 'serialNumber', 'id']
            })
          }
        });

        this.items = res.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.isLoading = false;
      }
    },
  },
  watch: {
    search(newVal) {
      if (!newVal || newVal.length < 4) return
      if (this.isLoading) return
      this.fetchDevice(newVal);
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
  ,
};
</script>


<style scoped>

</style>

<script setup>
</script>
