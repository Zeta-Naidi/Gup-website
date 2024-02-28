<template>
  <v-dialog v-model="localValue" max-width="500px" persistent>

    <v-card style="border-color: #63adf2; border-style: solid">

      <v-card-title style="color: #63adf2"> {{ getTranslation('ACTION_SUMMARY') }}</v-card-title>
      <v-card-text>
        <v-text-field
          :model-value="item.deviceName ?? item.deviceSerialNumber"
          outlined
          readonly
          :label="getTranslation('SERIAL')"
        >
        </v-text-field>
        <v-text-field
          v-if="!!item.subject"
          :model-value="item.subject"
          outlined
          readonly
          :label="getTranslation('SUBJECT')"
        >
        </v-text-field>
        <v-textarea
          :model-value="getTranslation(item.description)"
          outlined
          readonly
          :label="getTranslation('DESCRIPTION')"
        >
        </v-textarea>
        <v-textarea
          :model-value="getTranslation(item.remediationAction)"
          outlined
          readonly
          :label="getTranslation('ACTION')"
        >
        </v-textarea>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="red" @click="$emit('close')">{{ getTranslation('CANCEL') }}</v-btn>
        <v-btn color="primary" @click="resolveEvent(item)" :loading="loaderButton">
          {{ getTranslation('REPAIR') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "RepairDialog",
  data: () => ({
    localValue: undefined,
    dialog: false,
    loaderButton: false,
  }),
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    item: {
      type: Object,
      default: () => ({
        remediationAction: '',
        description: '',
        deviceSerialNumber: '',
      })
    }
  },
  mounted() {
    this.localValue = this.value;
  },
  methods: {
    async resolveEvent(item) {
      this.loaderButton = true;
      axios.defaults.withCredentials = true;

      const config = {
        headers: {'Content-Type': 'application/json'},
        withCredentials: true //forse lo devo cancellare JAVID
      };

      try {
        let response;
        if (process.env.VUE_APP_MOD === 'production') {
          response = await apiService.axiosToBackend().post(
            `/api/event/resolve/${item.id}`,// 406 NOT ACCESSABLE
            JSON.stringify({}), // Aggiungi qui i dati da inviare, se necessario
            config
          );
        } else {
          response = await apiService.axiosToBackend().put(
            `/api/event/${item.id}`, //500 INTERNAL SERVER ERRORE
            JSON.stringify({hasBeenSolved: true}),
            config
          );
        }

        if (response?.data?.success) {
          this.$emit('eventResolved', item);
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      } finally {
        this.loaderButton = false;
      }
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
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>

</style>
