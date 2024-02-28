<template>
  <v-dialog
    v-model="localValue"
    :persistent="true"
    max-width="800"
  >
    <v-card>
      <v-card-title>
        <v-alert
          dense
          icon="mdi-alert-circle"
          outlined
          :prominent="true"
          color="yellow"
          style="width: 100%"
        >
          {{ getTranslation('TEXT_RESET_PASSWORD_TITLE') }}
        </v-alert>
      </v-card-title>
      <v-card-text>
        <div style=" padding-right: 150px; padding-left: 150px" v-if="!modInsertNewPassword">
          <div class="d-flex justify-center mt-5 align-center">
            <v-text-field
              v-model="email"
              class="mb-2"
              outlined
              label="Email"
              hide-details="auto"
            ></v-text-field>
            <v-btn class="ml-3" color="primary" :disabled="!validEmailAddress" :loading="buttonLoader"
                   @click="requestToken">
              {{ getTranslation('SEND') }}
            </v-btn>
          </div>
        </div>
        <div v-else>
          <div class="d-flex justify-center">
            <v-text-field
              v-model="newPassword"
              class="mb-2"
              outlined
              :label="getTranslation('INSERT_NEW_PASSWORD')"
              hide-details="auto"
              style="max-width: 60%;"
              :rules="passwordRule"
              :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show1 ? 'text' : 'password'"
              @click:append="show1 = !show1"
            ></v-text-field>
          </div>
          <div class="d-flex justify-center">
            <v-text-field
              v-model="confirmNewPassword"
              class="mb-2"
              outlined
              :label="getTranslation('CONFIRM_NEW_PASSWORD')"
              hide-details="auto"
              style="max-width: 60%;"
              :rules="passwordRule"
              :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
              :type="show2 ? 'text' : 'password'"
              @click:append="show2 = !show2"
            ></v-text-field>
          </div>
          <div class="d-flex justify-center mt-5">
            <v-otp-input
              :class="{'red-label': isIconNotVerifiedCheckShown, 'green-label': isIconVerifiedCheckShown}"
              v-model="otpCode"
              length="6"
              type="text"
              style="max-width: 60%;"
            ></v-otp-input>
            <v-icon class="iconChecked pl-2" color="green" v-if="isIconVerifiedCheckShown">
              mdi-check-outline
            </v-icon>
            <v-icon class="iconChecked pl-2" color="red" v-if="isIconNotVerifiedCheckShown">
              mdi-alpha-x-box-outline
            </v-icon>
          </div>
          <div class="d-flex justify-center">
            <v-btn
              class="mt-5"
              color="primary"
              :disabled="!confirmPasswordFormValid"
              :loading="buttonLoader"
              @click="newPasswordRequest"
            >
              {{ getTranslation('SEND') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="ml-3" color="red" :loading="buttonLoader" @click="clearValues();$emit('close');">
          {{ getTranslation('CLOSE') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <BlockUserAfterTooManyAttemptsDialog
    :value="isUserBlockedDialogOpen"
    @close="isUserBlockedDialogOpen = false;"
  />
  <v-snackbar
    v-model="isSnackbarDataNotCorrectOpen"
    timeout="5000"
  >
    <v-alert
      color="yellow"
      outlined
      type="warning"
      style="margin-bottom: 0 !important;"
    >
      {{ getTranslation("DATA_NOT_CORRECT") }}
    </v-alert>
  </v-snackbar>
</template>

<script>
import translateService from '@/globalServices/translate'
import axios from "axios";
import BlockUserAfterTooManyAttemptsDialog from "@/components/global/BlockUserAfterTooManyAttemptsDialog.vue";
import Hashes from 'jshashes';
import {useAppStore} from "@/plugins/pinia/app";
import {mapWritableState} from "pinia";
import apiService from "@/globalServices/apiService";

export default {
  name: "ForgotPasswordDialog",
  components: {
    BlockUserAfterTooManyAttemptsDialog
  },
  data() {
    return {
      localValue: false,
      email: '',
      buttonLoader: false,
      accessToken: '',
      modInsertNewPassword: false,
      isIconVerifiedCheckShown: false,
      isIconNotVerifiedCheckShown: false,
      otpCode: '',
      newPassword: '',
      confirmNewPassword: '',
      isUserBlockedDialogOpen: false,
      isSnackbarDataNotCorrectOpen: false,
      passwordRule: [
        v => !v || (v && v.length >= 10) || 'Password must be at least 10 characters'
      ],
      confirmPasswordRule: [
        v => !v || (v && v.length >= 10) || v !== this.newPassword || 'Password must be at least 10 characters and equals to password inserted'
      ],
      show1: false,
      show2: false,
    }
  },
  props: {
    isDialogForgotPasswordOpen:Boolean,
  },
  created() {
    this.localValue = this.isDialogForgotPasswordOpen
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    async requestToken() {
      try {
        this.buttonLoader = true;
        this.showLoaderForOtpCall = true;
        this.isIconNotVerifiedCheckShown = false;
        await apiService.axiosToBackend().get("/sanctum/csrf-cookie");
        const response = await apiService.axiosToBackend().post("/api/user/requestToken/resetPassword", {
          email: this.email
        })
        if (response?.data?.success) {
          this.accessToken = response.data.accessToken;
          this.modInsertNewPassword = true;
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.status === 429) {
          this.isUserBlockedDialogOpen = true;
          this.clearValues();
          this.$emit('close');
        }
      }
      this.buttonLoader = false;
    },
    async newPasswordRequest() {
      try {
        this.buttonLoader = true;
        this.isIconNotVerifiedCheckShown = false;
        const response = await apiService.axiosToBackend().post(import.meta.env.VITE_APP_BASEURL + "/api/user/confirmNewPassword", {
          email: this.email,
          accessToken: this.accessToken,
          password: new Hashes.SHA256().hex(this.newPassword),
          otp: this.otpCode,
        })
        if (response?.data?.success) {
          this.buttonLoader = false;
          this.clearValues();
          this.$emit('passwordChanged');
        }
      } catch (error) {
        console.log(error);
        if (error?.response?.status === 400) {
          this.isSnackbarDataNotCorrectOpen = true;
        }
        if (error?.response?.status === 429) {
          this.isUserBlockedDialogOpen = true;
          this.clearValues();
          this.$emit('close');
        }
      }
      this.buttonLoader = false;
    },
    clearValues() {
      this.newPassword = '';
      this.confirmNewPassword = '';
      this.otpCode = '';
      this.email = '';
      this.modInsertNewPassword = false;
    }
  },
  computed: {
    ...mapWritableState(useAppStore, ['languageChosen']),
    validEmailAddress() {
      return String(this.email)
        .toLowerCase()
        .match(
          /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g
        );
    },
    confirmPasswordFormValid() {
      return !!this.confirmNewPassword && !!this.newPassword &&
        (this.confirmNewPassword === this.newPassword) &&
        !!this.otpCode && this.otpCode.length === 6
    }
  },
  watch: {
    isDialogForgotPasswordOpen(newVal) {
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
