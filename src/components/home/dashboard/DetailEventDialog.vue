<template>
  <div>
    <v-dialog
      v-model="localValue"
      :persistent="true"
      max-width="40%"
      :retain-focus="!openDrawer"
    >
      <v-card style="border-color: #63adf2; border-style: solid;"  v-if="!!eventChosen">
        <v-card-title>
          <v-alert
            dense
            icon="mdi-information"
            variant="outlined"
            type="info"
            color="primary"
            style="width: 100%"
          >
            {{ getTranslation('DETAIL') }}
          </v-alert>
        </v-card-title>
        <v-card-text style="max-height: 60vh; overflow-y: scroll">
          <v-skeleton-loader
            v-if="waitForNewEvent"
            class="pt-5 mx-5"
            elevation="12"
            max-width="90%"
            type="table-heading, list-item-two-line, image, table-tfoot"
          ></v-skeleton-loader>
          <v-container v-if="!waitForNewEvent">
            <v-row>
              <v-col
                cols="12"
                v-if="!!eventChosen.subject"
              >
                <v-text-field
                  :model-value="eventChosen.subject"
                  :label="getTranslation('SUBJECT')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-textarea
                  :model-value="getTranslation(eventChosen.description)"
                  :label="getTranslation('DESCRIPTION')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                  rows="3"
                ></v-textarea>
              </v-col>
              <v-col
                cols="12"
                v-if="!!eventChosen.docs && (!!eventChosen.docs.message || !!eventChosen.docs.urls)"
              >
                <v-textarea
                  :model-value="getTranslation(eventChosen.docs.message) + ' ' + eventChosen.docs.urls"
                  :label="getTranslation('GENERAL_INFO')"
                  rows="3"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-textarea>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  :model-value="getDateString(eventChosen.detectionDate)"
                  :label="getTranslation('DATE')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  :model-value="eventChosen.score"
                  :label="getTranslation('SEVERITY')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
              >
                <v-text-field
                  :model-value="!!eventChosen.deviceName ? eventChosen.deviceName + ' - ' +eventChosen.deviceSerialNumber : eventChosen.deviceSerialNumber"
                  :label="getTranslation('DEVICE')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                >
                  <template v-slot:append>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          style="cursor: pointer"
                          :color="openDrawer ? 'primary' : 'white'"
                          v-bind="attrs"
                          v-on="on"
                          @click.stop="openDrawer = !openDrawer"
                        >
                          mdi-monitor-cellphone-star
                        </v-icon>
                      </template>
                      <span>{{ getTranslation('INSPECT_DEVICE') }}</span>
                    </v-tooltip>
                  </template>
                </v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  :model-value="eventChosen.deviceOsType"
                  :label="getTranslation('OS_TYPE')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                >
                  <template v-slot:prepend-inner>
                    <v-icon :color="getColorIconOsType(eventChosen.deviceOsType)" class="pr-1">
                      {{ getNameIconOsType(eventChosen.deviceOsType) }}
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col
                cols="6"
              >
                <v-text-field
                  :model-value="eventChosen.deviceOsVersion"
                  :label="getTranslation('VERSION')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row class="mt-5">
              <v-col
                cols="12"
              >
                <v-text-field
                  :model-value="eventChosen.companyName"
                  :label="getTranslation('CLIENT')"
                  hide-details="auto"
                  :readonly="true"
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-btn
            :style="{
              'border-color': disablePrevButton ? 'grey' : '#63adf2',
              'border-style': 'solid'
          }"
            @click="$emit('prev'); waitForNewEvent = true"
            :disabled="disablePrevButton || waitForNewEvent"
          >
            <div
              :style="{
              'border-color': disablePrevButton || waitForNewEvent ? 'grey' : '#63adf2'
          }">
              {{ '<' }}
            </div>
          </v-btn>
          <v-btn
            :style="{
              'border-color': disableNextButton ? 'grey' : '#63adf2',
              'border-style': 'solid'
          }"
            @click="$emit('next'); waitForNewEvent = true"
            :disabled="disableNextButton || waitForNewEvent"
          >
            <div
              :style="{
              'border-color': disableNextButton || waitForNewEvent ? 'grey' : '#63adf2'
          }">
              {{ '>' }}
            </div>
          </v-btn>
          <v-spacer></v-spacer>
          <div class="d-flex align-center">
            <v-btn color="red" @click="openDrawer = false; $emit('close')" class="mr-2">
              {{ getTranslation('CLOSE') }}
            </v-btn>
            <v-btn
              v-if="!eventChosen.hasBeenSolved && eventChosen.remediationAction && !eventChosen.remediationActionStarted"
              color="primary"
              @click="$emit('repairEvent', eventChosen)"
            >
              {{ getTranslation('REPAIR') }}
            </v-btn>
            <v-btn
              v-else-if="!eventChosen.hasBeenSolved && !eventChosen.remediationAction && !eventChosen.remediationActionStarted"
              dense
              @click.stop="$emit('redirectToChimpa', eventChosen)"
            >
              {{ getTranslation('MANUAL_REPAIR') }}
            </v-btn>
            <v-btn
              v-else-if="!eventChosen.hasBeenSolved && !!eventChosen.remediationActionStarted"
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
    <DetailDeviceDrawer
      :openDrawer="openDrawer"
      :deviceSerialNumber="deviceSerialNumber"
      :deviceName="deviceName"
      @close="openDrawer = false;"
    />
  </div>
</template>

<script>
import translateService from '@/globalServices/translate'
import axios from "axios";
import dateService from "@/globalServices/dateService";
import DetailDeviceDrawer from "@/components/home/dashboard/DetailDeviceDrawer.vue";
import deviceService from "@/globalServices/deviceService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "DetailEventDialog",
  components: {DetailDeviceDrawer},
  data: () => ({
    localValue: false,
    client: undefined,
    openDrawer: false,
    deviceSerialNumber: undefined,
    deviceName: undefined,
    waitForNewEvent: false,
  }),
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    eventChosen: {
      type: Object,
      default: () => {
      }
    },
    disableNextButton: {
      type: Boolean,
      default: false
    },
    disablePrevButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
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
    getColorIconOsType(value){
      return deviceService.getColorIconOsType(value);
    },
    getNameIconOsType(value){
      return deviceService.getNameIconOsType(value);
    }
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
    eventChosen(newVal) {
      console.log(newVal)
      if (!!newVal) {
        this.deviceSerialNumber = newVal.deviceSerialNumber;
        this.deviceName = newVal.deviceName;
        this.waitForNewEvent = false
      }
    }
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style>
</style>
