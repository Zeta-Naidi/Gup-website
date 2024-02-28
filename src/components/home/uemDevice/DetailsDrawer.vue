<template>
  <!-- v-if="(device) => device" -->
  <v-navigation-drawer :absolute="true" :permanent="true" location="right" v-if="drawer" class="detailsDrawer d-flex flex-column"
                       v-model="localDrawer" elevation="2" width="60%" :width="drawerWidth" style="top: 0">
    <!-- @rowClick="onRowClick" -->
    <v-card class="mainCard">
      <v-tabs v-model="tab">
        <v-tab v-for="(tab, index) in tabs" :key="`tab-${index}`">
          <!-- :value="`tab-${index}`" -->
          {{ getTranslation(tab.title) }}</v-tab>
      </v-tabs>
      <v-divider></v-divider>
      <v-card-title>
        <h3>{{ currentDevice["name"] }}</h3>
        <v-spacer></v-spacer>
        <v-chip class="mr-2" label v-if="currentDevice.isSupervised === 1 ||
          currentDevice.isEnrolled === 1 ||
          currentDevice.isDeleted === 1" color="green">
          {{ getTranslation("ENROLLED") }}
        </v-chip>
        <v-chip class="mr-2" label v-else color="red">
          {{ getTranslation("NOT_SUPERVISED") }}
        </v-chip>
        <v-icon color="primary" @click="">mdi-help-circle</v-icon>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="details-container">
<!--        <v-tabs-items v-model="tab">
          <v-tab-item v-for="(tab, index) in tabs" :key="index">
            <v-alert v-if="index == 0 &&
              (currentDevice.lastActivity === null ||
                Date.now() - currentDevice.lastActivity > oneDay)
              " density="compact" type="warning">
              {{ getTranslation("DEVICE_INACTIVE") }}</v-alert>
            <details-section v-if="index === 0" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                             :data="tabs[index]" />
            <user-section v-else-if="index === 1" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                          :data="tabs[index]" />
            <apps-section v-else-if="index === 2" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                          :data="tabs[index]" />
            <profile-section v-else-if="index === 3" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                             :data="tabs[index]"></profile-section>
            <certificates-section v-else-if="index === 4" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                                  :data="tabs[index]"></certificates-section>
            <restrictions-section v-else-if="index === 5" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                                  :data="tabs[index]"></restrictions-section>
            <updates-section v-else-if="index === 6" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                             :data="tabs[index]"></updates-section>
            <activities-section v-else-if="index === 7" :ref="`${tabs[index].title}`" :currentDevice="currentDevice"
                                :data="tabs[index]"></activities-section>
          </v-tab-item>
        </v-tabs-items>-->

         <v-window v-model="tab">
            <v-window-item v-for="(tab, index) in tabs" :value="`item-${index}`" :key="index">
         <v-alert v-if="index == 0 &&
                (currentDevice.lastActivity === null ||
                  Date.now() - currentDevice.lastActivity > oneDay)
                " density="compact" type="warning">
                {{ getTranslation("DEVICE_INACTIVE") }}</v-alert>
              <details-section v-if="index === 0" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[0]" />
              <user-section v-else-if="index === 1" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]" />
              <apps-section v-else-if="index === 2" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]" />
              <profile-section v-else-if="index === 3" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]"></profile-section>
              <certificates-section v-else-if="index === 4" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]"></certificates-section>
              <restrictions-section v-else-if="index === 5" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]"></restrictions-section>
              <updates-section v-else-if="index === 6" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]"></updates-section>
              <activities-section v-else-if="index === 7" :ref="`${tabs[0].title}`" :currentDevice="currentDevice"
                :data="tabs[index]"></activities-section>
         </v-window-item>
          </v-window>
      </v-card-text>

    </v-card>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn color="primary darken-1" @click="closeDrawer" :block="true">
          Close
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>

</template>

<script>
import translateService from "@/globalServices/translate";
import DetailsSection from "./details/DetailsSection.vue";
import UserSection from "./details/UserSection.vue";
import AppsSection from "./details/AppsSection.vue";
import CertificatesSection from "./details/CertificatesSection.vue";
import RestrictionsSection from "./details/RestrictionsSection.vue";
import UpdatesSection from "./details/UpdatesSection.vue";
import ActivitiesSection from "./details/ActivitiesSection.vue";
import ProfileSection from "./details/ProfileSection.vue";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "DetailsDrawer",
  components: {
    DetailsSection,
    UserSection,
    AppsSection,
    ProfileSection,
    CertificatesSection,
    RestrictionsSection,
    UpdatesSection,
    ActivitiesSection,
  },
  props: {
    drawer: {
      type: Boolean,
      required: true,
    },
    device: {
      required: true,
    },
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  data() {
    return {
      currentDevice: {},
      oneDay: 24 * 60 * 60 * 1000,
      localDrawer: false,
      headers: [],
      tab: null,
      tabs: [
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "DETAILS"
          ),
          details: [
            {
              section: "summary",
              title: "",
              flex: 12,
              keys: {
                productName: "PRODUCT_NAME",
                modelDevice: "MODEL_DEVICE",
                batteryLevel: "BATTERY_LEVEL",
              },
            },
            {
              section: "identifiers",
              title: "IDENTIFIERS",
              flex: 6,
              keys: {
                deviceId: "DEVICE_ID",
                serialNumber: "SERIAL_NUMBER",
                macAddress: "MAC_ADDRESS",
                brand: "BRAND",
                manufacturer: "MANUFACTURER",
                imei: "IMEI",
                abbinationCode: "ABBINATION_CODE",
              },
            },
            {
              section: "location",
              title: "LOCATION",
              flex: 6,
              keys: {
                lastLatitude: "LAST_LATITUDE",
                lastLongitude: "LAST_LONGITUDE",
              },
            },
            {
              section: "os",
              title: "OS",
              flex: 6,
              keys: {
                osType: "OS_TYPE",
                osVersion: "OS_VERSION",
                securityPatchDate: "BUILD",
                androidOsName: "ANDROID_OS_NAME",
                androidActiveLauncher: "ANDROID_LAUNCHER_PACKAGE",
                androidAppUsagePermission: "ANDROIDAPPUSAGEPERMISSION",
                knoxVersion: "KNOW_VERSION",
                knowLicenseActivated: "KNOX_LICENSE_STATUS",
                mode: "MODE",
              },
            },
            {
              section: "sim",
              title: "SIM",
              flex: 6,
              keys: {
                simState: "SIM_STATE",
                hasSimInstalled: "HASSIMINSTALLED",
                imei: "IMEI",
              },
            },
            {
              section: "specs",
              title: "SPECS",
              flex: 6,
              keys: {
                deviceCapacity: "DEVICE_CAPACITY",
                archive: "ARCHIVE",
                androidCpu: "ANDROIDCPU",
                androidBoardChipset: "ANDROID_BOARD_CHIPSET",
                bootloader: "BOOTLOADER",
                androidBootloader: "ANDROID_BOOTLOADER",
                displayResolutionCapability: "DISPLAY_RESOLUTION_CAPABILITY",
                orientationSupport: "ORIENTATION_SUPPORT",
                ram: "RAM",
                isBatteryCharging: "IS_BATTERY_CHARGING",
                battery: "BATTERY",
                direct: "DIRECT",
                powerSupply: "POWER_SUPPLY",
                screenLightTime: "SCREENLIGHT_TIME",
                screenLightTimeSinceDate: "SCREENLIGHT_TIME_SINCEDATE",
              },
            },
            {
              section: "network",
              title: "NETWORK",
              flex: 6,
              keys: {
                isNetworkTethered: "IS_NETWORK_TETHERED",
                lastIpAddress: "LAST_PUBLIC_IPADDRESS",
                macAddress: "MAC_ADDRESS",
                isWifiActive: "IS_WIFI_ACTIVE",
                wifiActiveSSID: "LASTWIFIACTIVESSID",
                wifiIpAddress: "LASTWIFIIPADDRESS",
                networkInterfaces: "NETWORK_INTERFACES",
                isNetworkSpecialPermissionActive:
                    "ISNETWORKSPECIALPERMISSIONACTIVE",
              },
            },
            {
              section: "account",
              title: "ACCOUNT",
              flex: 6,
              keys: {
                googleAccount: "GOOGLE_ACCOUNT",
                gplayManagedAccountStatus: "MANAGED_ACCOUNT",
                depProfileGroupType: "IS_BINDED_TO_A_FAMILY",
              },
            },
            {
              section: "security",
              title: "SECURITY",
              flex: 6,
              keys: {
                isRootedJailbroken: "IS_ROOT_JAILBROKEN",
                isEncrypted: "IS_ENCRYPTED",
                isPasscodeEnabled: "IS_PASSCODE_ENABLED",
                isDeviceLocatorServiceEnabled: "ISDEVICELOCATORSERVICEENABLED",
                blockResetFactory: "DISABLE_FACTORY_RESET_PROTECTION",
                isLostModeEnabled: "LOSTMODE",
                androidAgentVersion: "ANDROID_AGENT_VERSION",
                isPasscodeCompliant: "IS_PASSCODE_COMPLIANT",
                systemIntegrity: "SYSTEM_INTEGRITY",
                offlineUnenrollmentCode: "OFFLINE_UNENROLLMENT_CODE",
                lastScanTimestamp: "LAST_SCAN_DATE",
                lastLocalAntivirusDatabaseUpdateTimestamp:
                    "LAST_LOCAL_DB_UPDATE",
                localAntivirusLicenseActive: "ANTIVIRUS_LICENSE_ACTIVE",
              },
            },
            {
              section: "bluetooth",
              title: "BLUETOOTH",
              flex: 6,
              keys: {
                isBluetoothActive: "IS_BLUETOOTH_ACTIVE",
              },
            },
            {
              section: "updates",
              title: "UPDATES",
              flex: 6,
              keys: {
                osUpdatePolicy: "OS_UPDATE_POLICY",
              },
            },
            {
              section: "activities",
              title: "ACTIVITIES",
              flex: 6,
              keys: {
                lastMdmCheckinTime: "LAST_MDM_CHECK_IN_TIME",
                lastMdmUpdateAt: "LAST_MDM_UPDATE_AT",
              },
            },
            {
              section: "sensors",
              title: "SENSORS",
              flex: 6,
              keys: {
                cpu: "CPU",
                battery: "BATTERY",
                skin: "SKIN",
              },
            },
            //inserire gruppi e tags
            { section: "groups", title: "GROUPS", flex: 6, keys: {} },
            { section: "tags", title: "TAGS", flex: 6, keys: {} },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "USER"
          ),
          user: [
            {
              section: "AVATAR",
              title: "AVATAR",
              keys: {
                src: "https://placehold.co/180x180",
                style: "width: 180px",
                alt: "Avatar utente",
              },
            },
            {
              section: "DETAILS",
              title: "DETAILS",
              keys: {
                id: "USER_ID",
                nameSurname: "USER_NAME_SURNAME",
                username: "USER_USERNAME",
                lastActivity: "USER_LAST_ACTIVITY",
              },
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "APPS"
          ),
          apps: [
            {
              section: "apps",
              title: "APPS",
              keys: {
                name: "APP_NAME",
                version: "APP_VERSION",
                installationDate: "APP_INSTALLATION_DATE",
              },
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "PROFILES"
          ),
          profiles: [
            {
              section: "profiles",
              title: "PROFILES",
              keys: {},
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "CERTIFICATES"
          ),
          certificates: [
            {
              section: "certificates",
              title: "CERTIFICATES",
              keys: {},
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "RESTRICTIONS"
          ),
          restrictions: [
            {
              section: "restrictions",
              title: "RESTRICTIONS",
              keys: {},
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "UPDATES"
          ),
          updates: [
            {
              section: "updates",
              title: "UPDATES",
              keys: {},
            },
          ],
        },
        {
          title: translateService.getTranslation(
              this.languageChosen,
              "ACTIVITIES"
          ),
          activities: [
            {
              section: "activities",
              title: "ACTIVITIES",
              keys: {},
            },
          ],
        },
      ],
    };
  },
  created() {
    if (Object.keys(this.device).length) {
      this.localDrawer = this.drawer;
    }
  },
  mounted() {
    this.currentDevice = this.device;
    this.localDrawer = this.drawer;
  },
  computed: {
    drawerWidth() {
      switch (this.$vuetify.display.mobile) {
        case "xs":
          return "100%";
        case "sm":
          return "100%";
        case "md":
          return "60%";
        case "lg":
          return "60%";
        case "xl":
          return "40%";
      }
    },
  },
  watch: {
    drawer(newVal) {
      this.localDrawer = this.drawer;
      // if (newVal == false)
      //   document.documentElement.classList.remove("noScroll");
    },
    device(newDevice) {
      this.currentDevice = newDevice;
    }
  },
  methods: {
    // onRowClick(item) {
    //   this.device = item;
    // },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    addSpaceBeforeUpperCase(str) {
      const spacedStr = str.replace(/([a-z])([A-Z])/g, "$1 $2");
      return spacedStr.charAt(0).toUpperCase() + spacedStr.slice(1);
    },
    closeDrawer() {
      document.querySelectorAll(".noScroll");
      document.documentElement.classList.remove("noScroll");
      this.$emit("close", false);
    },
    handleClickOutside() {
      closeDrawer();
    },
  },
};
</script>

<style scoped lang="scss">
.v-navigation-drawer.detailsDrawer {
  width: 100%;

  .mainCard {
    &.v-card--variant-elevated {
      box-shadow: none;
    }
  }

  :deep(.v-card__title) {
    padding: 2rem 1rem 1rem 2.2rem;
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
      background-color: rgb(var(--v-theme-primary));
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

  /* .details__grid {
    display: grid;
    gap: 2rem 1rem;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(4, minmax(100px, auto));
    align-items: flex-start; */
  .sheet {
    background-color: rgb(250, 250, 248);
    /* border-radius: 1rem; */
    box-shadow: inset 0 0 15px rgba(55, 84, 170, 0),
    inset 0 0 20px rgba(255, 255, 255, 0),
    10px 10px 18px rgba(55, 84, 170, 0.15), -10px -10px 22px white,
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

:deep(.details-container) {
  height: 500px;
  overflow: auto;

  /* TODO: HEIGHT NEEDS TO BE DEFINED DYNAMICALLY */
  .container.container--fluid {
    max-height: 76vh;
    overflow-y: scroll;
  }
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
