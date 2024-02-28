<template>
  <div>
    <div class="d-flex justify-center hover-center" v-if="loadingItems">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
    <v-btn
      fab elevation="2"
      x-small
      style="position: absolute"
      class="clear-filter-button"
      v-if="numSelectedDaysFilters > 0"
      color="red"
      @click="removeSelectedDaysFilters()"
    >
      <v-icon>
        mdi-close-box-outline
      </v-icon>
    </v-btn>
    <div id="EventsChart"
         :class="{divHovered: loadingItems, heightFor2k: windowHeight > 1000, heightForFHD: windowHeight < 1000}"></div>
  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import dateService from "@/globalServices/dateService";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import {toRaw} from "vue";

export default {
  name: "EventsChart",
  data: () => ({
    chartroot: undefined,
    chart: undefined,
    xAxis: undefined,
    yAxis: undefined,
    loadingItems: false,
    osVersionFilter: undefined,
    osTypeFilter: undefined,
    periodFilter: undefined,
    clientsFilter: undefined,
    criticSeries: undefined,
    highSeries: undefined,
    mediumSeries: undefined,
    lowSeries: undefined,
    criticalityFilter: undefined,
    eventTypesFilter: undefined,
    serialNumbersFilter: undefined,
    cursor: undefined,
    data: [],
    selectedDays: {},
    numSelectedDaysFilters: 0,
    chartTitle: undefined,
    queueForCalls: [],
    queueClearedOutsideFetcher: false // flag used to check if queue is cleared outside fetcher function
  }),
  props: {
    fetcher: {
      type: Function,
      default: () => {
      }
    },
    bus: {
      type: Object,
      default: () => {
      }
    },
    windowHeight: {
      type: Number,
    }
  },
  mounted() {
    this.setPeriodFilterToLastWeek();
    this.renderChart();
    //FILTERS
    this.bus.on("clientsSelected", (clientsSelected) => {
      if (Object.keys(this.selectedDays).length > 0)
        this.removeSelectedDaysFilters(true)
      this.clientsFilter = clientsSelected;
      this.clearFilters();
      this.pushInQueue();

    })
    this.bus.on("osVersionFilter", (osVersionFilter) => {
      this.osVersionFilter = osVersionFilter
      if (Object.keys(this.selectedDays).length === 0)
        this.pushInQueue();
    });
    this.bus.on("osTypeFilter", (osTypeFilter) => {
      this.osTypeFilter = osTypeFilter
      if (Object.keys(this.selectedDays).length === 0)
        this.pushInQueue();
    });
    this.bus.on("removeOsFilters", () => {
      this.osTypeFilter = undefined;
      this.osVersionFilter = undefined;
      if (Object.keys(this.selectedDays).length === 0)
        this.pushInQueue();
    });
    this.bus.on("criticalityFilter", (criticalityFilter) => {
      this.criticalityFilter = criticalityFilter
      if (Object.keys(this.selectedDays).length === 0)
        this.pushInQueue();
    });
    this.bus.on("periodFilter", (periodFilter) => {
      this.periodFilter = periodFilter
      if (!!this.clientsFilter) {
        this.pushInQueue();
        if (this.numSelectedDaysFilters > 0)
          this.removeSelectedDaysFilters()
      }
    });
    this.bus.on("globalFilters", (globalFilters) => {
      this.eventTypesFilter = globalFilters.eventTypesFilter;
      this.serialNumbersFilter = globalFilters.serialNumbersFilter;
      if (Object.keys(this.selectedDays).length === 0)
        this.pushInQueue();
    });
  },
  methods: {
    renderChart() {
      this.chartroot = am5.Root.new("EventsChart");
      //this.chartroot._logo.dispose();
      toRaw(this.chartroot).setThemes([
        am5themes_Animated.new(toRaw(this.chartroot))
      ]);
      this.chart = toRaw(this.chartroot).container.children.push(
        am5xy.XYChart.new(toRaw(this.chartroot), {
          wheelX: "panX",
          wheelY: "zoomX",
        })
      );
      this.xAxis = toRaw(this.chart).xAxes.push(am5xy.GaplessDateAxis.new(toRaw(this.chartroot), {
        groupData: false,
        baseInterval: {
          timeUnit: "day",
          count: 1
        },
        renderer: am5xy.AxisRendererX.new(toRaw(this.chartroot), {
          minGridDistance: 50
        }),
        dateFormats: {
          "day": {timezone: dateService.getIsoCountryCode(this.languageChosen), day: '2-digit', month: '2-digit'}
        },
        periodChangeDateFormats: {
          "day": {timezone: dateService.getIsoCountryCode(this.languageChosen), day: '2-digit', month: '2-digit'}
        },
        tooltipDateFormat: {
          timezone: dateService.getIsoCountryCode(this.languageChosen)
        },
        tooltip: am5.Tooltip.new(toRaw(this.chartroot), {}),
      }));

      this.yAxis = toRaw(this.chart).yAxes.push(am5xy.ValueAxis.new(toRaw(this.chartroot), {
        renderer: am5xy.AxisRendererY.new(toRaw(this.chartroot), {}),
      }));

      this.cursor = toRaw(this.chart).set("cursor", am5xy.XYCursor.new(toRaw(this.chartroot), {
        xAxis: toRaw(this.xAxis),
      }));
      toRaw(this.cursor).lineY.set("visible", false);

      let yRenderer = toRaw(this.yAxis).get("renderer");
      yRenderer.labels.template.set('fill', am5.color("#FFFFFF"));

      let xRenderer = toRaw(this.xAxis).get("renderer");
      xRenderer.labels.template.set('fill', am5.color("#FFFFFF"));

      this.lowSeries = this.createSeries(this.getTranslation('LOW'), "low");
      this.mediumSeries = this.createSeries(this.getTranslation('MEDIUM'), "medium");
      this.highSeries = this.createSeries(this.getTranslation('HIGH'), "high");
      this.criticSeries = this.createSeries(this.getTranslation('CRITICAL'), "critic");

      toRaw(this.chart).plotContainer.events.on("click", () => {
        this.chartClicked();
      })
    },
    createSeries(name, field) {
      let series = toRaw(this.chart).series.push(am5xy.LineSeries.new(toRaw(this.chartroot), {
        name: name,
        xAxis: toRaw(this.xAxis),
        yAxis: toRaw(this.yAxis),
        stacked: true,
        valueYField: field,
        valueXField: "date",
        tooltip: am5.Tooltip.new(toRaw(this.chartroot), {
          pointerOrientation: "horizontal",
          labelText: "{name}: {valueY}"
        }),
        fill: am5.color(this.getColorSeverity(field)),
      }));

      series.fills.template.setAll({
        fillOpacity: 0.7,
        visible: true,
      });
      return series;
    },
    getColorSeverity(nameField) {
      if (nameField === 'critic') return "#b60000";
      else if (nameField === 'high') return "#f02929";
      else if (nameField === 'medium') return "#f27516";
      else if (nameField === 'low') return "#fec601";
      else return "";
    },
    pushInQueue() {
      this.queueForCalls.push({
        clientIds: this.clientsFilter.map((el) => el.id),
        groupBy: ['eventsPerDayPerCriticality'],
        withDevice: true,
        deviceOsVersion: this.osVersionFilter,
        deviceOsType: this.osTypeFilter,
        period: this.periodFilter,
        criticality: this.criticalityFilter,
        eventTypes: this.eventTypesFilter,
        serialNumbers: this.serialNumbersFilter,
        orderBy: ['detectionDate', 'asc'],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      if (!this.loadingItems)
        this.getData(this.queueForCalls.pop())
    },
    getData(filters) {
      this.loadingItems = true;
      this.fetcher(filters).then((items) => {
        if (this.queueForCalls.length > 0) {
          this.getData(this.queueForCalls.pop());
          this.queueForCalls = [];
        } else {
          this.data = [];
          if (items === 'DONT_CALL_SERVER') {
            [].forEach(([key, value]) => {
              let obj = {}
              let date = new Date(key);
              obj.date = date.getTime();
              obj.critic = !!value.critic ? value.critic : 0;
              obj.high = !!value.high ? value.high : 0;
              obj.medium = !!value.medium ? value.medium : 0;
              obj.low = !!value.low ? value.low : 0;
              this.data.push(obj);
            });
          } else {
            Object.entries(items.rows).forEach(([key, value]) => {
              let obj = {}
              let date = new Date(key);
              obj.date = date.getTime();
              obj.critic = !!value.critic ? value.critic : 0;
              obj.high = !!value.high ? value.high : 0;
              obj.medium = !!value.medium ? value.medium : 0;
              obj.low = !!value.low ? value.low : 0;
              this.data.push(obj);
            });
          }
          //this.data.sort((a, b) => a.date - b.date); no need of it with order by ascending, KEEP COMMENT
          this.updateDataSeries();
          setTimeout(() => toRaw(this.chart).zoomOut(), 250);
          this.loadingItems = false
        }
      })
        .catch((e) => {
          console.log(e.message);
          this.loadingItems = false;
        });
    },
    updateDataSeries() {
      toRaw(this.criticSeries).data.setAll(this.data);
      toRaw(this.highSeries).data.setAll(this.data);
      toRaw(this.mediumSeries).data.setAll(this.data);
      toRaw(this.lowSeries).data.setAll(this.data);
    },
    chartClicked() {
      let positionX = toRaw(this.cursor).getPrivate('positionX');
      let dateFilter = toRaw(this.xAxis).positionToDate(toRaw(this.xAxis).toAxisPosition(positionX));
      console.log(dateFilter)
      dateFilter.setHours(12, 0, 0);
      let rangeDataItem = toRaw(this.xAxis).makeDataItem({
        value: dateFilter.getTime(),
      });
      if (!this.selectedDays[dateFilter.toISOString().substring(0, 10)]) {
        console.log('aggiungo')
        this.selectedDays[dateFilter.toISOString().substring(0, 10)] = rangeDataItem;
        toRaw(this.xAxis).createAxisRange(rangeDataItem);
        rangeDataItem.get("grid").setAll({
          stroke: am5.color("#FFFFFF"),
          strokeOpacity: 3,
          strokeWidth: 3,
          strokeDasharray: [3]
        });
        rangeDataItem.get("label").setAll({
          fill: am5.color(0xffffff),
          text: dateFilter.toISOString().substring(5, 10),
          rotation: 90,
          centerX: am5.p100,
          centerY: am5.p100,
          paddingBottom: 5,
          paddingRight: 275,
          position: 0,
          inside: true,
        });
        this.numSelectedDaysFilters++;
      } else {
        toRaw(this.xAxis).axisRanges.removeValue(toRaw(this.selectedDays[dateFilter.toISOString().substring(0, 10)]))
        delete this.selectedDays[dateFilter.toISOString().substring(0, 10)];
        this.numSelectedDaysFilters--;
        if (this.numSelectedDaysFilters === 0) {
          this.bus.emit('selectedDaysFilter', undefined);
          this.pushInQueue();
        }

      }
      this.bus.emit('selectedDaysFilter', Object.keys(this.selectedDays));
    },
    removeSelectedDaysFilters(clientChanged = false) {
      Object.keys(this.selectedDays).forEach((key) => {
        toRaw(this.xAxis).axisRanges.removeValue(toRaw(this.selectedDays[key]))
        delete this.selectedDays[key];
        this.numSelectedDaysFilters--;
      });
      if (!clientChanged) {
        this.bus.emit('selectedDaysFilter', undefined);
      }
      this.pushInQueue();
    },
    clearFilters() {
      this.osVersionFilter = null;
      this.osTypeFilter = null;
      this.eventTypesFilter = null;
      this.serialNumbersFilter = null;
      this.criticalityFilter = null;
    },
    setPeriodFilterToLastWeek() {
      this.periodFilter = dateService.setPeriodComponentToLastWeek();
    },
    /**
     * Translates the key with the language chosen
     * @param {string} key key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      return translateService.getTranslation(this.languageChosen, key);
    },
  },
  watch: {
    languageChosen() {
      this.lowSeries.set('name', this.getTranslation('LOW'));
      this.mediumSeries.set('name', this.getTranslation('MEDIUM'));
      this.highSeries.set('name', this.getTranslation('HIGH'));
      this.criticSeries.set('name', this.getTranslation('CRITICAL'));
      toRaw(this.xAxis).setAll({
        dateFormats: {
          "day": {timezone: dateService.getIsoCountryCode(this.languageChosen), day: '2-digit', month: '2-digit'}
        },
        periodChangeDateFormats: {
          "day": {timezone: dateService.getIsoCountryCode(this.languageChosen), day: '2-digit', month: '2-digit'}
        },
        tooltipDateFormat: {
          timezone: dateService.getIsoCountryCode(this.languageChosen)
        },
      });
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style lang="scss" scoped>

.heightFor2k {
  height: 38vh;
}

.heightForFHD {
  height: 390px;
}

.hover-center {
  z-index: 10;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
}

.clear-filter-button {
  z-index: 5;
  top: 45px;
  left: 70px;
}

.divHovered {
  opacity: 0.2;
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

</style>

