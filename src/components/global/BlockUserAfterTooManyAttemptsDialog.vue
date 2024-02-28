<template>
  <v-dialog
    v-model="localValue"
    persistent
    max-width="800"
  >
    <v-card>
      <v-card-title>
        <v-alert
          dense
          icon="mdi-alert-circle"
          outlined
          prominent
          color="red"
          type="error"
          style="width: 100%"
        >
          {{ getTranslation('NOTIFICATION_HOST_BLOCKED')}}
        </v-alert>
      </v-card-title>
      <v-card-text>
        <div class="d-flex justify-center" style="color: red; font-size: 18px">
          {{ getTranslation('MAXFAILEDATTEMPTS') }}
        </div>
        <div class="d-flex justify-center" style="color: red; font-size: 18px">
          {{ getTranslation('CHANGES_TRYLATER') }}
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="ml-3" color="red" @click="$emit('close')">
          {{ getTranslation('CLOSE') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-snackbar
    v-model="isSnackbarOpen"
    :timeout="3500"
    class="mb-5"
  >
    <v-alert
      color="warning"
      outlined
      style="margin-bottom: 0 !important;"
    >
      {{ getTranslation("MAXFAILEDATTEMPTS") }}
    </v-alert>

    <template v-slot:actions>
      <v-btn
        color="blue"
        variant="text"
        @click="isSnackbarOpen = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "BlockUserAfterTooManyAttemptsDialog",
  data: () => ({
    isSnackbarOpen: false,
    localValue:false,
  }),
  props: {
    value: {
      type: Boolean,
      default:false,
    },
    showLastAttempt: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  watch: {
    value(newVal){
      this.localValue = newVal;
    }
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
