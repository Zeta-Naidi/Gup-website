<template>
  <div class="py-1">
    <v-range-slider
      v-model="rangeSelected"
      color="primary"
      min="0"
      max="59"
      hide-details="auto"
      step="1"
      thumb-size="20"
      show-ticks="always"
      :thumb-size="thumbSize"
      :thumb-label="true"
      validate-on="blur"
      ref="rangeSlider"
      @end="endDrag"
      @start="$emit('enlargeFatherDivHeight'); thumbSize = 52"
    >
      <template v-slot:thumb-label="{modelValue}">
        <div v-if="thumbSize > 0">
          {{ showLabelIcon(modelValue) }}
        </div>
      </template>
      <template v-slot:prepend>
        <div style="min-width:80px !important;">
          <div class="d-flex justify-center">
            {{ getTranslation('FROM') }}
          </div>
          <div class="d-flex justify-center" v-if="from">
            {{ from.toLocaleDateString(getIsoCountryCode(languageChosen), $vuetify.display.xs || $vuetify.display.sm ? optionsFormatDateMobile : optionsFormatDateDesktop ) }}
          </div>
        </div>
      </template>
      <template v-slot:append>
        <div style="min-width:80px !important;">
          <div class="d-flex justify-center">
            {{ getTranslation('TO') }}
          </div>
          <div class="d-flex justify-center" v-if="to">
            {{ to.toLocaleDateString(getIsoCountryCode(languageChosen),$vuetify.display.xs || $vuetify.display.sm ? optionsFormatDateMobile : optionsFormatDateDesktop) }}
          </div>
        </div>
      </template>
    </v-range-slider>
  </div>
</template>
<script>

import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "RangePeriodSlider",
  data() {
    return {
      rangeSelected: [53, 59],
      today: new Date(),
      fromDateDisplayed: '',
      toDateDisplayed: '',
      thumbSize: 0,
      from: null,
      to: null,
      optionsFormatDateDesktop: {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      },
      optionsFormatDateMobile: {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        month: "2-digit",
        day: "2-digit",
      },
    };
  },
  props: {
    propsFrom: {},
    propsTo: {},
    bus: {
      type: Object,
      default: () => {
      }
    }
  },
  created() {
    this.newRange();
  },
  methods: {
    newRange() {
      this.from = new Date();
      this.to = new Date();
      this.from.setDate(this.from.getDate() - (59 - this.rangeSelected[0]));
      this.from.setHours(0,0,0);
      this.to.setDate(this.to.getDate() - (59 - this.rangeSelected[1]));
      this.to.setHours(23,59,59,59);

      this.bus.emit('periodFilter', {
        from: (() => {
          const date = this.from.toISOString().split('T')[0];
          const time = this.from.toISOString().split('T')[1].substring(0,8);
          return `${date} ${time}`
        })(),
        to: (() => {
          const date = this.to.toISOString().split('T')[0];
          const time = this.to.toISOString().split('T')[1].substring(0,8);
          return `${date} ${time}`
        })(),
        numberOfDaysSelected: (this.rangeSelected[1] - this.rangeSelected[0] + 1),
        fromUtcString: this.from.toISOString(),
        toUtcString: this.to.toISOString(),
      })
    },
    showLabelIcon(daysToSubtract) {
      let date = new Date();
      date.setDate(date.getDate() - (59 - daysToSubtract));
      let dateArray = date.toISOString().substring(0, 10).split('');
      return '' + dateArray[8] + dateArray[9] + '/' +
        dateArray[5] + dateArray[6] + '/' +
        dateArray[2] + dateArray[3];
    },
    /**
     * Translates the key with the language chosen
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      return translateService.getTranslation(this.languageChosen, key);
    },
    endDrag() {
      this.newRange();
      this.$emit('reduceFatherDivHeight');
      this.thumbSize = 0;
      this.$nextTick(() => {
        const thumbs = document.getElementsByClassName('v-slider-thumb');
        const first = thumbs[0];
        const second = thumbs[1];
        first.blur()
        second.blur();
      })
    },
    getIsoCountryCode(language){
      return dateService.getIsoCountryCode(language);
    }
  },
  watch: {
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>
<style>
.v-slider-thumb__label{
  height: 50px !important;
}
</style>
