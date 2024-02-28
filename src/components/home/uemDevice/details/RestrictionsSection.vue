<template>
  <div>
    {{
      !restrictions &&
      getTranslation("NO_RESTRICTIONS")
    }}
    <p v-if="restrictions && restrictions.length > 0">
      {{
        getTranslation("RESTRICTIONS_APPLICATION_HEADER")
      }}
      {{ restriction.applicationDate }}
    </p>
    <v-list v-if="restrictions && restrictions.length > 0">
      <v-list-item v-for="restriction in restrictions">
        <p>
          {{ getTranslation(restriction.name) }}
          <v-icon>{{
              restriction.enabled ? "fa fa-check" : "fa fa-xmark"
            }}</v-icon>
        </p>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import { toRef } from "vue";
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "RestrictionsSection",
  props: {
    currentDevice: {
      type: Object,
      required: true,
      default: {},
    },
    data: {
      type: Object,
      required: false,
      default: [],
    },
  },
  data() {
    return {
      restrictions: [],
      info: [],
    };
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  created() {
    this.restrictions = this.currentDevice.certificateList;
    this.info = this.data.restrictions[0];
  },
  mounted() {},
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
};
</script>

<style scoped lang="scss"></style>
