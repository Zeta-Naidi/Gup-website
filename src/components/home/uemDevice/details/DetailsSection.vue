<template>
  <div>
    <v-container fluid>
      <v-row dense>
        <!-- class="nColumnsRow" -->
        <!-- <v-col cols="12" sm="12" :key="detailsIndex" v-for="(detailsSection, detailsIndex) in details"> -->
        <v-col v-for="(detailsSection, detailsIndex) in details" :key="detailsIndex" :cols="detailsSection.flex">
          <v-card elevation="4" class="ma-2 pa-2 sheet">
            <h3>
              {{
                getTranslation(
                    detailsSection.title
                )
              }}
            </h3>
            <v-list lines="false" density="compact">
              <v-list-item v-for="(value, key) of detailsSection.keys" :key="key">
                <template v-if="key !== 'networkInterfaces'">
                  {{
                    getTranslation(
                        value
                    )
                  }}
                </template>
                <template v-if="key === 'networkInterfaces'">
                  <NetworkInterfaceDropdown :component-name="getTranslation(
                    value
                  )
                    " :network-interfaces="JSON.stringify(currentDevice[key])" :name="key" />
                </template>
                <v-icon class="listValue__icon" v-if="key === 'batteryLevel'">fa fa-battery-half</v-icon>
                <span v-if="key !== 'networkInterfaces' && currentDevice[key]" class="listValue">
                  {{
                    currentDevice[key] == 0 || currentDevice[key] == 1
                        ? getTranslation(
                            currentDevice[key] == 0 ? "FALSE" : "TRUE"
                        )
                        : currentDevice[key]
                  }}
                </span>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import { toRef } from "vue";
import translateService from "@/globalServices/translate";
import NetworkInterfaceDropdown from "../NetworkInterfaceDropdown.vue";
import {useAppStore} from "@/plugins/pinia/app";
export default {
  name: "DetailsSection",
  components: {
    NetworkInterfaceDropdown,
  },
  props: {
    data: {
      type: Object,
      required: true,
      default: [],
    },
    currentDevice: {
      type: Object,
      required: true,
      default: {},
    },
  },
  data() {
    return {
      details: [],
    };
  },
  created() {
    this.details = this.data.details;
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
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
};
</script>
<style scoped lang="scss">
.v-navigation-drawer.detailsDrawer {
  width: 100%;

  .v-list:not(.v-select-list) {
    background-color: transparent;
  }

  .v-card {
    .v-card-title {
      display: flex;
      align-items: center;
      gap: 1rem;

      h3 {
        width: auto;
        flex: 1 1 0;
        line-height: 2rem;
        font-size: 1.5rem;
      }
    }

    .v-tab--selected {
      /* background-color: rgb(var(--v-theme-primary)); */
      color: rgb(var(--v-theme-white));
    }

    .v-tab__slider {
      border: 1 solid rgb(var(--v-theme-surface-lighter-1));
    }
  }

  .listValue {
    font-weight: 600;

    &__icon {
      margin-right: 0.5rem;
    }
  }

  .sheet {
    background-color: rgba(250, 250, 248, 0.1);
    box-shadow: inset 0 0 15px rgba(55, 84, 170, 0),
    inset 0 0 20px rgba(255, 255, 255, 0),
    -5px -5px 6px rgba(255, 255, 255, 0.05),
    inset 0px 0px 4px rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem;
  }

  .v-list-item {
    h3 {
      font-size: 1.2rem;
      min-height: 3.5rem;
      height: auto;
    }

    p {
      height: 3rem;
      word-break: break-all;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      &:hover {
        overflow: visible;
        white-space: normal;
      }
    }

    &--density-compact {
      min-height: 1rem;
    }
  }

  /* } */

  .v-divider {
    border: 1px solid rgb(var(--v-theme-surface-lighter-1));
    --v-border-opacity: 1;
  }
}

.details-container {
  height: 500px;
  overflow: auto;

  .nColumnsRow {
    display: block;
    column-count: 2;

    &>div {
      display: inline-block;
    }
  }
}

@media only screen and (min-width: 768px) {
  .v-navigation-drawer.detailsDrawer {
    width: 60%;
  }
}
</style>
