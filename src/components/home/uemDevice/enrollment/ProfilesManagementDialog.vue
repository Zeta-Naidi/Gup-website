<template>
  <v-dialog
      persistent
      v-model="localValue"
      transition="dialog-right-transition"
      max-width="60vw"
  >
    <v-card>
      <v-card-title>
          {{getTranslation("Gestione profili di registrazione")}}
      </v-card-title>

      <v-card-item>
        <v-data-table
          v-model="selectedProfiles"
          class="elevation-1 devices-table-wrapper"
          ref="table"
          :headers="headers"
          :items="profiles"
          :loading="loading"
          :options.sync="optionsPagination"
          :server-items-length="totalRows"
          @update:options="updatePagination"
          fixed-header
          :footer-props="{
          'items-per-page-text': getTranslation('ROWS_PER_PAGE'),
          'show-current-page': true,
          'show-first-last-page': true,
          'items-per-page-options': [5, 10, 20],
        }"
          mobile-breakpoint="0"
        >
        </v-data-table>
      </v-card-item>

      <v-card-actions>
        <v-btn
          color="primary"
          @click="closeDialog"
          :aria-label="getTranslation('CLOSE')"
        >
          {{ getTranslation("CLOSE") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "RegistrationProfilesDialog",
  components: {},
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    payload: {
      type: Object,
      default: {},
    }
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  data: (ctx) => ({
    localValue:false,
    profiles: [],
    // dialogClass: {
    //   height: ctx.height,
    // },
    loading: true,
    optionsPagination: {
      page: 1,
    },
    totalRows: 0,
    rowsPerPage: 10,
    currentPage: 1,
    selectedProfiles: [],
    headers: [
      {
        text: "NAME",
        align: "start",
        value: "name",
        width: "",
        sortable: false,
      },
      {
        text: "EXPIRATION",
        value: "single_use",
        align: "start",
        width: "",
      },
      {
        text: "ALLOWED_USES",
        value: "allowed_uses",
        align: "start",
        width: "",
      },
      {
        text: "EXPIRATION",
        value: "expiration",
        align: "start",
        width: "",
      },
      {
        text: "ACTIONS",
        value: "actions",
        align: "start",
        width: "",
      },
    ],
    elements: [
      {
        type: "button",
        text: "ADD",
        action: () => ctx.genericAction(),
        width: "15rem",
        icon: "mdi-plus",
        ariaLabel: "ADD",
      },
    ],
  }),
  methods: {
    genericAction() {
      console.log("button pressed");
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
    closeDialog() {
      this.$emit("closeProfilesManagement", false);
      setTimeout(() => (this.step = 1), 500);
    },
    updatePagination(optionsPagination) {
      this.currentPage = optionsPagination.page;
      this.rowsPerPage = optionsPagination.itemsPerPage;
      this.genericAction();
    },
  },
  created() {
    this.localValue = this.isOpen
  }
};
</script>

<style lang="scss" scoped>
.profilesManagementDialog {
  &__wrapper {
    background-color: #cbcbcb; //, rgb(var(--v-theme-primary));
  }
  &__container {
  }
}
.dialogFooter {
  display: flex;
  flex-flow: column;

  .row {
    flex: 2;
  }
}
</style>
