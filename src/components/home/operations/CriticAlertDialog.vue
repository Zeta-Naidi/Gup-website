<template>
  <v-dialog v-model="localValue" persistent
            max-width="800">
    <v-card style="border-color: red; border-style: solid"
    >
      <v-card-title>
        <v-alert
          dense
          icon="mdi-alert"
          outlined
          prominent
          type="error"
          style="width: 100%"
        >
          {{ getTranslation('CRITICAL_EVENTS_DETECTED') }}
        </v-alert>
      </v-card-title>
      <v-card-text>
        <v-slide-group
          v-model="model"
          mandatory
          show-arrows
          center-active
          aria-valuemax="280"
          @click:next="nextClicked"
          @click:prev="prevClicked"
        >
          <v-slide-group-item
            v-for="(item, index) in items"
            :key="index"
            v-slot="{ active, toggle }"
          >
            <v-card
              :color="active ? 'red lighten-1' : 'grey lighten-1'"
              :class="{'ma-4': true, 'card-selected': !!active}"
              height="150"
              width="250"
              @click="toggle"
            >
              <div class="mt-3">
                <div style="text-align: center"><v-icon>mdi-alert-octagram-outline</v-icon></div>
                <div style="font-size: 18px; font-weight: bold; text-align: center" class="d-flex justify-center">
                  <div>{{ getTranslation('NEW_EVENT_WITH_ID') + item.id }}</div>
                </div>
              </div>
              <div style="text-align: center">
                <div style="text-align: center; font-size: 16px;">{{
                    getTranslation('TOTAL_SCORE') + ': ' + item.score
                  }}
                </div>
                <div style=" font-size: 16px;">{{
                    getTranslation('AT') + ': ' + getDateString(item.detectionDate)
                  }}
                </div>
              </div>
            </v-card>
          </v-slide-group-item>
        </v-slide-group>

        <v-expand-transition>
          <v-sheet
            v-if="model != null"
            min-height="200"
            tile
          >
            <v-row class="px-5">
              <v-col cols="6">
                <v-text-field
                  :value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].deviceSerialNumber : ''"
                  :label="getTranslation('SERIAL')"
                  outlined
                  hide-details="auto"
                  readonly
                >
                  <template v-slot:prepend>
                    <v-icon v-if="!!items[model]?.device?.osType" :color="getColorIconOsType(items[model].device.osType)">
                      {{ getNameIconOsType(items[model].device.osType) }}
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.companyName : ''"
                  :label="getTranslation('CLIENT')"
                  prepend-icon="mdi-domain"
                  outlined
                  hide-details="auto"
                  readonly
                />
              </v-col>
            </v-row>
            <v-row class="px-5">
              <v-col cols="6">
                <v-text-field
                  :value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.phone : ''"
                  :label="getTranslation('PHONE_NUMBER')"
                  prepend-icon="mdi-phone"
                  outlined
                  hide-details="auto"
                  readonly
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  :value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.email : ''"
                  label="Email"
                  prepend-icon="mdi-email-outline"
                  outlined
                  hide-details="auto"
                  readonly
                />
              </v-col>
            </v-row>
            <div class="text-subtitle-1 px-5 mt-3">
              <v-textarea
                :value="
                  (!!items[model] && !!items[model].description) ? getTranslation(items[model].description) : ''"
                outlined
                :label="getTranslation('DESCRIPTION')"
                rows="3"
                readonly
                hide-details="auto"
              >
              </v-textarea>
            </div>
            <div class="text-subtitle-1 px-5 mt-3" v-if="(!!items[model] && !!items[model].remediationAction)">
              <v-textarea
                :value="getTranslation(items[model].remediationAction)"
                outlined
                :label="getTranslation('REMEDIATION_ACTION')"
                rows="2"
                readonly
              >
              </v-textarea>
            </div>
          </v-sheet>
        </v-expand-transition>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <div class="d-flex justify-end align-center" v-if="!!items[model]">
          <v-btn class="mr-2" color="red" @click="$emit('close')">{{ getTranslation('CLOSE') }}</v-btn>
          <v-btn
            v-if="!items[model].hasBeenSolved && items[model].remediationAction && !items[model].remediationActionStarted"
            color="primary"
            @click.stop="$emit('resolveEvent',items[model])"
          >
            {{ getTranslation('REPAIR') }}
          </v-btn>
          <v-btn
            dense
            @click="$emit('manualRepair',items[model])"
            v-else-if="!items[model].hasBeenSolved && !items[model].remediationAction"
          >
            {{ getTranslation('MANUAL_REPAIR') }}
          </v-btn>
          <v-btn
            v-else-if="!items[model].hasBeenSolved && !!items[model].remediationActionStarted"
            dense
            color="orange"
            @click.stop=""
          >
            {{ getTranslation('COMMAND_SENT') }}
          </v-btn>
          <v-btn
            v-else
            dense
            color="green"
            @click.stop=""
          >
            {{ getTranslation('REPAIRED') }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import deviceService from "@/globalServices/deviceService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "CriticAlertDialog",
  data: () => ({
    localValue: undefined,
    model: 0,
  }),
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    }
  },
  mounted() {
    this.localValue = this.value;
  },
  methods: {
    nextClicked() {
      this.model++
    },
    prevClicked() {
      this.model--;
    },
    /**
     * Translates the key with the language chosen, return key only for description case, if is not found in the translations
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    resolveEvent(item) {
      item.remediated = true;
      this.$emit('resolveEvent', item);
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
    getDateString(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen)
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>

</style>
