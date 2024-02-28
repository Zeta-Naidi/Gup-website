<template>
  <v-dialog
      v-model="localValue"
      :persistent="true"
      max-width="800"
      style="border-color: #63adf2; border-style: solid"
  >
          <v-card style="border-color: #63adf2; border-style: solid">
            <v-card-title>
              <v-alert
                  dense
                  outlined
                  :persistent="true"
                  color="primary"
                  style="width: 100%"
              >
                <h3 class="text-h5 d-flex">
                  <v-icon color="primary" class="mr-3">
                    mdi-alert-circle
                  </v-icon>
                  {{ getTranslation('REQUEST_REGISTRATION_MFA_AUTHENTICATION') }}
                </h3>
              </v-alert>
            </v-card-title>
            <v-card-text>

              <div class="d-flex justify-center align-center" v-if="!emailOtp && !qrCodeValue" style="min-height: 100px">
                <v-btn color="primary" :loading="loadingMfaRequestCodeButton" @click="fetchCodeMfaEmail">
                  {{ getTranslation('REQUEST_REGISTRATION_MFA_AUTHENTICATION_WITH_EMAIL') }}
                </v-btn>
              </div>
              <v-avatar
                  v-else
                  color="red"
                  size="48"
              >
                <span class="white--text text-h5">{{ counter }}</span>
              </v-avatar>
              <div v-if="!!emailOtp" style=" padding-right: 150px; padding-left: 150px">
                <div class="d-flex justify-center mt-5">
                  <v-otp-input
                      :class="{'red-label': isIconNotVerifiedCheckShown, 'green-label': isIconVerifiedCheckShown}"
                      v-model="code"
                      length="6"
                      type="text"
                      style="max-width: 60%;"

                  ></v-otp-input>
                  <v-progress-circular
                      v-if="showLoaderForOtpCall"
                      indeterminate
                      class="pl-2"
                      color="primary"
                  ></v-progress-circular>
                  <v-icon class="iconChecked pl-2" color="green" v-if="isIconVerifiedCheckShown">
                    mdi-check-outline
                  </v-icon>
                  <v-icon class="iconChecked pl-2" color="red" v-if="isIconNotVerifiedCheckShown">
                    mdi-alpha-x-box-outline
                  </v-icon>
                </div>
              </div>


              <div class="d-flex justify-center align-center" v-if="!qrCodeValue && !emailOtp" style="min-height: 100px">
                <v-btn color="primary" :loading="loadingMfaRequestCodeButton" @click="fetchQrCodeMfa">
                  {{ getTranslation('REQUEST_REGISTRATION_MFA_AUTHENTICATION_WITH_APP') }}
                </v-btn>
              </div>
              <div v-if="!!qrCodeValue">
                <div class="d-flex justify-center" >
                  <qrcode-vue :value="qrCodeValue" :size="200" level="H" class="pa-1" style="background-color: white;padding-right: 150px; padding-left: 150px"/>
                </div>
                <div class="d-flex justify-center mt-5">
                  <v-otp-input
                    :class="{'red-label': isIconNotVerifiedCheckShown, 'green-label': isIconVerifiedCheckShown}"
                    v-model="code"
                    length="6"
                    type="text"
                    style="max-width: 60%;"

                  ></v-otp-input>
                  <v-progress-circular
                    v-if="showLoaderForOtpCall"
                    indeterminate
                    class="pl-2"
                    color="primary"
                  ></v-progress-circular>
                  <v-icon class="iconChecked pl-2" color="green" v-if="isIconVerifiedCheckShown">
                    mdi-check-outline
                  </v-icon>
                  <v-icon class="iconChecked pl-2" color="red" v-if="isIconNotVerifiedCheckShown">
                    mdi-alpha-x-box-outline
                  </v-icon>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn class="ml-3" color="red" :loading="buttonLoader"
                     @click="code='';$emit('close');isIconNotVerifiedCheckShown=false;">
                {{ getTranslation('CLOSE') }}
              </v-btn>
              <v-btn class="ml-3" color="primary" v-if="!!qrCodeValue" :loading="buttonLoader"
                     :disabled="!code || (!!code && code.length < 6)" @click="verifyCode('appCode')">
                {{ getTranslation('SEND') }}
              </v-btn>
              <v-btn class="ml-3" color="primary" v-if="!!emailOtp" :loading="buttonLoader"
                     :disabled="!code || (!!code && code.length < 6)" @click="verifyCode('emailCode')">
                {{ getTranslation('SEND') }}
              </v-btn>
            </v-card-actions>
          </v-card>
  </v-dialog>
      <BlockUserAfterTooManyAttemptsDialog
        v-model="isUserBlockedDialogOpen"
        @close="isUserBlockedDialogOpen = false;"
      />

</template>

<script>
import translateService from '@/globalServices/translate'
import QrcodeVue from "qrcode.vue";
import axios from "axios";
import BlockUserAfterTooManyAttemptsDialog from "@/components/global/BlockUserAfterTooManyAttemptsDialog.vue";
import apiService from "@/globalServices/apiService";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "MfaDialog",
  components: {
    QrcodeVue,
    BlockUserAfterTooManyAttemptsDialog,
  },
  props: {
    isDialogQrCodeOpened: Boolean,
  },
  data: () => ({
    localValue: false,
    code: '',
    loadingMfaRequestCodeButton: false,
    counter: 0,
    qrCodeValue: '',
    emailOtp: '',
    showLoaderForOtpCall: false,
    isIconVerifiedCheckShown: false,
    isIconNotVerifiedCheckShown: false,
    buttonLoader: false,
    isUserBlockedDialogOpen: false,
  }),
  created() {
    this.localValue = this.isDialogQrCodeOpened
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    async fetchQrCodeMfa() {
      try {
        this.loadingMfaRequestCodeButton = true;
        axios.defaults.withCredentials = true;
        const response = await apiService.axiosToBackend().get("/api/user/requestMfaCodeAuthenticator")
        if (response?.data) {
          this.loadingMfaRequestCodeButton = false;
          this.qrCodeValue = response.data;
          this.counter = 90;
          let counterDecrement = setInterval(() => {
            this.counter--
            if (this.counter === 0) {
              this.qrCodeValue = ''
              this.code = '';
              this.isIconNotVerifiedCheckShown = false;
              this.isIconVerifiedCheckShown = false;
              clearInterval(counterDecrement);
            }
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.status === 429) {
          this.isUserBlockedDialogOpen = true;
          this.clearValues();
          this.$emit('close');
        }
      }
    },
    async fetchCodeMfaEmail(){
      try {
        this.loadingMfaRequestCodeButton = true;
        axios.defaults.withCredentials = true;
        const response = await apiService.axiosToBackend().get("/api/user/requestMfaCodeEmail")
        if (response?.data) {
          this.loadingMfaRequestCodeButton = false;
          //this.qrCodeValue = response.data;
          this.emailOtp = 'test';
          this.counter = 300; //TODO: 5 minuti di timer
          let counterDecrement = setInterval(() => {
            this.counter--
            if (this.counter === 0) {
              this.emailOtp = ''
              this.code = '';
              this.isIconNotVerifiedCheckShown = false;
              this.isIconVerifiedCheckShown = false;
              clearInterval(counterDecrement);
            }
          }, 1000);
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.status === 429) {
          this.isUserBlockedDialogOpen = true;
          this.clearValues();
          this.$emit('close');
        }
      }
    },
    async verifyCode(type) {
      try {
        if(type === 'appCode'){
          this.buttonLoader = true;
          this.showLoaderForOtpCall = true;
          this.isIconNotVerifiedCheckShown = false;
          axios.defaults.withCredentials = true;
          const response = await apiService.axiosToBackend().post("/api/user/confirmMfaCode", {
            otp: this.code,
            type: "appCode"
          })
          if (response?.data?.success) {
            this.codeVerified();
          } else
            this.codeNotVerified();
        }else{
          this.buttonLoader = true;
          this.showLoaderForOtpCall = true;
          this.isIconNotVerifiedCheckShown = false;
          axios.defaults.withCredentials = true;
          const response = await apiService.axiosToBackend().post("/api/user/confirmMfaCode", {
            otp: this.code,
            type: "emailCode"
          })
          if (response?.data?.success) {
            this.codeVerified();
          } else
            this.codeNotVerified();
        }

      } catch (error) {
        console.log(error);
        if (error?.response?.status === 429) {
          this.isUserBlockedDialogOpen = true;
          this.clearValues();
          this.$emit('close');
        }
      }
      this.showLoaderForOtpCall = false;
      if (!this.isIconVerifiedCheckShown)
        this.buttonLoader = false;
    },
    codeVerified() {
      this.isIconVerifiedCheckShown = true;
      setTimeout(() => this.$emit('validated'), 2000)
    },
    codeNotVerified() {
      this.isIconNotVerifiedCheckShown = true;
    }
  },
  watch: {
    isDialogQrCodeOpened(newVal) {
      console.log(newVal)
      this.localValue = newVal
    },
  },
}
</script>

<style lang="scss" scoped>
.iconChecked {
  animation-name: example;
  animation-duration: 2s;
}

@keyframes example {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.red-label::v-deep fieldset {
  color: red !important;
  caret-color: red !important;
}

.green-label::v-deep fieldset {
  color: lawngreen !important;
  caret-color: lawngreen !important;
}
</style>
