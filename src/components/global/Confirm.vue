<template>
  <v-dialog
      v-model="dialog"
      :max-width="options.width"
      @keydown.esc="cancel"
      v-bind:style="{ zIndex: options.zIndex }"
  >
    <v-card>
      <v-toolbar dark :color="options.color" dense text>
        <v-toolbar-title style="margin-left: 1vh" class="white--text">{{ title }}</v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions class="pt-0">
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="outlined" @click.native="cancel">{{ getTranslation("CANCEL") }}</v-btn>
        <v-btn color="primary" variant="elevated" @click.native="agree">{{ getTranslation("CONTINUE") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import {mapWritableState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    message: null,
    title: null,
    options: {
      color: 'primary',
      width: 400,
      zIndex: 200
    },
    params: null,
  }),
  methods: {
    open(title, message, options, params) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options);
      this.params = params;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree() {
      this.resolve(true);
      this.dialog = false;
    },
    cancel() {
      this.resolve(false);
      this.dialog = false;
    },
    getTranslation(key){
      let result = translateService.getTranslation(this.languageChosen,key);
      if(!result)
        return key;
      else
        return result
    },
  },
  computed: {
    ...mapWritableState(useAppStore, ['languageChosen'])
  }
};
</script>
