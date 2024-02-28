<template>
  <v-sheet style="min-height: 100%">
    <div class="d-flex justify-center">
      <v-img
        src="@/assets/logoMssp.png"
        max-height="400"
        max-width="400"
        style="margin-top: 125px"
        class="mb-15"
      ></v-img>
    </div>
    <div class="d-flex justify-center">
      <div
        style="min-width: 30%"
        v-if="!mustMfaLogin"
      >
        <v-form
          @submit.prevent="onSubmit"
        >
          <v-text-field
            v-model="username"
            :readonly="loading"
            :rules="[required]"
            class="mb-2"
            clearable
            autocomplete="on"
            label="Username/Email"
          ></v-text-field>
          <v-text-field
            v-model="password"
            autocomplete="on"
            :rules="[required]"
            :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
            :type="show1 ? 'text' : 'password'"
            @click:append-inner="show1 = !show1"
            label="Password"
            hide-details="auto"
          ></v-text-field>
          <br>
          <div v-if="!!messageVerifyingSession" style="color: #63adf2;  font-size: 14px" class="d-flex justify-center">
            <div>
              {{ getTranslation(messageVerifyingSession) + '...' }}
            </div>
          </div>
          <br>
          <div style="color: #63adf2; cursor: pointer; font-size: 14px" class="d-flex justify-end">
            <div @click="dialogForgotPasswordOpen">
              {{ getTranslation("PASSWORD_LOST") }}
            </div>
          </div>
          <br>
          <br>
          <v-btn
            :loading="loading"
            :disabled="!formValid"
            block
            color="primary"
            type="submit"
          >
            Sign In
          </v-btn>
          <!--          <div class="d-flex justify-center mt-5">
                      <v-btn
                        color="#ea4335"
                        large
                        text
                        @click="ssoAuthentication('GOOGLE')"
                        :loading="loaderSsoGoogleButton"
                      >
                        <v-icon>
                          mdi-google
                        </v-icon>
                      </v-btn>
                      <v-btn
                        color="#008AD7"
                        large
                        text
                        @click="ssoAuthentication('MICROSOFT')"
                        :loading="loaderSsoMicrosoftButton"
                      >
                        <v-icon>
                          mdi-microsoft-azure
                        </v-icon>
                      </v-btn>
                    </div>-->
        </v-form>
      </div>
      <div v-else>
        <div class="d-flex justify-center align-center">
          <v-avatar
            v-if="modEmailMfa"
            color="red"
            size="48"
            class="mr-5"
          >
            <span class="white--text text-h5">{{ counter }}</span>
          </v-avatar>
          <v-alert
            color="yellow"
            outlined
            type="warning"
            style="margin-bottom: 0 !important; width: 60%"
          >
            {{ modEmailMfa ? getTranslation("MUST_MFA_LOGIN_EMAIL") : getTranslation("MUST_MFA_LOGIN_AUTHENTICATOR") }}
          </v-alert>
        </div>

        <div class="d-flex justify-center mt-5">
          <v-otp-input
            v-model="otpCode"
            length="6"
            type="text"
            style="max-width: 60%"
            :color="!isIconNotVerifiedCheckShown ? 'primary' : 'red'"
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
        <div class="d-flex justify-center mt-5" v-if="!modEmailMfa">
          <v-spacer></v-spacer>
          <div style="color: #63adf2; cursor: pointer; font-size: 14px">
            <div @click="setCodeByEmail">
              {{ getTranslation("SEND_CODE_BY_EMAIL") }}
            </div>
          </div>
        </div>
        <div class="d-flex justify-center mt-5">
          <v-btn color="primary" @click="confirmLogin(otpCode)" :disabled="otpCode.length < 6"
                 :loading="buttonMfaLoading">
            {{ getTranslation('SEND') }}
          </v-btn>
        </div>
      </div>
    </div>

    <v-snackbar
      v-model="isSnackbarCredsOpened"
      :timeout="3500"
      class="mb-5"
    >
      <v-alert
        color="red"
        outlined
        type="warning"
        style="margin-bottom: 0 !important;"
      >
        {{ getTranslation("ERROR_LOGIN_INVALID_GRANT") }}
      </v-alert>

      <template v-slot:actions>
        <v-btn
          color="blue"
          variant="text"
          @click="isSnackbarCredsOpened = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="isSnackbarMfaOpened"
      :timeout="3500"
      class="mb-5"
    >
      <v-alert
        color="red"
        outlined
        type="warning"
        style="margin-bottom: 0 !important;"
      >
        {{ getTranslation("OTP_CODE_NOT_VALID") }}
      </v-alert>

      <template v-slot:actions>
        <v-btn
          color="blue"
          variant="text"
          @click="isSnackbarMfaOpened = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-snackbar
      v-model="isSnackbarPasswordChangedOpened"
      :timeout="3500"
      class="mb-5"
    >
      <v-alert
        color="green"
        outlined
        type="success"
        style="margin-bottom: 0 !important;"
      >
        {{ getTranslation("PASSWORD_CHANGED") }}
      </v-alert>

      <template v-slot:actions>
        <v-btn
          color="blue"
          variant="text"
          @click="isSnackbarPasswordChangedOpened = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <ForgotPasswordDialog
      :isDialogForgotPasswordOpen = "isDialogForgotPasswordOpen"
      @close="isDialogForgotPasswordOpen = false;"
      @passwordChanged="isDialogForgotPasswordOpen = false; isSnackbarPasswordChangedOpened=true;"
    />
    <BlockUserAfterTooManyAttemptsDialog
      v-model="isUserBlockedDialogOpen"
      @close="isUserBlockedDialogOpen = false;"
    />
  </v-sheet>
</template>

<script>
import translateService from "@/globalServices/translate";
import ForgotPasswordDialog from "@/components/global/ForgotPasswordDialog.vue";
import BlockUserAfterTooManyAttemptsDialog from "@/components/global/BlockUserAfterTooManyAttemptsDialog.vue";
import Hashes from 'jshashes';
import {useAppStore} from "@/plugins/pinia/app";
import {useUserStore} from "@/plugins/pinia/user";
import {mapActions, mapState, mapWritableState} from "pinia";
import apiService from "@/globalServices/apiService";

export default {
  data() {
    return {
    form: false,
    username: null,
    password: null,
    loading: false,
    show1: false,
    isSnackbarCredsOpened: false,
    isSnackbarMfaOpened: false,
    isSnackbarPasswordChangedOpened: false,
    isDialogQrCodeOpened: false,
    qrCodeValue: '',
    mustMfaLogin: false,
    otpCode: '',
    showLoaderForOtpCall: false,
    isIconNotVerifiedCheckShown: false,
    isIconVerifiedCheckShown: false,
    buttonMfaLoading: false,
    isDialogForgotPasswordOpen: false,
    isUserBlockedDialogOpen: false,
    isErrorDialogOpened: false,
    errorMessage: '',
    accessToken: null,
    modEmailMfa: false,
    loadingCallToSetMfaByEmail: false,
    counter: 0,
    counterDecrementInterval: null,
    messageVerifyingSession: null,
    loaderSsoGoogleButton: false,
    loaderSsoMicrosoftButton: false,
  }},
  components: {
    ForgotPasswordDialog,
    BlockUserAfterTooManyAttemptsDialog,
  },
  props: {
    redirectUserBlocked: {
      default: false
    }
  },
  mounted() {
    if (!!this.redirectUserBlocked) {
      this.isUserBlockedDialogOpen = true;
    } else
      this.checkUserAlreadyLoggedIn();
  },
  methods: {
    dialogForgotPasswordOpen(){
      this.isDialogForgotPasswordOpen = true;
      console.log(this.isDialogForgotPasswordOpen)
    },
    onSubmit() {
      this.loading = true
      this.login();
    },
    required(v) {
      return !!v || 'Field is required'
    },
    async login() {
      try {
        this.buttonMfaLoading = true;
        await apiService.axiosToBackend().get("/sanctum/csrf-cookie");
        const response = await apiService.axiosToBackend().post("/api/user/login",
          {
            username: this.username,
            password: new Hashes.SHA256().hex(this.password),
          });
        if (response.data) {
          if (!response.data.success && response.data.message === 'MUST_MFA_LOGIN') {
            if (response?.data?.mode === 'mfaByEmail') {
              this.accessToken = response?.data?.payload?.accessToken;
              await this.setCodeByEmail();
              this.mustMfaLogin = true;

            } else {
              this.mustMfaLogin = true;
              this.accessToken = response?.data?.payload?.accessToken;
            }
          } else if (!response.data.success && response.data.message === 'OTP_NOT_CORRECT') {
            this.isSnackbarMfaOpened = true;
          } else if (response?.data?.success) {
            this.setCredentials(response.data.payload);
            if (this.user.isAdmin)
              this.$router.push({name: "superAdminHome"})
            else
              this.$router.push({name: "Home"});

          }
        }
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 400) {
          if (error.response.data.message === "INVALID_CREDENTIALS")
            this.isSnackbarCredsOpened = true;
        } else if (error.response && error.response.status === 429) {
          this.isUserBlockedDialogOpen = true;
        }
        if (error.response && error.response.status === 500) {
          this.errorMessage = error?.response?.data?.message;
          this.isErrorDialogOpened = true;
        }
      }
      this.loading = false;
      this.buttonMfaLoading = false;
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
    async checkUserAlreadyLoggedIn() {
      try {
        this.loading = true;
        this.messageVerifyingSession = 'CHECKING_SESSION';
        const response = await apiService.axiosToBackend().get(
          "/api/user/details"
        );
        if (response?.data?.success) {
          this.setCredentials(response.data.payload);
          if (this.user.isAdmin)
            this.$router.push({name: "superAdminHome"})
          else
            this.$router.push({name: "Home"});
        }
      } catch (e) {
        this.messageVerifyingSession = null;
        this.loading = false;
      }
    },
    async setCodeByEmail() {
      try {
        if (this.loadingCallToSetMfaByEmail)
          return;
        this.loadingCallToSetMfaByEmail = true;
        this.buttonMfaLoading = true;
        const response = await apiService.axiosToBackend().post(
          "/api/user/setOtpByEmail",
          {
            accessToken: this.accessToken,
          }
        );
        if (response?.data?.success) {
          this.counter = 300;
          this.counterDecrementInterval = setInterval(() => {
            this.counter--
            if (this.counter === 0) {
              clearInterval(this.counterDecrementInterval);
              location.reload();
            }
          }, 1000);
          this.modEmailMfa = true;
        }
        this.loadingCallToSetMfaByEmail = false;
        this.buttonMfaLoading = false;
      } catch (error) {
        this.loadingCallToSetMfaByEmail = false;
        this.buttonMfaLoading = false;
        console.log(error)
        if (error.response && error.response.status === 400) {
          if (error.response.data.message === "INVALID_CREDENTIALS")
            this.isSnackbarCredsOpened = true;
        } else if (error.response && error.response.status === 429) {
          this.isUserBlockedDialogOpen = true;
        }
        if (error.response && error.response.status === 500) {
          this.errorMessage = error?.response?.data?.message;
          this.isErrorDialogOpened = true;
        }
      }
    },
    async confirmLogin(otp) {
      try {
        this.buttonMfaLoading = true;
        const response = await apiService.axiosToBackend().post("/api/user/confirmLogin",
          {
            accessToken: this.accessToken,
            mod: this.modEmailMfa ? 'EMAIL' : 'AUTHENTICATOR',
            otp: otp
          }
        );
        if (response?.data?.success) {
          this.setCredentials(response.data.payload);
          if (this.user.isAdmin)
            this.$router.push({name: "superAdminHome"})
          else
            this.$router.push({name: "Home"});
        } else if (!response?.data?.success && response.data.message === 'OTP_NOT_CORRECT') {
          this.isSnackbarMfaOpened = true;
        }

        this.buttonMfaLoading = false;

      } catch (error) {
        console.log(error)
        this.buttonMfaLoading = false;
        if (error.response && error.response.status === 400) {
          if (error.response.data.message === "INVALID_CREDENTIALS")
            this.isSnackbarCredsOpened = true;
        } else if (error.response && error.response.status === 429) {
          this.isUserBlockedDialogOpen = true;
        }
        if (error.response && error.response.status === 500) {
          this.errorMessage = error?.response?.data?.message;
          this.isErrorDialogOpened = true;
        }
      }
    },
    ...mapActions(useUserStore, ['setCredentials']),
  },
  beforeDestroy() {
    clearInterval(this.counterDecrementInterval);
  },
  computed: {
    formValid() {
      return !!this.username && !!this.password;
    },
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>
:deep(.v-snack__action) {
  margin-right: 0;
}
</style>
