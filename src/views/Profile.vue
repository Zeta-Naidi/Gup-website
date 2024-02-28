<template>
  <div>
    <v-container>
      <v-card class="mt-5">
        <v-card-title>
          {{getTranslation('REGISTRY')}}
        </v-card-title>
        <div class="px-5">
          <v-row>
            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="username"
                label="Username"
                :readonly="true"
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="companyName"
                :label="getTranslation('DA CAMBIARE...')"
                :readonly="true"
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>
            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="email"
                label="Email"
                :readonly="true"
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>
<!--            <v-col
              cols="12"
              sm="4"
            >
              <v-text-field
                v-model="piva"
                label="Partita iva"
                readonly
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>-->
            <v-col
              cols="12"
              sm="4"
            >
              <div class="d-flex align-center">
                <v-btn v-if="isMfaActive" color="green" class="ml-5">
                  {{ getTranslation('IS_MFA_ACTIVE') }}
                </v-btn>
                <v-btn v-else color="primary" @click="openMfaDialog" class="ml-5">
                  {{ getTranslation('ACTIVE_MFA') }}
                </v-btn>
<!--    KEEP COMMENT            <v-btn @click="isDialogAddTokenOpened = true" color="primary" class="ml-5">
                  {{ getTranslation('REQUEST_USER_API_TOKEN') }}
                </v-btn>
                <v-btn v-if="doesUserHasToken" @click="isDialogManageTokenOpened = true" color="green" class="ml-5">
                  {{ getTranslation('MANAGE_API_TOKEN') }}
                </v-btn>-->
              </div>

            </v-col>
          </v-row>

        </div>
      </v-card>
    </v-container>
    <MfaDialog
      :isDialogQrCodeOpened="isDialogQrCodeOpened"
      @close="closeMfaDialog"
      @validated="isMfaActive = true; isDialogQrCodeOpened = false"
    />
    <AddTokenDialog
      v-model="isDialogAddTokenOpened"
      @close="isDialogAddTokenOpened = false;"
    />
    <ManageTokenDialog
      v-model="isDialogManageTokenOpened"
      @close="isDialogManageTokenOpened = false;"
    />
  </div>
</template>

<script>

import axios from "axios";

import AddUserDialog from "@/components/Profile/AddUserDialog.vue";
import translateService from "@/globalServices/translate";
import EditUserDialog from "@/components/Profile/EditUserDialog.vue";
import ConfirmDeleteUserDialog from "@/components/Profile/ConfirmDeleteUserDialog.vue";
import MfaDialog from "@/components/global/MfaDialog.vue";
import AddTokenDialog from "@/components/Profile/AddTokenDialog.vue";
import ManageTokenDialog from "@/components/Profile/ManageTokensDialog.vue";
import utilsFunctions from "@/globalServices/utilsFunctions";

import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";
import {tr} from "vuetify/locale";

export default {
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  name: 'Profile',
  components: {
    ManageTokenDialog,
    AddTokenDialog,
    MfaDialog,
  },
  data() {
    return {
      companyName: '',
      email: '',
      piva: '',
      username: '',
      levelAdmin: 0,
      isMfaActive: undefined,
      tableHeaders: [
        {value: "username", sortable: true, width: "20%"},
        {value: "email", sortable: true, width: "20"},
        {value: "companyName", sortable: true, width: "20%"},
        {value: "levelAdmin", sortable: true, width: "15%"},
        {value: "isMfaActive", sortable: false, width: "15%"},
        {value: "actions", sortable: false, width: "10%"},
      ],
      tableItems: [],
      isDialogQrCodeOpened: false,
      isDialogAddTokenOpened: false,
      isDialogManageTokenOpened: false,
      qrCodeValue: '',
      doesUserHasToken: false,
  }},
  created() {
    this.getUserDetail();
  },

  methods: {
    openMfaDialog(){
      this.isDialogQrCodeOpened = true
    },
    closeMfaDialog(){
      this.isDialogQrCodeOpened = false;
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    async getUserDetail() {
      // todO change the companyname with user
      try {
        this.loadingButton = true;
        axios.defaults.withCredentials = true;
        const response = await apiService.axiosToBackend().get("/api/user/details");

        if (response?.data?.success) {
          // if (!this.$store.state.userModule.userCredentials.id)
          //   this.$store.commit('setCredentials', response.data.payload);
          this.email = response.data.payload.email;
          this.username = response.data.payload.username;
          this.isMfaActive = response.data.payload.isMfaActive;
          this.levelAdmin = response.data.payload.levelAdmin > 1 ? 2 : response.data.payload.levelAdmin;
          this.doesUserHasToken = Array.isArray(response.data.payload.tokens) && response.data.payload.tokens.length > 0;
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    }
  },
}

</script>
