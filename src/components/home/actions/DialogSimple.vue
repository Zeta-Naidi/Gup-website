<template>

  <v-dialog
    transition="dialog-bottom-transition"
    persistent
    v-model="showDialog"
    width="950"
  >
    <v-card height="62vh">
      <div class="modal-header" style="align-items: center;display: flex;">
        <p class="text-h5 h5-header">{{ getTranslation(actionFormContent['Labels'][0].value) }}</p>
        <v-spacer></v-spacer>
        <v-icon
          color="primary"
          size="small"
          @click="close"
        >
          mdi-close
        </v-icon>

      </div>
      <v-card-text>
        <v-container>
          <p v-if="actionFormContent['Labels'][1]">{{ getTranslation(actionFormContent['Labels'][1].value) }}</p>
        </v-container>
      </v-card-text>
      <v-card-actions>
        {{ getTranslation("THE_ACTION_WILL_BE_APPLIED_TO") }} {{appliedTo['type']}}  with Serial: {{appliedTo['identifier']}}
        <v-spacer></v-spacer>
        <v-btn
          :loading="loadingBtn"
          color="primary"
          variant="outlined"
          @click="close">
          {{ getTranslation("CLOSE") }}
        </v-btn>
        <v-btn
          :loading="loadingBtn"
          color="primary"
          variant="elevated"
          @click="execute">
          {{ getTranslation("EXECUTE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  created() {
    this.showDialog = this.show
  },
  name: "ActionMenu",
  data() {
    return {
      showDialog: false,
    }
  },
  props: {
    show: Boolean,
    selectedAction: Array|Object,
    appliedTo: Array,
    loadingBtn: Boolean,
    actionFormContent: Array|Object,
  },
  methods: {
    close(){
      this.$emit("close", false);
    },
    execute(){
      this.$emit("execute", this.selectedAction['actionIdentifier'], this.appliedTo['id']);
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style>
*{
  font-size: 13px;
}
</style>
