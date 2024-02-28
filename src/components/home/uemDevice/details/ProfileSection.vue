<template>
  <v-container fluid>
    <v-row v-if="profiles">
      <v-col cols="12">
        <h3>
          {{ labels?.title && getTranslation(languageChosen, labels.title) }}
          {{ currentDevice.deviceName }}
        </h3>
        <v-divider></v-divider>
      </v-col>
      <v-col cols="12">
        <v-list lines="two">
          <v-list-item
            v-for="(profile, index) in profiles"
            :key="profile.PayloadUUID"
            :title="`${profile.PayloadDisplayName} #${index + 1}`"
          >
            <template v-slot:append>
              <v-chip
                style="margin-right: 3vh; background-color: #777; color: white"
                size="large"
                label
              >
                <template v-if="profile.length < 3">
                  <p style="font-weight: 700; font-size: 12px">
                    {{ getTranslation(languageChosen, "EMPTY") }}
                  </p>
                </template>
                <template v-else>
                  <p
                    style="font-weight: 700; font-size: 12px; margin-right: 1vh"
                  >
                    {{ getTranslation(languageChosen, "PAYLOADS") }}:
                    {{ profiles.length }}
                  </p>

                  <template v-for="(elem, index) in profile">
                    <v-icon v-if="index > 1">
                      <v-img :src="elem.icon"></v-img>
                    </v-icon>
                  </template>
                </template>
              </v-chip>

              <p style="padding-right: 3vh">
                {{ profile && profile.datetime }}
              </p>

              <v-icon
                color="primary"
                style="padding-right: 4vh"
                @click.stop="downloadPayload(profile, index)"
                aria-label="Download"
                title="Download"
              >
                fa fa-download
              </v-icon>

              <v-icon
                color="primary"
                style="padding-right: 4vh"
                @click.stop="editPayload(profile, index)"
                aria-label="Duplicate"
                title="Duplicate"
              >
                fa fa-edit
              </v-icon>

              <v-icon
                color="primary"
                @click.stop="deletePayload(profile)"
                aria-label="Delete"
                title="Delete"
              >
                fa fa-trash
              </v-icon>
            </template>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import translateService from "@/globalServices/translate";
  import {useAppStore} from "@/plugins/pinia/app";

  export default {
    name: "ProfileSection",
    props: {
      currentDevice: {
        type: Object,
        required: true,
      },
      labels: {
        type: Object,
        required: false,
      },
    },
    data() {
      return {
        profiles: [],
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
      this.profiles = this.currentDevice.profileListInstalled;
      this.info = this.labels;
      // TODO: add icons and datetime to profile
    },
    mounted() {
      this.profiles = this.currentDevice.profileListInstalled;
    },
    methods: {
      getTranslation(key) {
        let result = translateService.getTranslation(languageChosen, key);
        if (!result) return key;
        else return result;
      },
      // TODO: add deletion mechanism to store
      async deletePayload(item) {
        const result = await this.$root.$confirm(
          this.getTranslation(languageChosen, "DELETE") + "?",
          this.getTranslation(
            languageChosen,
            "DELETE_SELECTED_PAYLOAD_PROFILE"
          ),
          { color: "primary", zIndex: 1016 },
          item
        );
        console.log("result", result, item);
        if (result) {
          this.profiles = this.profiles.filter(
            (profile) => profile.PayloadUUID !== item.payloadUUID
          );

          this.$root.$dialogLoader.start(
            this.getTranslation(languageChosen, "DELETING"),
            { zIndex: 2000 },
            async () => {
              await this.deletePayloadApi(item.payloadUUID);
            },
            true
          );
        }
      },
      // TODO: fix chiamata api per cancellazione profilo
      async deletePayloadApi(payloadUUID) {
        console.log(payloadUUID);
        try {
          const response = await this.axios.post(
            "http://localhost:3000/SOMETHING",
            {
              PayloadUUID: payloadUUID,
            }
          );
          console.log(response.data);
        } catch (e) {
          console -
            error(
              this.getTranslation(languageChosen, "ERROR_DELETING"),
              response
            );
        }
      },
      downloadPayload(item, index) {
        console.log(item, index);
        this.downloadJSON(item, "payload.json");
      },
      downloadJSON(jsonData, filename) {
        const blob = new Blob([JSON.stringify(jsonData)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      editPayload(item, index) {
        // open modal for editing
        console.log(item, index);
        deletePayloadApi(item.payloadUUID);
      },
      deletePayloadApi(payloadUUID) {
        console.log(payloadUUID);
      },
    },
  };
</script>

<style scoped lang="scss"></style>
