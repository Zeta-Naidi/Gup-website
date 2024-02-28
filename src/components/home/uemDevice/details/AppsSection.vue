<template>
  <div>
    <div class="buttonsContainer">
      <v-btn variant="text" density="compact" @click="openAll">Open All</v-btn>
      /
      <v-btn variant="text" density="compact" @click="closeAll">Close All</v-btn>
    </div>
    <v-expansion-panels multiple v-model="openPanels">
      <v-row class="titlesContainer">
        <v-col cols="5" sm="5">
          <h3 :class="`titlesContainer__name`">
            {{ getTranslation("APP_NAME") }}
          </h3>
        </v-col>
        <v-col cols="3" sm="3">
          <h3 :class="`titlesContainer__version`">
            {{
              getTranslation("APP_VERSION")
            }}
          </h3>
        </v-col>
        <v-col cols="3" sm="3">
          <h3 :class="`titlesContainer__installationDate`">
            {{
              getTranslation(
                  "APP_INSTALLATION_DATE"
              )
            }}
          </h3>
        </v-col>
      </v-row>
      <v-expansion-panel v-for="app in apps" :key="app.Identifier">
        <v-expansion-panel-header>
          <v-col cols="5" sm="5">
            <v-icon class="mr-2">
              {{
                app.thumbnail ? app.thumbnail : "fa fa-question-circle"
              }}
            </v-icon>
            <span class="font-weight-bold mr-2">
              {{ `${app.Name ? `${app.Name}` : app.Identifier}` }}
            </span>
            <span>{{ `${app.sourceDir ? `${app.sourceDir}` : ""}` }}</span>
          </v-col>
          <v-col cols="3" sm="3">{{
              `${app.shortVersion ? app.shortVersion : ""}`
            }}</v-col>
          <v-col cols="3" sm="3">{{
              `${app.installDate ? getFormattedDate(app.installDate) : ""}`
            }}</v-col></v-expansion-panel-header>
        <v-expansion-panel-content v-if="app.runtimePermissions">
          <template>
            <div v-for="(
              nestedPermissions, parentPermission
            ) in extractValidPermissions(app.runtimePermissions)" :key="parentPermission">
              <ul>
                <p class="font-weight-bold">
                  {{
                    parentPermission &&
                    parentPermission.split(".").pop() != "UNDEFINED"
                        ? parentPermission?.split(".").pop()
                        : ""
                  }}
                </p>
                <ul class="ulElement">
                  <li v-for="permission in nestedPermissions" :key="permission">
                    {{ permission }}
                  </li>
                </ul>
              </ul>
            </div>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { toRef } from "vue";
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "AppsSection",
  props: {
    currentDevice: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      openPanels: [],
      permissions: [],
      nestedPermissionsCount: {},
    };
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  computed: {
    installedApps() {
      return this.currentDevice.installedApps || [];
    },
    // nestedPermissionsCountForApp() {
    //   get() {
    //     return this.nestedPermissionsCount;
    //   },
    //   set(value) {
    //     this.nestedPermissionsCount = value;
    //   }
    // },
  },
  created() {
    this.apps = this.currentDevice.installedApps;
    this.info = this.data.apps[0];
  },
  mounted() {
    // this.installedApps.forEach(app => {
    //   this.updateNestedPermissionsCount(app);
    // }),
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    getFormattedDate(date) {
      const dateObj = new Date(date);
      return `${dateObj
          .getUTCHours()
          .toString()
          .padStart(2, "0")}:${dateObj
          .getUTCMinutes()
          .toString()
          .padStart(2, "0")}:${dateObj
          .getUTCSeconds()
          .toString()
          .padStart(2, "0")} ${dateObj
          .getUTCDate()
          .toString()
          .padStart(2, "0")}-${(dateObj.getUTCMonth() + 1)
          .toString()
          .padStart(2, "0")}-${dateObj.getUTCFullYear()}`;
    },
    extractValidPermissions(runtimePermissions) {
      const result = {};

      if (!runtimePermissions || typeof runtimePermissions !== "object") {
        return result;
      }

      Object.keys(runtimePermissions).forEach((parentPermission) => {
        const nestedPermissions = runtimePermissions[parentPermission];
        const validNestedKeys = Object.keys(nestedPermissions).filter(
            (nestedKey) => nestedPermissions[nestedKey] !== -1
        );

        if (validNestedKeys.length > 0) {
          result[parentPermission] = validNestedKeys;
        }
      });
      this.permissions = result;
      return result;
    },
    openAll() {
      this.openPanels = this.installedApps.map((_, index) => index);
    },
    closeAll() {
      this.openPanels = [];
    },
    // countNestedPermissions(permissions) {
    //   return Object.values(permissions).reduce(
    //     (acc, current) => acc + Object.keys(current).length,
    //     0
    //   );
    // },
    // updateNestedPermissionsCount(app) {
    //   const count = Object.values(app.runtimePermissions).reduce((acc, current) => acc + Object.keys(current).length, 0);
    //   this.$set(this.nestedPermissionsCount, app.Identifier, count);
    // }
  },
};
</script>

<style scoped lang="scss">
.ulElement {
  padding-left: 1rem !important;
}

.buttonsContainer {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  justify-content: flex-end;
  height: 2rem;
  padding-right: 1.5rem;
}

.titlesContainer {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;

  /* padding-right: 5rem; */
  .v-col-sm-5.v-col-5 {
    padding: 1rem 3rem;
  }

  .v-col-sm-3.v-col-3 {
    padding-right: 2rem;
  }

  &__name {
    flex: 4;
  }

  &__version {
    flex: 2;
  }

  &__installationDate {
    flex: 1;
    margin-left: -1.5rem; //orrendo, da fixare
  }
}
</style>
