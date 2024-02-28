<template>
  <v-dialog
    v-model="localValue"
    persistent
    max-width="1000px"
  >
    <v-card style="border-color: #63adf2; border-style: solid">
      <v-card-title class="d-flex">
        <span class="text-h5" style="color: #63adf2">{{ getTranslation('MANAGE_API_TOKEN') }}</span>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
          >
            <v-banner outlined style="color: #63adf2">{{ getTranslation('TOKENS_LIST') }}</v-banner>
          </v-col>
        </v-row>
        <v-data-table
          :items="tokens"
          :headers="headers"
          fixed-header
        >
          <template v-slot:header.name>
            {{ getTranslation('NAME') }}
          </template>
          <template v-slot:header.abilities>
            {{ getTranslation('ABILITIES') }}
          </template>
          <template v-slot:header.last_used_at>
            {{ getTranslation('LAST_USED_AT') }}
          </template>
          <template v-slot:header.expires_at>
            {{ getTranslation('EXPIRED_DATE') }}
          </template>
          <template v-slot:item.abilities="{ item }">
            <v-chip v-for="(ability, i) in item.abilities" :key="i">
              <div v-if="ability === 'syslogApplications'" class="mr-1">
                {{getTranslation('LOGS_OF_APPLICATION')}}
              </div>
              <div v-else-if="ability === 'syslogEvents'" class="mr-1">
                {{getTranslation('LOGS_OF_EVENTS')}}
              </div>
              <div v-else-if="ability === 'mispEvents'">
                {{getTranslation('MISP_EVENTS')}}
              </div>
              <div v-else>{{getTranslation('ERROR')}}</div>
            </v-chip>
          </template>
          <template v-slot:item.last_used_at="{ item }">
            <v-text-field
              v-if="!!item.last_used_at"
              :value="getDateString(item.last_used_at)"
              readonly
              outlined
              hide-details="auto"
              class="py-2"
            >
              <template v-slot:label>
                <v-icon style="vertical-align: middle">
                  mdi-calendar
                </v-icon>
              </template>
            </v-text-field>
            <v-text-field
              v-else
              :value="getTranslation('NEVER_USED')"
              readonly
              outlined
              hide-details="auto"
              class="py-2"
            >
              <template v-slot:label>
                <v-icon  style="position: relative; bottom: 2px">
                  mdi-information
                </v-icon>
              </template>
            </v-text-field>
          </template>
          <template v-slot:item.expires_at="{ item }">
            <v-text-field
              v-if="!!item.expires_at"
              :value="getDateString(item.expires_at)"
              readonly
              outlined
              hide-details="auto"
              class="py-2"
            >
              <template v-slot:label>
                <v-icon style="vertical-align: middle">
                  mdi-calendar
                </v-icon>
              </template>
            </v-text-field>
            <v-text-field
              v-else
              :value="getTranslation('DOESNT_EXPIRES')"
              readonly
              outlined
              hide-details="auto"
              class="py-2"
            >
              <template v-slot:label>
                <v-icon style="vertical-align: middle">
                  mdi-alert
                </v-icon>
              </template>
            </v-text-field>
          </template>
        </v-data-table>
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
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";

export default {
  name: "ManageTokenDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  created() {},
  data: () => ({
    localValue: false,
    buttonLoader: false,
    isErrorDialogOpened: false,
    errorMessage: null,
    tokens: [],
    headers: [
      {text: "Name", value: "name", sortable: false},
      {text: "Abilities", value: "abilities", sortable: false},
      {text: "Last Used At", value: "last_used_at", sortable: false},
      {text: "Expiring Date", value: "expires_at", sortable: false},
    ],
  }),
  methods: {
    fetchTokens() {
      axios.defaults.withCredentials = true;
      axios
        .get(process.env.VUE_APP_BASEURL + "/api/token")
        .then((response) => {
          if (response?.data?.success)
            this.tokens = JSON.stringify(response.data.payload);
        })
        .catch((err) => {
          console.log(err)
          //unauthorized case
          if (err.response && err.response.status === 401) {
            this.$store.commit('setCredentials', null);
            this.$router.push({name: 'Login'}).catch(() => {})
          }
          //block case
          else if (err.response && err.response.status === 429) {
            this.$store.commit('setCredentials', null);
            this.$router.push({
              name: 'Login',
              params: {
                redirectUserBlocked: true
              }
            }).catch(() => {})
          }
        });
    },
    clearData() {
      this.isErrorDialogOpened = false;
      this.errorMessage = null;
      this.tokens = []
    },
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
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen)
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
      if(!!newVal)
        this.fetchTokens();
    },
  },
  computed: {
    languageChosen() {
      return this.$store.state.language;
    }
  }

}
</script>

<style scoped>

</style>
