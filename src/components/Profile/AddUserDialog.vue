<template>
  <v-dialog
    v-model="localValue"
    :persistent="true"
    max-width="710px"
  >
    <v-card style="border-color: #63adf2; border-style: solid" border>
      <v-card-title style="border-bottom: 1px solid #ffffff1f">
        <span class="text-h5" style="color: #63adf2">{{ getTranslation('ADD_USER') }}</span>
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
              <v-col cols="12">
                <v-text-field
                  v-model="password"
                  :rules="passwordRule"
                  :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  hide-details="auto"
                  @click:append-inner="showPassword = !showPassword"
                  prepend-inner-icon="mdi-key"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="4" v-if="user.rolesUser.relationship === 'distributor'">
                <v-switch
                  v-model="levelAdmin"
                  inset
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
                  <!--https://stackoverflow.com/questions/59237276/how-to-place-dropdown-item-to-be-fixed-with-input-elementv-select-on-veutify-p-->
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
                  color="primary"
                  inset
                  hide-details="auto"
                  :label="getTranslation('CONFIGURATION_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="iamPermission"
                  color="primary"
                  inset
                  hide-details="auto"
                  :label="getTranslation('IAM_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="accessLogsPermission"
                  color="primary"
                  inset
                  hide-details="auto"
                  :label="getTranslation('ACCESS_LOGS_PERMISSION')"
                ></v-switch>
              </v-col>
              <v-col cols="6" v-if="!levelAdmin">
                <v-switch
                  v-model="systemLogsPermission"
                  color="primary"
                  inset
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
                      color="primary"
                      inset
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
                      color="primary"
                      inset
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
                      color="primary"
                      inset
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
                      color="primary"
                      inset
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
      <v-divider/>
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
          color="primary"
          :loading="buttonLoader"
          :disabled="!username || !password || !email ||
              (!!password && password.length < 10) ||
              (!!email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) ||
              (!!username && !/^[A-Za-z0-9_\-]{6,}$/u.test(username)) ||
              (userRelationship !== 'distributor' && userRelationshipsChosen.length === 0)"
          @click="registerUser"
        >
          {{ getTranslation('SAVE') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import Hashes from 'jshashes';
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "AddUserDialog",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    test:{
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    localValue: false,
    username: undefined,
    email: undefined,
    password: undefined,
    formValid: false,
    buttonLoader: false,
    showPassword: false,
    levelAdmin: 0,
    userRelationship: null,
    chooseRelationshipItems: false,
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
    configurationPermission: false,
    iamPermission: false,
    accessLogsPermission: false,
    systemLogsPermission: false,
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
    isErrorDialogOpened: false,
    errorMessage: null,
    passwordRule: [
      v => !v || (v && v.length >= 10) || 'Password must be at least 10 characters'
    ],
    emailRule: [
      v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || 'E-mail must be valid'
    ],
    usernameRule: [
      v => !v || /^[A-Za-z0-9_\-]{6,}$/u.test(v) || 'Username not valid'
    ],
  }),
  created() {
    Promise.all([
      this.fetchResellers(),
      this.fetchClients(),
      this.fetchEventTypes()
    ]).then(() => {
    }).catch(e => console.log(e))
  },
  methods: {
    required(v) {
      return !!v || 'Field is required'
    },
    async registerUser() {
      this.buttonLoader = true;
      apiService.axiosToBackend().post("/api/user/create", {
          username: this.username,
          email: this.email,
          password: new Hashes.SHA256().hex(this.password),
          levelAdmin: Number(this.levelAdmin),
          userRelationship: this.userRelationship,
          userRelationshipIds: this.userRelationshipsChosen,
          accessLogsPermission: this.accessLogsPermission,
          systemLogsPermission: this.systemLogsPermission,
          configurationPermission: this.configurationPermission,
          iamPermission: this.iamPermission,
          clientsFilter: !this.levelAdmin && this.filterClient ? this.clientsSelected.map(el => el.id) : undefined,
          scoreFilter: !this.levelAdmin && this.filterScore ? this.scoresSelected : undefined,
          modFilter: !this.levelAdmin && this.filterMod ? this.modsSelected : undefined,
          eventTypeFilter: !this.levelAdmin && this.filterEventType ? this.eventsTypeSelected.map(el => el.value) : undefined,
        })
        .then((response) => {
          if (response?.data.success) {
            this.clearData();
            this.buttonLoader = false;
            this.$emit('userRegistered');
          } else if (!response?.data.success) {
            this.buttonLoader = false;
            if (response.data.message === 'USERNAME_ALREADY_PRESENT') {
              this.errorMessage = this.getTranslation("USERNAME_ALREADY_PRESENT");
              this.isErrorDialogOpened = true;
            } else if (response.data.message === 'EMAIL_ALREADY_PRESENT') {
              this.errorMessage = this.getTranslation("EMAIL_ALREADY_PRESENT")
              this.isErrorDialogOpened = true;
            } else if (response.data.message === 'GENERIC_ERROR') {
              this.errorMessage = this.getTranslation("ERROR")
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
    async fetchClients() {
      this.itemsClientsFilter = [];
     /* apiService.axiosToBackend().get("/api/client", {
        params:
          {
            filters: {
              selectAttributes: ['companyName', 'clients.id', 'resellerId'],
            }
          }
      })
        .then((response) => {
          if (response?.data?.success) {
            this.itemsClientsFilter = response.data.payload;
            this.itemsClientsUserRelationship = response.data.payload;
          }
        })
        .catch((err) => console.log(err));*/
    },
    async fetchEventTypes() {
      this.itemsEventTypes = [];
      /*try {
        let response = await apiService.axiosToBackend().get("/api/eventType", {})
        if (response?.data?.success)
          this.itemsEventTypes = response.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }*/
    },
    async fetchResellers() {
      this.itemsResellers = [];
      /*try {
        let response = await apiService.axiosToBackend().get("/api/reseller", {})
        if (response?.data?.success)
          this.itemsResellers = response.data.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }*/
    },
    clearData() {
      this.username = undefined
      this.email = undefined
      this.password = undefined
      this.levelAdmin = 0
      this.filterClient = false
      this.filterScore = false
      this.filterMod = false
      this.filterEventType = false
      this.configurationPermission = false;
      this.iamPermission = false;
      this.accessLogsPermission = false;
      this.systemLogsPermission = false;
      this.clientsSelected = []
      this.scoresSelected = []
      this.modsSelected = []
      this.eventsTypeSelected = []
      this.userRelationship = this.user.rolesUser.relationship;
    },
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
      console.log(this.localValue, newVal);
      this.localValue = newVal;
    },
    levelAdmin(newVal) {
      if (!!newVal)
        this.userRelationship = 'distributor';
    },
    userRelationship(newVal) {
      this.chooseRelationshipItems = (newVal === 'client' || newVal === 'reseller');
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
      } else
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
