<template>
  <v-dialog
    v-model="localValue"
    persistent
    max-width="800px"
  >
    <v-card style="border-color: #63adf2; border-style: solid" border>
      <v-card-title class="d-flex py-5" style="border-bottom: 1px solid #ffffff1f">
        <span class="text-h5" style="color: #63adf2">{{ getTranslation('EDIT') }}</span>
        <span class="text-h5 ml-1" style="color: #63adf2">{{ getTranslation('USER') }}</span>
      </v-card-title>
      <v-card-text style="max-height: 60vh; overflow-y: scroll">
        <v-form v-model="formValid">
          <v-container>
            <v-row align="center">
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="username"
                  label="Username"
                  hide-details="auto"
                  :rules="usernameRule"
                  prepend-inner-icon="mdi-account"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="email"
                  label="Email"
                  hide-details="auto"
                  :rules="emailRule"
                  outlined
                  prepend-inner-icon="mdi-email"
                ></v-text-field>
              </v-col>
              <v-col cols="4" v-if="user.rolesUser.relationship === 'distributor'">
                <v-switch
                  v-model="levelAdmin"
                  :inset="true"
                  color="primary"
                  hide-details="auto"
                  :label="!levelAdmin ? getTranslation('NORMAL_USER') : getTranslation('ADMIN')"
                ></v-switch>
              </v-col>
              <v-col :cols="user.rolesUser.relationship === 'distributor' ? 8 : 12">
                <v-select
                  v-model="userRelationship"
                  :items="[
                      {text: 'DISTRIBUTOR', value:'distributor'},
                      {text: 'RESELLER', value:'reseller'},
                      {text: 'CLIENT', value:'client'},
                    ].filter(el =>
                      user.levelAdmin >= 1 ||
                      (el.value === user.rolesUser.relationship && !user.rolesUser.clientsFilter) ||
                      ((user.rolesUser.relationship === 'reseller' || user.rolesUser.relationship === 'distributor') && el.value === 'client')
                    )"
                  :label="getTranslation('CHOOSE_RELATIONSHIP')"
                  item-value="value"
                  :readonly="!!levelAdmin"
                  :disabled="!!levelAdmin"
                  hide-details="auto"
                  prepend-inner-icon="mdi-relation-many-to-many"
                  attach
                  outlined
                >
                  <template v-slot:selection="{item}">
                    {{ getTranslation(item.text) }}
                  </template>
                  <template v-slot:item="{item}">
                    {{ getTranslation(item.text) }}
                  </template>

                </v-select>
              </v-col>
              <v-col cols="12" v-if="chooseRelationshipItems">
                <v-autocomplete
                  v-model="userRelationshipsChosen"
                  :items="userRelationship === 'client' ? itemsClientsUserRelationship : itemsResellers"
                  :label="userRelationship === 'client' ? getTranslation('CHOOSE_CLIENTS') : getTranslation('CHOOSE_RESELLERS')"
                  item-value="id"
                  :item-text="item => (userRelationship === 'client' ? item.companyName : item.name)"
                  multiple
                  attach
                  outlined
                  hide-details="auto"
                  prepend-inner-icon="mdi-sitemap"
                >
                  <template v-slot:selection="{item}">
                    <v-chip
                      close
                      color="primary"
                      @click:close="userRelationshipsChosen = userRelationshipsChosen.filter(el => el !== item.id)"
                    >
                      {{ userRelationship === 'client' ? item.companyName : item.name }}
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="configurationPermission"
                  inset
                  color="primary"
                  hide-details="auto"
                  :label="getTranslation('CONFIGURATION_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="iamPermission"
                  inset
                  color="primary"
                  hide-details="auto"
                  :label="getTranslation('IAM_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="accessLogsPermission"
                  inset
                  color="primary"
                  hide-details="auto"
                  :label="getTranslation('ACCESS_LOGS_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="systemLogsPermission"
                  inset
                  color="primary"
                  hide-details="auto"
                  :label="getTranslation('SYSTEM_LOGS_PERMISSION')"
                ></v-switch>
              </v-col>
              <div v-if="!levelAdmin" style="min-width: 100%">
                <v-divider/>
                <p style="color: #63adf2;" class="px-3 pt-3"> {{ getTranslation('OPTIONAL_FILTERS') }}</p>
                <v-col cols="12" v-if="userRelationship !== 'client'">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="filterClient"
                      inset
                      color="primary"
                      hide-details="auto"
                      :label="getTranslation('CLIENTS_FILTER')"
                    ></v-switch>
                    <v-spacer></v-spacer>
                    <v-autocomplete
                      v-if="filterClient"
                      v-model="clientsSelected"
                      style="max-width: 300px"
                      item-text="companyName"
                      item-value="id"
                      :label="getTranslation('OBSERVABLE_CLIENTS')"
                      :items="itemsClientsFilter"
                      multiple
                      return-object
                      attach
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          close
                          color="primary"
                          @click:close="clientsSelected = clientsSelected.filter(el => el !== item.id)"
                        >
                          {{ item.companyName }}
                        </v-chip>
                      </template>
                    </v-autocomplete>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="filterEventType"
                      inset
                      color="primary"
                      hide-details="auto"
                      :label="getTranslation('EVENT_TYPE_FILTER')"
                    ></v-switch>
                    <v-spacer></v-spacer>
                    <v-autocomplete
                      v-if="filterEventType"
                      v-model="eventsTypeSelected"
                      multiple
                      style="max-width: 300px"
                      :label="getTranslation('OBSERVABLE_EVENT_TYPES')"
                      :item-text="(item) => getTranslation(item.key)"
                      return-object
                      :items="itemsEventTypes"
                      attach
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          close
                          color="primary"
                          @click:close="eventsTypeSelected = eventsTypeSelected.filter(el => el.id !== item.id)"
                        >
                          {{ getTranslation(item.key) }}
                        </v-chip>
                      </template>
                    </v-autocomplete>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="filterScore"
                      inset
                      color="primary"
                      hide-details="auto"
                      :label="getTranslation('SCORE_FILTER')"
                    ></v-switch>
                    <v-spacer></v-spacer>
                    <v-autocomplete
                      v-if="filterScore"
                      v-model="scoresSelected"
                      style="max-width: 300px"
                      :label="getTranslation('OBSERVABLE_SCORES')"
                      item-value="value"
                      :items="itemsScore"
                      multiple
                      attach
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          close
                          color="primary"
                          @click:close="scoresSelected = scoresSelected.filter(el => el !== item.value)"
                        >
                          {{ getTranslation(item.text) }}
                        </v-chip>
                      </template>
                    </v-autocomplete>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center">
                    <v-switch
                      v-model="filterMod"
                      inset
                      color="primary"
                      hide-details="auto"
                      :label="getTranslation('MODALITY_FILTER')"
                    ></v-switch>
                    <v-spacer></v-spacer>
                    <v-select
                      v-if="filterMod"
                      v-model="modsSelected"
                      style="max-width: 300px"
                      :label="getTranslation('OBSERVABLE_MODALITIES')"
                      item-value="value"
                      :items="itemsMods"
                      attach
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          color="primary"
                          @click:close="scoresSelected = scoresSelected.filter(el => el !== item.value)"
                        >
                          {{ item.text }}
                        </v-chip>
                      </template>
                    </v-select>
                  </div>
                </v-col>
              </div>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="red"
          @click="clearData();$emit('close')"
        >
          {{ getTranslation('CLOSE') }}
        </v-btn>
        <v-btn
          color="primary"
          :loading="buttonLoader"
          :disabled="!username || !email ||
              (!!email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) ||
              (!!username && !/^[A-Za-z0-9_\-]{6,}$/u.test(username))"
          @click="updateUser"
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
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import apiService from "@/globalServices/apiService";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "EditUserDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    userSelected: {
      type: Object,
      default: () => {
      }
    }
  },
  data: () => ({
    localValue: false,
    localUserSelected: undefined,
    username: undefined,
    email: undefined,
    buttonLoader: false,
    formValid: false,
    levelAdmin: 0,
    userRelationship: undefined,
    chooseRelationshipItems: false,
    configurationPermission: false,
    filterClient: false,
    filterScore: false,
    filterMod: false,
    filterEventType: false,
    clientsSelected: [],
    scoresSelected: [],
    modsSelected: [],
    eventsTypeSelected: [],
    itemsClientsUserRelationship: [],
    itemsClientsFilter: [],
    itemsResellers: [],
    itemsChooseRelationshipItems: [],
    userRelationshipsChosen: [],
    accessLogsPermission: false,
    systemLogsPermission: false,
    iamPermission: false,
    itemsScore: [
      {
        text: 'Critic',
        value: 'critic'
      },
      {
        text: 'High',
        value: 'high'
      },
      {
        text: 'Medium',
        value: 'medium'
      },
      {
        text: 'Low',
        value: 'low'
      },
    ],
    itemsMods: [
      {
        text: 'Monitoring',
        value: 'monitoring'
      },
      {
        text: 'Operations',
        value: 'operations'
      },],
    itemsEventTypes: [],
    emailRule: [
      v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ],
    usernameRule: [
      v => !v ||  /^[A-Za-z0-9_\-]{6,}$/u.test(v) || 'Username not valid'
    ],
  }),
  created() {
    Promise.all([
      this.fetchResellers(),
      this.fetchClients(),
      this.fetchEventTypes()
    ]).then(() => {}).catch(e => console.log(e))
  },
  methods: {
    updateUserToBeEdited() {
      this.username = this.localUserSelected.username;
      this.email = this.localUserSelected.email;
      this.levelAdmin = this.localUserSelected.levelAdmin;
      this.userRelationship = this.localUserSelected.rolesUser.relationship;
      this.userRelationshipsChosen = this.localUserSelected.rolesUser.relationshipIds;
      this.configurationPermission = this.localUserSelected.rolesUser.configurationPermission;
      this.accessLogsPermission = this.localUserSelected.rolesUser.accessLogsPermission;
      this.systemLogsPermission = this.localUserSelected.rolesUser.systemLogsPermission;
      this.iamPermission = this.localUserSelected.rolesUser.iamPermission;
      if (!this.localUserSelected.rolesUser)
        return;
      if (!!this.localUserSelected.rolesUser.clientsFilter) {
        this.filterClient = true;
        this.clientsSelected = this.localUserSelected.rolesUser.clientsFilter;
      }
      if (!!this.localUserSelected.rolesUser.modFilter) {
        this.filterMod = true;
        this.modsSelected = this.localUserSelected.rolesUser.modFilter;
      }
      if (!!this.localUserSelected.rolesUser.scoreFilter) {
        this.filterScore = true;
        this.scoresSelected = this.localUserSelected.rolesUser.scoreFilter;
      }
      if (!!this.localUserSelected.rolesUser.eventTypeFilter) {
        this.filterEventType = true;
        this.eventsTypeSelected = this.localUserSelected.rolesUser.eventTypeFilter;
      }
    },
    updateUser() {
      this.buttonLoader = true;
      apiService.axiosToBackend().post("/api/user/update", {
          id: this.localUserSelected.id,
          username: this.username,
          email: this.email,
          levelAdmin: Number(this.levelAdmin),
          userRelationship: this.userRelationship,
          userRelationshipIds: this.userRelationshipsChosen,
          accessLogsPermission: this.accessLogsPermission,
          systemLogsPermission: this.systemLogsPermission,
          configurationPermission: this.configurationPermission,
          iamPermission: this.iamPermission,
          clientsFilter: !this.levelAdmin && this.filterClient ? this.clientsSelected.map(el => el.id ?? el) : undefined,
          scoreFilter: !this.levelAdmin && this.filterScore ? this.scoresSelected : undefined,
          modFilter: !this.levelAdmin && this.filterMod ? this.modsSelected : undefined,
          eventTypeFilter: !this.levelAdmin && this.filterEventType ? this.eventsTypeSelected.map(el => el.value ?? el) : undefined,
        })
        .then((response) => {
          this.buttonLoader = false;
          this.clearData();
          this.$emit('userUpdated');
        })
        .catch((err) => {
          this.buttonLoader = false;
        });

    },
    clearData() {
      this.username = undefined;
      this.email = undefined;
      this.levelAdmin = 0;
      this.userRelationshipsChosen = [];
      this.userRelationship = undefined;
      this.filterClient = false;
      this.filterScore = false;
      this.filterMod = false;
      this.filterEventType = false;
      this.clientsSelected = [];
      this.scoresSelected = [];
      this.modsSelected = [];
      this.eventsTypeSelected = [];
    },
    async fetchClients() {
      apiService.axiosToBackend().get("/api/client",{
          params:
            {
              filters: JSON.stringify({
                selectAttributes: ['clients.id', 'companyName', 'resellerId'],
              })
            }
        })
        .then((response) => {
          if (response?.data?.success){
            this.itemsClientsFilter = response.data.payload;
            this.itemsClientsUserRelationship = response.data.payload;
          }
        })
        .catch((err) => console.log(err));
    },
    async fetchEventTypes() {
      axios.defaults.withCredentials = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/eventType", {})
        if (response?.data?.success)
          this.itemsEventTypes = response.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    async fetchResellers() {
      axios.defaults.withCredentials = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/reseller", {})
        if (response?.data?.success)
          this.itemsResellers = response.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    required(v) {
      return !!v || 'Field is required'
    },
  },
  watch: {
    userSelected(newVal) {
      this.localUserSelected = Object.assign({}, this.userSelected);
      this.updateUserToBeEdited();
    },
    levelAdmin(newVal) {
      if (!!newVal)
        this.userRelationship = 'distributor';
    },
    userRelationship(newVal,oldVal) {
      this.chooseRelationshipItems = (newVal === 'client' || newVal === 'reseller');
      if(!oldVal)
        return;
      this.userRelationshipsChosen = [];
      this.filterClient = false;
      this.filterScore = false;
      this.filterMod = false;
      this.filterEventType = false;
      this.clientsSelected = [];
      this.scoresSelected = [];
      this.modsSelected = [];
      this.eventsTypeSelected = [];
    },
    userRelationshipsChosen(newVal) {
      if (this.userRelationship === 'reseller' && !!this.userRelationshipsChosen && this.userRelationshipsChosen.length > 0) {
        this.itemsClientsFilter = this.itemsClientsUserRelationship.filter(el => newVal.includes(el.resellerId))
      }
      else
        this.itemsClientsFilter = this.itemsClientsUserRelationship;
    }
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }

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
