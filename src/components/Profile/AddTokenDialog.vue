<template>
  <v-dialog
    v-model="localValue"
    persistent
    max-width="600px"
  >
    <v-card style="border-color: #63adf2; border-style: solid">
      <v-card-title class="d-flex">
        <span class="text-h5" style="color: #63adf2">{{ getTranslation('REQUEST_API_TOKEN_DESCRIPTION') }}</span>
      </v-card-title>
      <v-card-text v-if="!newToken">
        <v-form>
          <v-container>
            <v-row>
              <v-col
                cols="12"
              >
                <v-banner outlined style="color: #63adf2; width: 100%">{{ getTranslation('PERMISSION_LIST') }}</v-banner>
              </v-col>
              <div style="min-width: 100%">
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="permissionSyslogEvents"
                      inset
                      :label="getTranslation('LOGS_OF_EVENTS')"
                    ></v-switch>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="permissionSyslogApplication"
                      inset
                      :label="getTranslation('LOGS_OF_APPLICATION')"
                    ></v-switch>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="permissionMispEvents"
                      inset
                      :label="getTranslation('MISP_EVENTS')"
                    ></v-switch>
                  </div>
                </v-col>
                <v-col cols="12">
                  <v-menu
                    v-model="menuExpiredDate"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on }">
                      <v-text-field
                        v-model="expiredDate"
                        :label="getTranslation('EXPIRED_DATE')"
                        prepend-icon="mdi-calendar"
                        readonly
                        v-on="on"
                        hide-details="auto"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="expiredDate" @input="menuExpiredDate = false" :locale="getDatePickerLanguage()"></v-date-picker>
                  </v-menu>
                </v-col>
              </div>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-text v-else>
        <v-row>
          <v-col
            cols="12"
          >
            <v-banner outlined style="color: #63adf2; width: 100%">{{ getTranslation('NEW_TOKEN_DESCRIPTION') }}</v-banner>
          </v-col>
        </v-row>
        <v-alert
          outlined
          type="success"
        >
          {{newToken}}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red"
          :loading="buttonLoader"
          @click="clearData();$emit('close')"
        >
          {{ getTranslation('CLOSE') }}
        </v-btn>
        <v-btn
          v-if="!newToken"
          color="primary"
          :loading="buttonLoader"
          :disabled="!permissionMispEvents && !permissionSyslogApplication && !permissionSyslogEvents"
          @click="createToken"
        >
          {{ getTranslation('SAVE') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "AddTokenDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    localValue: false,
    buttonLoader: false,
    permissionMispEvents: false,
    permissionSyslogApplication: false,
    permissionSyslogEvents: false,
    expiredDate: null,
    isErrorDialogOpened: false,
    errorMessage: null,
    menuExpiredDate: false,
    newToken: null,
  }),
  methods: {
    async createToken() {
      this.buttonLoader = true;
      axios.defaults.withCredentials = true;
      let abilities = [];
      if(this.permissionMispEvents) abilities.push('mispEvents');
      if(this.permissionSyslogApplication) abilities.push('syslogApplications');
      if(this.permissionSyslogEvents) abilities.push('syslogEvents');
      axios
        .post(process.env.VUE_APP_BASEURL + "/api/token", {
          abilities: abilities,
          expiresAt: this.expiredDate ?? null
        })
        .then((response) => {
          if (response?.data.success) {
            this.clearData();
            this.buttonLoader = false;
            this.newToken = response.data.payload.token;
          } else if (!response?.data.success && !!response?.data.message) {
            this.buttonLoader = false;
            if (response.data.message === 'USERNAME_ALREADY_PRESENT') {
              this.errorMessage = this.getTranslation("USERNAME_ALREADY_PRESENT");
              this.isErrorDialogOpened = true;
            }
          } else {
            this.errorMessage = this.getTranslation("ERROR")
            this.isErrorDialogOpened = true;
          }
        })
        .catch((err) => {
          console.log(err)
          this.buttonLoader = false;
        });

    },
    clearData() {
      this.permissionMispEvents = false;
      this.permissionSyslogApplication = false;
      this.permissionSyslogEvents = false;
      this.expiredDate = null;
      this.newToken = null;

    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    getDatePickerLanguage(){
      return dateService.getBCP74Tag(this.languageChosen);
    }
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },

}
</script>

<style scoped>

</style>
