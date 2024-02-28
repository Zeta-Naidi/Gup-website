<template>
  <v-card v-if="showMenu" style="border: 1px solid white"  height="45vh">
    <v-card-title>
      {{ getTranslation("ACTIONS") }}
    </v-card-title>

    <v-card-text height="40vh" style="overflow: auto">
      <template v-if="loadingMenuActions">
        <v-skeleton-loader :loading="loadingMenuActions" :elevation="24" type="article"></v-skeleton-loader>
      </template>

      <template v-else>
        <v-list>
          <v-list-item
            v-for="action in actions"
            :value="action"
            @click="actionSelected(action)">
            {{ getTranslation(action.actionType.toUpperCase()) }}
          </v-list-item>
        </v-list>
      </template>
    </v-card-text>
  </v-card>
</template>

<script>
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  created() {
    this.showMenu = this.show
  },
  name: "ActionMenu",
  data() {
    return {
      showMenu: false,
    }
  },
  props: {
    show: Boolean,
    loadingMenuActions: Boolean,
    actions: Array,
    offsetX: {
      type: [Number, String],
      default: 0,
    },
    offsetY: {
      type: [Number, String],
      default: 0,
    },
  },
  methods: {
    closeMenu(){
      this.$emit("close", false);
    },
    actionSelected(action){
      this.$emit("actionSelected", action);
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
