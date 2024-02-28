<template>
  <v-container fluid>
    <div v-if="!certificates">
      {{ getTranslation("NO_CERTIFICATES") }}
    </div>
    <div v-else>
      <span v-for="certificate in certificates">{{ certificate }}</span>
    </div>
  </v-container>
</template>

<script>
  import translateService from "@/globalServices/translate";
  import {useAppStore} from "@/plugins/pinia/app";
  export default {
    name: "CertificatesSection",
    props: {
      currentDevice: {
        type: Object,
        required: true,
        default: {},
      },
      labels: {
        type: Object,
        required: false,
        default: [],
      },
    },
    data() {
      return {
        certificates: [],
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
      this.certificates = this.currentDevice.certificateList;
      this.info = this.labels.certificates[0];
    },
    methods: {
      getTranslation(key) {
        let result = translateService.getTranslation(this.languageChosen, key);
        if (!result) return key;
        else return result;
      },
    },
  };
</script>

<style scoped lang="scss"></style>
