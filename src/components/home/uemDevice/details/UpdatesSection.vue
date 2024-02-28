<template>
  <v-container fluid>
    <p>
      {{ getTranslation(!update ? "NO_UPDATES" : "UPDATES_LAST_UPDATE") }}
      {{ !update ? "" : update }}
    </p>

    <!-- <p v-if="update.length > 0">
      {{ getTranslation("UPDATES_LAST_UPDATE") }} //
      {{ update }}
    </p> -->
    <!-- se si dovesse utilizzare una lista di aggiornamenti -->
    <!-- <v-list v-if="updates.length > 0">
      <v-list-item v-for="update in updates">
        <p>
          {{ getTranslation(update.name) }}
          {{ getTranslation(update.installationDate) }}
        </p>
        <v-divider></v-divider>
      </v-list-item>
    </v-list> -->
  </v-container>
</template>

<script>
  import translateService from "@/globalServices/translate";
  import {useAppStore} from "@/plugins/pinia/app";
  export default {
    name: "UpdatesSection",
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
        update: "",
      };
    },
    setup() {
      const appStore = useAppStore();

      return {
        languageChosen: appStore.languageChosen,
      };
    },
    created() {
      this.update = this.currentDevice.updateDate;
    },
    mounted() {},
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
