<template>
  <v-dialog
    persistent
    v-model="localValue"
    transition="dialog-right-transition"
    max-width="70vw"
    ref="enrollmentDialog"
    class="enrollmentDialog__wrapper"
  >
    <v-card>
      <v-card-title>
        <v-icon @click="closeDialog">mdi-close</v-icon>
      </v-card-title>

      <v-card-item>
        <v-stepper v-model="step">
          <template v-slot:default="{ prev, next }">
            <v-stepper-header>
              <v-stepper-item
                :complete="step > 1"
                step="Step 1"
                :value="1"
                editable
              >
                {{ getTranslation("ENROLLMENT_OS_SELECTION") }}
                <v-icon style="padding-bottom: 0.3rem">{{
                    getOsIcon(currentFlow)
                  }}</v-icon>
              </v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                :complete="step > 2"
                step="Step 2"
                :value="2"
                :editable="step > 1"
              >
                {{ getTranslation("ENROLLMENT_CONFIGURATION") }}
              </v-stepper-item>
              <v-divider></v-divider>
              <v-stepper-item
                step="Step 3"
                :value="3"
                :complete="step > 3"
                :editable="step > 2"
              >
                {{ getTranslation("ENROLLMENT_SCAN_QR") }}
              </v-stepper-item>
            </v-stepper-header>

            <v-stepper-window>
              <v-stepper-window-item
                :key="`1-content`"
                :value="1"
              >
                <v-card
                  height="35vh"
                >
                  <v-row
                    justify="space-around"
                    class="mb-2"
                  >
              <span>
                <v-icon
                  class="icon_enroll"
                  :style="osIcon.style"
                  v-for="osIcon in osIcons"
                  @click="() => osIcon.action(osIcon.name)"
                  :disabled="osIcon.name === 'windows'"
                >{{ osIcon.value }}</v-icon
                >
              </span></v-row
                  >
                </v-card>
              </v-stepper-window-item>

              <v-stepper-window-item
                :key="`2-content`"
                :value="2"
              >
                <v-card
                  class="mb-12"
                  color="grey darken-3"
                  height="50vh"
                >
                  <v-row
                    justify="space-around"
                    class="osChoiceContainer mt-2"
                  >
                    <v-card
                      v-for="(conf, idx) in enrollmentData[currentFlow]"
                      class="cardConf"
                      elevated="10"
                      color=""
                      :key="currentFlow + idx"
                      @click="setStep3(conf)"
                    >
                <span
                  :title="getTranslation(conf.desc)"
                  class="group pa-2"
                >{{ getTranslation(conf.label) }}</span
                >
                    </v-card>
                  </v-row>
                </v-card>
                <v-btn
                  @click="prev"
                  text
                >{{ getTranslation("PREVIOUS") }}</v-btn>
              </v-stepper-window-item>

              <v-stepper-window-item
                :key="`3-content`"
                :value="3"
              >
                <v-card
                  class="d-flex mb-12"
                  color="grey darken-3"
                  height="50vh"
                >
                  <v-row
                    justify="space-around"
                    :class="[
                currentOsSubset.length > 1
                  ? 'confChoiceContainer'
                  : 'singleChoiceContainer',
              ]"
                  >
                    <v-card
                      v-for="(conf, idx) in currentOsSubset"
                      class="cardConf subGroup pa-2"
                      elevated="10"
                      color=""
                      :key="idx"
                      @click="applyAction(conf)"
                    >
                      <qrcode-vue
                        class="qr"
                        v-if="conf.type === 'qr'"
                        :value="conf.url"
                        :size="200"
                        level="H"
                      />
                      <v-img
                        v-if="isImage(conf.icon)"
                        class="cardConf__image mr-1"
                        :aspect-ratio="1"
                        :src="conf.icon"
                        :lazy-src="imgSpinner"
                      ></v-img>
                      <span
                        v-if="conf.type !== 'qr'"
                        class="cardConf__label"
                        :title="conf.desc"
                      ><v-icon
                        v-if="!isImage(conf.icon)"
                        class="mr-1"
                      >{{ conf.icon }}</v-icon
                      >
                  {{ getTranslation(conf.label) }}</span
                      >
                    </v-card>
                  </v-row>
                </v-card>
                <v-btn
                  @click="prev"
                  text
                >{{ getTranslation("PREVIOUS") }}</v-btn>
              </v-stepper-window-item>
            </v-stepper-window>
          </template>
        </v-stepper>
      </v-card-item>
    </v-card>

    <ProfilesManagementDialog
      :isOpen="showProfilesManagementDialog"
      :payload="profilesManagementPayload"
      v-model="showProfilesManagementDialog"
      @closeProfilesManagement="closeProfilesManagementDialog"
    />
  </v-dialog>
</template>

<script>
// TODO: ADD ICON TO STEPPER TITLE TO SHOW OS
import translateService from "@/globalServices/translate";
import enrollmentData from "./enrollmentData.json";
import QrcodeVue from "qrcode.vue";
import ProfilesManagementDialog from "./ProfilesManagementDialog";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "EnrollmentDialog",
  components: {
    QrcodeVue,
    ProfilesManagementDialog,
  },
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  data: (ctx) => ({
    localValue:false,
    step: 1,
    device: {},
    osIcons: [
      {
        name: "windows",
        value: "mdi-microsoft-windows",
        action: (name) => ctx.setStep(2, name),
        style: "color: #0076FD;",
      },
      {
        name: "ios",
        value: "mdi-apple",
        action: (name) => ctx.setStep(2, name),
        style: "color: #2c2c2c;",
      },
      {
        name: "android",
        value: "mdi-android",
        action: (name) => ctx.setStep(2, name),
        style: "color: #3dda84;",
      },
    ],
    profilesManagementPayload: {},
    showProfilesManagementDialog: false,
    enrollmentData: enrollmentData,
    currentFlow: "",
    currentOsSubset: {},
    imgSpinner:
      "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHdpZHRoPSI0MHB4IiBoZWlnaHQ9IjQwcHgiIHZpZXdCb3g9IjAgMCA0MCA0MCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEuNDE0MjE7IiB4PSIwcHgiIHk9IjBweCI+CiAgICA8ZGVmcz4KICAgICAgICA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPjwhW0NEQVRBWwogICAgICAgICAgICBALXdlYmtpdC1rZXlmcmFtZXMgc3BpbiB7CiAgICAgICAgICAgICAgZnJvbSB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIC13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoLTM1OWRlZykKICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICAgICAgQGtleWZyYW1lcyBzcGluIHsKICAgICAgICAgICAgICBmcm9tIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDBkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICAgIHRvIHsKICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogcm90YXRlKC0zNTlkZWcpCiAgICAgICAgICAgICAgfQogICAgICAgICAgICB9CiAgICAgICAgICAgIHN2ZyB7CiAgICAgICAgICAgICAgICAtd2Via2l0LXRyYW5zZm9ybS1vcmlnaW46IDUwJSA1MCU7CiAgICAgICAgICAgICAgICAtd2Via2l0LWFuaW1hdGlvbjogc3BpbiAxLjVzIGxpbmVhciBpbmZpbml0ZTsKICAgICAgICAgICAgICAgIC13ZWJraXQtYmFja2ZhY2UtdmlzaWJpbGl0eTogaGlkZGVuOwogICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBzcGluIDEuNXMgbGluZWFyIGluZmluaXRlOwogICAgICAgICAgICB9CiAgICAgICAgXV0+PC9zdHlsZT4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJvdXRlciI+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwwQzIyLjIwNTgsMCAyMy45OTM5LDEuNzg4MTMgMjMuOTkzOSwzLjk5MzlDMjMuOTkzOSw2LjE5OTY4IDIyLjIwNTgsNy45ODc4MSAyMCw3Ljk4NzgxQzE3Ljc5NDIsNy45ODc4MSAxNi4wMDYxLDYuMTk5NjggMTYuMDA2MSwzLjk5MzlDMTYuMDA2MSwxLjc4ODEzIDE3Ljc5NDIsMCAyMCwwWiIgc3R5bGU9ImZpbGw6YmxhY2s7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNNS44NTc4Niw1Ljg1Nzg2QzcuNDE3NTgsNC4yOTgxNSA5Ljk0NjM4LDQuMjk4MTUgMTEuNTA2MSw1Ljg1Nzg2QzEzLjA2NTgsNy40MTc1OCAxMy4wNjU4LDkuOTQ2MzggMTEuNTA2MSwxMS41MDYxQzkuOTQ2MzgsMTMuMDY1OCA3LjQxNzU4LDEzLjA2NTggNS44NTc4NiwxMS41MDYxQzQuMjk4MTUsOS45NDYzOCA0LjI5ODE1LDcuNDE3NTggNS44NTc4Niw1Ljg1Nzg2WiIgc3R5bGU9ImZpbGw6cmdiKDIxMCwyMTAsMjEwKTsiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGc+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yMCwzMi4wMTIyQzIyLjIwNTgsMzIuMDEyMiAyMy45OTM5LDMzLjgwMDMgMjMuOTkzOSwzNi4wMDYxQzIzLjk5MzksMzguMjExOSAyMi4yMDU4LDQwIDIwLDQwQzE3Ljc5NDIsNDAgMTYuMDA2MSwzOC4yMTE5IDE2LjAwNjEsMzYuMDA2MUMxNi4wMDYxLDMzLjgwMDMgMTcuNzk0MiwzMi4wMTIyIDIwLDMyLjAxMjJaIiBzdHlsZT0iZmlsbDpyZ2IoMTMwLDEzMCwxMzApOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksMjguNDkzOUMzMC4wNTM2LDI2LjkzNDIgMzIuNTgyNCwyNi45MzQyIDM0LjE0MjEsMjguNDkzOUMzNS43MDE5LDMwLjA1MzYgMzUuNzAxOSwzMi41ODI0IDM0LjE0MjEsMzQuMTQyMUMzMi41ODI0LDM1LjcwMTkgMzAuMDUzNiwzNS43MDE5IDI4LjQ5MzksMzQuMTQyMUMyNi45MzQyLDMyLjU4MjQgMjYuOTM0MiwzMC4wNTM2IDI4LjQ5MzksMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxMDEsMTAxLDEwMSk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMy45OTM5LDE2LjAwNjFDNi4xOTk2OCwxNi4wMDYxIDcuOTg3ODEsMTcuNzk0MiA3Ljk4NzgxLDIwQzcuOTg3ODEsMjIuMjA1OCA2LjE5OTY4LDIzLjk5MzkgMy45OTM5LDIzLjk5MzlDMS43ODgxMywyMy45OTM5IDAsMjIuMjA1OCAwLDIwQzAsMTcuNzk0MiAxLjc4ODEzLDE2LjAwNjEgMy45OTM5LDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoMTg3LDE4NywxODcpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTUuODU3ODYsMjguNDkzOUM3LjQxNzU4LDI2LjkzNDIgOS45NDYzOCwyNi45MzQyIDExLjUwNjEsMjguNDkzOUMxMy4wNjU4LDMwLjA1MzYgMTMuMDY1OCwzMi41ODI0IDExLjUwNjEsMzQuMTQyMUM5Ljk0NjM4LDM1LjcwMTkgNy40MTc1OCwzNS43MDE5IDUuODU3ODYsMzQuMTQyMUM0LjI5ODE1LDMyLjU4MjQgNC4yOTgxNSwzMC4wNTM2IDUuODU3ODYsMjguNDkzOVoiIHN0eWxlPSJmaWxsOnJnYigxNjQsMTY0LDE2NCk7Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxnPgogICAgICAgICAgICA8cGF0aCBkPSJNMzYuMDA2MSwxNi4wMDYxQzM4LjIxMTksMTYuMDA2MSA0MCwxNy43OTQyIDQwLDIwQzQwLDIyLjIwNTggMzguMjExOSwyMy45OTM5IDM2LjAwNjEsMjMuOTkzOUMzMy44MDAzLDIzLjk5MzkgMzIuMDEyMiwyMi4yMDU4IDMyLjAxMjIsMjBDMzIuMDEyMiwxNy43OTQyIDMzLjgwMDMsMTYuMDA2MSAzNi4wMDYxLDE2LjAwNjFaIiBzdHlsZT0iZmlsbDpyZ2IoNzQsNzQsNzQpOyIvPgogICAgICAgIDwvZz4KICAgICAgICA8Zz4KICAgICAgICAgICAgPHBhdGggZD0iTTI4LjQ5MzksNS44NTc4NkMzMC4wNTM2LDQuMjk4MTUgMzIuNTgyNCw0LjI5ODE1IDM0LjE0MjEsNS44NTc4NkMzNS43MDE5LDcuNDE3NTggMzUuNzAxOSw5Ljk0NjM4IDM0LjE0MjEsMTEuNTA2MUMzMi41ODI0LDEzLjA2NTggMzAuMDUzNiwxMy4wNjU4IDI4LjQ5MzksMTEuNTA2MUMyNi45MzQyLDkuOTQ2MzggMjYuOTM0Miw3LjQxNzU4IDI4LjQ5MzksNS44NTc4NloiIHN0eWxlPSJmaWxsOnJnYig1MCw1MCw1MCk7Ii8+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4K",
  }),
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
    closeDialog() {
      this.$emit("closeEnrollment", false);
      setTimeout(() => (this.step = 1), 500);
    },
    openProfilesManagementDialog() {
      this.showProfilesManagementDialog = true;
    },
    closeProfilesManagementDialog() {
      this.showProfilesManagementDialog = false;
    },
    saveAndClose() {
      this.createDevice();
      this.$emit("closeEnrollment", false);
      setTimeout(() => (this.step = 1), 500);
    },
    setStep(step, name) {
      this.currentFlow = name;
      this.step = step;
    },
    setStep3(conf) {
      this.currentOsSubset = conf.subset;
      this.step = 3;
    },
    downloadFile(conf) {
      const downloadLink = document.createElement("a");
      const fileName = conf.filename;
      downloadLink.href = conf.url;
      downloadLink.download = fileName;
      downloadLink.click();
    },
    applyAction(conf) {
      switch (conf.type) {
        case "json":
          this.copyToClipboard(conf.payload);
          break;
        case "link":
        case "request":
          this.openLink(conf.url);
          break;
        case "file":
          this.downloadFile(conf);
          break;
        case "alert":
          /*EventBus.$emit("showSnackbar", {
            message: "ENROLLMENTHELP_MANUAL_DEPLOYMENT",
            color: "info",
          });*/
          break;
        case "dialog":
          this.profilesManagementPayload = {}; // TODO: add call to fetch data
          this.openProfilesManagementDialog();
          break;
        default:
          console.log("Unsupported type: " + conf.type);
      }
    },
    isImage(image) {
      return /[\/.](gif|jpg|jpeg|tiff|png|webp|avif|svg)$/i.test(image);
    },
    isUrl(url) {
      return /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(
        url
      );
    },
    getOsIcon(os) {
      for (const osIcon of this.osIcons) {
        if (osIcon.name === os) {
          return osIcon.value;
        }
      }
    },
    async copyToClipboard(mytext) {
      try {
        await navigator.clipboard.writeText(
          this.isUrl(mytext) ? mytext : JSON.stringify(mytext)
        );
        E/*ventBus.$emit("showSnackbar", {
          message: "SNACKBAR_PAYLOAD_COPIED",
          color: "info",
        });*/
      } catch (e) {
       /* EventBus.$emit("showSnackbar", {
          message: "SNACKBAR_PAYLOAD_NOT_COPIED",
          color: "error",
        });*/
      }
    },
    async openLink(url) {
      window.open(url);
    },
    async createDevice() {
      this.loading = true;
      console.log("device enrolling...");
      // try {
      //   const response = await axios.post(
      //     process.env.VUE_APP_BASEURL + "/api/uem/device/create",
      //     {
      //       params: {
      //         deviceDetails: this.device.deviceDetails,
      //         parentDeviceId: this.device.parentDeviceId,
      //         deviceName: this.device.deviceName,
      //         modelName: this.device.modelName,
      //         macAddress: this.device.macAddress,
      //         meid: this.device.meid,
      //         udid: this.device.udid,
      //         vendorId: this.device.vendorId,
      //         osArchitecture: this.device.osArchitecture,
      //         osType: this.device.osType,
      //         abbinationCode: this.device.abbinationCode,
      //         serialNumber: this.device.serialNumber,
      //         imei: this.device.imei,
      //         isDeleted: this.device.isDeleted,
      //         phoneNumber: this.device.phoneNumber,
      //         assignedLicense: this.device.assignedLicense,
      //         isAndroidOem: this.device.isAndroidOem,
      //         isOnline: this.device.isOnline,
      //         brand: this.device.brand,
      //         hasAndroidPlayServices: this.device.hasAndroidPlayServices,
      //         agentFlavor: this.device.agentFlavor,
      //         windowsAgentVersion: this.device.windowsAgentVersion,
      //         configuration: this.device.configuration,
      //         deviceEntity: this.device.deviceEntity,
      //       },
      //     }
      //   );
      //   if (response.data.success) {
      //   } else {
      //     throw new Error("Cannot find devices");
      //   }
      // } catch (error) {
      //   console.log(error);
      //   this.devices = [];
      //   this.totalDevices = 0;
      // } finally {
      //   this.loading = false;
      // }
      this.loading = false;
    },
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen']),

    disabled () {
      return this.e1 === 1 ? 'prev' : this.e1 === this.step ? 'next' : undefined
    },
  },
};
</script>

<style lang="scss" scoped>
.icon_enroll{
  font-size: calc(40vw / 3);
  color: rgb(0, 118, 253);
  border: 1px solid #d3d3d3;
  margin: 20px;
  padding: 100px;
  border-radius: 30px;
  background-color: #d3d3d3;
}

.row {
  height: 100%;
  .group {
    display: flex;
    flex: 1;
    justify-content: space-around;
    align-items: center;

    button.v-icon.humongousIcons {
      font-size: calc(40vw / 3);
      &:hover {
        color: #fff;
      }
    }
  }
  .subGroup {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
  }
}

.osChoiceContainer {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 2rem;
}

.singleChoiceContainer {
  display: flex;
  justify-content: center;
  align-items: center;

  .cardConf {
    max-width: calc(60vw / 3);
  }
}
.confChoiceContainer {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 2rem;
  align-items: center;
  .cardConf {
    height: 8rem;
  }
}
.cardConf {
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  min-height: 8rem;

  &__label {
    flex: 1 1 auto;
  }
  &__image {
    min-width: 2rem;
  }
}

.cardConf:has(> .qr) {
  height: 100%;
  background-color: #fff;
}
.qr {
  background-color: #fff;
}

.cardConf__image {
  display: block;
  max-width: 3rem;
}
:deep(.cardConf__image .v-image__image.v-image__image--cover) {
  background-size: 3rem 3rem;
}

.cardConf__image ~ .cardConf__label {
  flex: 0 1 auto;
}
.v-card {
  & > .cardConf__image:first-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
  & > .qr:first-child:not(.v-btn):not(.v-chip):not(.v-avatar) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
