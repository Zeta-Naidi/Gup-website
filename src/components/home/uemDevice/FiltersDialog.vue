<template>
  <v-dialog
    v-model="localValue"
    :persistent="true"
    transition="dialog-right-transition"
    max-width="600"
  >
    <v-card :border="true">
      <v-toolbar
        class="pl-6"
        color="primary"
        dark
      >{{ getTranslation("FILTERS") }}
      </v-toolbar>
      <v-card-text class="pa-6">
        <v-autocomplete
          class="mb-6"
          v-model="filterOsType"
          :items="osTypes"
          :label="getTranslation('OS_TYPES')"
          :search-input.sync="searchOsTypeString"
          filled
          outlined
          hide-details="auto"
          :multiple="true"
          item-value="value"
          :item-title="() => null"
          style="margin-right: 5px;"
        >
          <template #selection="{ item }">
            <v-chip
              :closable="true"
              size="x-large"
              color="grey"
              @click:close="removeOsFilter(item.value)"
            >
              <div class="d-flex align-center">
                <v-icon
                  :color="getColorIconOsType(item.value)"
                  class="pr-1"
                >
                  {{ getNameIconOsType(item.value) }}
                </v-icon>
                {{ item.value.toUpperCase() }}
              </div>
            </v-chip>
          </template>
          <template v-slot:item="{ item,props }">
            <v-list-item v-bind="props" class="d-flex">
              <v-icon
                :color="getColorIconOsType(item.value)"
                variant="elevated"
                size="x-large"
                class="pr-1"
              >
                {{ getNameIconOsType(item.value) }}
              </v-icon>
              {{item.raw.title}}
            </v-list-item>
          </template>
        </v-autocomplete>
        <v-spacer/>
        <v-autocomplete
          v-model="filterEnrollmentType"
          :items="enrollmentTypes"
          :label="getTranslation('ENROLLMENT_TYPES')"
          :search-input.sync="searchEnrollmentTypeString"
          filled
          outlined
          hide-details="auto"
          item-value="id"
          :item-title="() => null"
          :multiple="true"
          style="margin-right: 5px;"
        >
          <template v-slot:selection="{ item }">
            <div>
              <v-chip
                :closable="true"
                variant="elevated"
                color="primary"
                @click:close="removeEnrollmentTypeFilter(item.raw)"
              >
                {{ getTranslation(item.raw.name) }}
              </v-chip>
            </div>
          </template>
          <template #item="{ item,props }">
            <v-list-item v-bind="props">
              {{ getTranslation(item.raw.name) }}
            </v-list-item>
          </template>
        </v-autocomplete>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn
          :flat="true"
          @click="closeDialog"
        >{{ getTranslation("CLOSE") }}
        </v-btn
        >
        <v-btn
          color="#6c757d"
          @click="clearFilters()"
          :loading="loadingItems"
        >
          {{ getTranslation("RESET_FILTERS") }}
        </v-btn>
        <v-btn
          color="primary"
          @click="applyTableFilters"
          :loading="loadingItems"
        >
          {{ getTranslation("APPLY") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import deviceService from "@/globalServices/deviceService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "FiltersMenu",
  components: {},
  data: () => ({
    localValue: false,
    osTypes: [
      {value: "windows", title:"WINDOWS"},
      {value: "ios", title:"IOS"},
      {value: "osx", title:"OSX"},
      {value: "linux", title:"LINUX"},
      {value: "android", title:"ANDROID"}],
    enrollmentTypes: [
      {id: 1, name: "ENROLLED"},
      {id: 2, name: "SUPERVISED"},
      {id: 3, name: "NOT_ENROLLED"},
      {id: 4, name: "NOT_SUPERVISED"},
      {id: 5, name: "EXTRA"},
    ],
    searchOsTypeString: "",
    searchEnrollmentTypeString: "",
    filterOsType: [],
    filterEnrollmentType: [],
    filterTableOsTypeWhenOpenedMenu: [],
    filterTableEnrollmentTypeWhenOpenedMenu: [],
    changesAreValid: false,
    numberFiltersActive: 0,
    isMenuOpen: false,
    serialNumbers: [],
    clientsFilter: undefined,
    enrollmentTypeFilter: undefined,
    osTypeFilter: undefined,
    loadingItems: false,
  }),
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    applyTableFilters() {
      this.$emit("deviceFilters", {
        osTypeFilter: this.filterOsType.length > 0 ? this.filterOsType : null,
        enrollmentTypeFilter:
          this.filterEnrollmentType.length > 0
            ? this.filterEnrollmentType
            : null,
        paginate: true,
        serialOrName: null,
        status: null,
        rowsPerPage: 0,
        page: 0,
      });
      this.numberFiltersActive =
        this.filterOsType.length + this.filterEnrollmentType.length;
      this.changesAreValid = true;
      this.closeDialog();
      console.log("applyTableFilters end");
    },
    clearFilters() {
      this.numberFiltersActive = 0;
      this.filterOsType = [];
      this.filterEnrollmentType = [];
      this.osTypeFilter = null;
      this.enrollmentTypeFilter = null;
      this.applyTableFilters();
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
    removeEnrollmentTypeFilter(item) {
      this.filterEnrollmentType = this.filterEnrollmentType.filter(
        (el) => el !== item.id
      );
    },
    removeOsFilter(item) {
      this.filterOsType = this.filterOsType.filter((el) => el !== item);
    },
    closeDialog() {
      this.$emit("close");
    },
  },
  watch: {
    filterEnrollmentType(newVal, oldVal) {
      if (newVal.length > oldVal.length) this.searchEnrollmentTypeString = "";
    },
    filterOsType(newVal, oldVal) {
      if (newVal.length > oldVal.length) this.searchOsTypeString = "";
    },
    value(newVal) {
      this.localValue = newVal
    }
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen']),
  },
};
</script>
<style lang="scss" scoped>
</style>
