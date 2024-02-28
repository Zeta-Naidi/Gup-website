<template>
  <v-dialog
    v-model="localValue"
    persistent
    max-width="800"
  >
    <v-card style="border-color: #63adf2; border-style: solid" border>
      <v-card-title>
        <v-alert
          dense
          icon="mdi-information-outline"
          outlined
          prominent
          color="primary"
          type="info"
          style="width: 100%"
        >
          {{ getTranslation('EVENTS_LIST') }}
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
          @change="cardClicked"
          :class="{'no-transition': this.loadingItems}"
        >
          <v-slide-group-item
            v-for="(item, index) in items"
            :key="index"
            v-slot="{ active, toggle }"
          >
            <v-card
              :color="getColorSeverity(item.score)"
              :class="{'ma-4': true, 'card-selected': !!active}"
              height="150"
              width="250"
              @click="toggle"
            >
              <div class="mt-3">
                <div style="text-align: center">
                  <v-icon>{{ getIconBySeverity(item.score) }}</v-icon>
                </div>
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
        <v-sheet
          v-if="model != null"
          min-height="200"
          tile
        >
          <v-row class="px-5">
            <v-col cols="6">
              <v-text-field
                :model-value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].deviceSerialNumber : ''"
                :label="getTranslation('SERIAL')"
                outlined
                hide-details="auto"
                readonly
              >
                <template v-slot:prepend>
                  <v-icon v-if="!!items[model] && !!items[model].osType"
                          :color="getColorIconOsType(items[model].osType)">
                    {{ getNameIconOsType(items[model].osType) }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                :model-value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.companyName : ''"
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
                :model-value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.phone : ''"
                :label="getTranslation('PHONE_NUMBER')"
                prepend-icon="mdi-phone"
                outlined
                hide-details="auto"
                readonly
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :model-value="(!!items[model] && !!items[model].deviceSerialNumber) ? items[model].client.email : ''"
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
              :model-value="
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
              :model-value="getTranslation(items[model].remediationAction)"
              outlined
              :label="getTranslation('REMEDIATION_ACTION')"
              rows="2"
              readonly
            >
            </v-textarea>
          </div>
        </v-sheet>
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
import translateService from '@/globalServices/translate'
import dateService from "@/globalServices/dateService";
import deviceService from "@/globalServices/deviceService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "DetailEventDialogOperations",
  data: () => ({
    localValue: undefined,
    model: 0,
    loadingItems: false,
  }),
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
    indexItemSelected: {
      type: Number,
      default: 0,
    },
    newItemsInserted: {
      type: Array,
      default: () => [],
    }
  },
  mounted() {
  },
  methods: {
    nextClicked() {
      this.model++
      this.items[this.model].checked = true;
    },
    prevClicked() {
      this.model--;
      this.items[this.model].checked = true;
    },
    cardClicked(index) {
      this.items[index].checked = true;
    },
    resolveEvent(item) {
      item.remediated = true;
      this.$emit('resolveEvent', item);
    },
    /**
     * Return the color associated with the severity score
     * @param {Number} score
     */
    getColorSeverity(score) {
      if (Number(score) > 9.0) return "#b60000";
      else if (Number(score) >= 7.0 && Number(score) <= 9.0) return "#f02929";
      else if (Number(score) >= 4.0 && Number(score) < 7.0) return "#f27516";
      else if (Number(score) < 4.0) return "#fec601";
      else return "";
    },
    getIconBySeverity(score) {
      if (Number(score) > 9.0) return "mdi-alert-octagram-outline";
      else if (Number(score) >= 7.0 && Number(score) <= 9.0) return "mdi-alert-outline";
      else if (Number(score) >= 4.0 && Number(score) < 7.0) return "mdi-alert-box-outline";
      else if (Number(score) < 4.0) return "mdi-information-outline";
      else return "";
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
    getDateString(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen)
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
      console.log(this.localValue, this.indexItemSelected)
      if (!!this.localValue) {
        this.model = this.indexItemSelected;
        this.items[this.indexItemSelected].checked = true;
      }
    },
    newItemsInserted(newVal) {
      console.log(newVal)
      this.loadingItems = true;
      setTimeout(() => this.loadingItems = false, 1000);
      this.model += newVal.length;
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style>
.card-selected {
  border-style: solid;
  border-color: deepskyblue !important;
  border-width: 5px;
}
</style>
<style lang="scss" scoped>
:deep(.no-transition) {
  .v-slide-group__content {
    transition: none;
  }
}

$colors: #8cc271, #69beeb, #f5aa39, #e9643b;
.cube {
  width: 20px;
  height: 20px;
  margin-right: 10px;

  @for $i from 1 through length($colors) {
    &:nth-child(#{$i}) {
      background-color: nth($colors, $i);
    }
  }

  &:first-child {
    animation: left 1s infinite;
  }

  &:last-child {
    animation: right 1s infinite 0.5s;
  }
}

// -----------------------------------------------------

@keyframes left {
  40% {
    transform: translateX(-60px);
  }
  50% {
    transform: translateX(0);
  }
}

@keyframes right {
  40% {
    transform: translateX(65px);
  }
  50% {
    transform: translateX(0);
  }
}

.hover-center {
  z-index: 10;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
}

.divHovered {
  opacity: 0.2;
}

</style>
