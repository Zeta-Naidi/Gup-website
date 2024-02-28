<template>
  <div>
    <div class="d-flex justify-center test" v-if="!itemsLoaded">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
    <div id="SunburstChart"
         :class="{divHovered: !itemsLoaded, heightFor2k: windowHeight > 1000, heightForFHD: windowHeight < 1000}"></div>
  </div>
</template>


<script>
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import dateService from "@/globalServices/dateService";
import {toRaw} from "vue";

export default {
  name: "SunburstChart",
  data: () => ({
    chartroot: undefined,
    series: undefined,
    container: undefined,
    items: [],
    iosItems: [],
    androidItems: [],
    windowsItems: [],
    osxItems: [],
    periodFilter: undefined,
    lastSliceClicked: undefined,
    innerCircle: undefined,
    clientsFilter: undefined,
    sunburstInstance: undefined,
    selectedDaysFilter: undefined,
    eventTypesFilter: undefined,
    serialNumbersFilter: undefined,
    itemsLoaded: true,
    queueForCalls: [],
    legend: undefined,
  }),
  props: {
    bus: {
      type: Object,
      default: () => {
      }
    },
    fetcher: {
      type: Function,
    },
    windowHeight: {
      type: Number,
    },
    selectVersionFromParent: {
      type: String,
    },
  },
  mounted() {
    this.renderChart();
    //setting field for dynamic color in data array
    toRaw(this.series).slices.template.setAll({
      templateField: "sliceSettings",
    });
    //setting cursor to pointer
    toRaw(this.series).nodes.template.setAll({
      cursorOverStyle: "pointer"
    });
    //Manage clicked slices
    toRaw(this.series).slices.template.events.on("click", (ev) => {
      //reset to normal state last slice clicked
      //Inner level
      if (!ev.target.dataItem.dataContext.children) {

        if (!!toRaw(this.lastSliceClicked)) {
          toRaw(this.lastSliceClicked).setAll({
            stroke: "white",
            strokeWidth: 1
          });
          //reclick on slice already selected
          if (toRaw(this.lastSliceClicked).dataItem.dataContext.name === ev.target.dataItem.dataContext.name) {
            this.lastSliceClicked = undefined;
            this.bus.emit('osVersionFilter', undefined);
            this.$emit('selectedVersion', {
              newItems: toRaw(this.series).get('selectedDataItem')
                .get("children")
                .map(child => child.dataContext)
                .sort((a, b) => a.value - b.value),
              selectedVersion: undefined
            });
          }
          //click on another slice
          else {
            this.lastSliceClicked = ev.target
            ev.target.setAll({
              stroke: "white",
              strokeWidth: 5
            });
            this.bus.emit('osVersionFilter', ev.target.dataItem.dataContext.name);
            this.$emit('selectedVersion', {
              newItems: toRaw(this.series).get('selectedDataItem')
                .get("children")
                .map(child => child.dataContext)
                .sort((a, b) => a.value - b.value),
              selectedVersion: ev.target.dataItem.dataContext.name
            });
          }
        } else {
          this.lastSliceClicked = ev.target
          ev.target.setAll({
            stroke: "white",
            strokeWidth: 5
          });
          this.bus.emit('osVersionFilter', ev.target.dataItem.dataContext.name);
          this.$emit('selectedVersion', {
            newItems: toRaw(this.series).get('selectedDataItem')
              .get("children")
              .map(child => child.dataContext)
              .sort((a, b) => a.value - b.value),
            selectedVersion: ev.target.dataItem.dataContext.name
          });
        }
      }
      //Outer level
      else {
        //move out case
        if (!!this.innerCircle) {
          this.innerCircle = undefined;
          this.lastSliceClicked = undefined;
          this.$nextTick(() => {
            this.bus.emit('removeOsFilters');
            this.$emit('selectedVersion', {
              newItems: [],
              selectedVersion: undefined
            });
            this.pushInQueue();
          });
        }
        //move in case
        else {
          this.innerCircle = ev.target.dataItem.dataContext.name;
          this.$nextTick(() => {
            this.bus.emit('osTypeFilter', ev.target.dataItem.dataContext.name.toLowerCase());
            this.$emit('selectedVersion', {
              newItems: toRaw(this.series).get('selectedDataItem')
                .get("children")
                .map(child => child.dataContext)
                .sort((a, b) => a.value - b.value),
              selectedVersion: undefined
            });
          });
        }
      }
    })
    //FILTERS
    this.bus.on("periodFilter", (periodFilter) => {
      this.periodFilter = periodFilter
      if (!!this.clientsFilter)
        this.pushInQueue();
    });
    this.bus.on("clientsSelected", (clientsSelected) => {
      this.clientsFilter = clientsSelected;
      this.clearFilters();
      this.pushInQueue();
    });
    this.bus.on("criticalityFilter", (criticalityFilter) => {
      this.criticalityFilter = criticalityFilter
      this.pushInQueue();
    });
    this.bus.on("selectedDaysFilter", (selectedDaysFilter) => {
      this.selectedDaysFilter = selectedDaysFilter;
      this.pushInQueue();
    });
    this.bus.on("globalFilters", (globalFilters) => {
      this.eventTypesFilter = globalFilters.eventTypesFilter;
      this.serialNumbersFilter = globalFilters.serialNumbersFilter;
      this.pushInQueue();
    });
  },
  methods: {
    setItems(items) {
      //check inner slice selected still present in items list
      let ignoreLastSliceSelected = false;
      if (!!this.innerCircle && !!this.lastSliceClicked) {
        let objOsSelectedToCheck = items.find(el => el.name === this.innerCircle)
        if (!objOsSelectedToCheck.children.find(el => el.name === this.lastSliceClicked.dataItem.dataContext.name)) {
          items.find(el => el.name === this.innerCircle).children = [];
          ignoreLastSliceSelected = true;
        }
      }
      toRaw(this.series).data.setAll([{
        name: "TOTALE",
        sliceSettings: {
          fill: am5.color("#d9dad7"),
        },
        children: items
      }]);

      toRaw(this.series).nodes.each((item) => {
        if (item.children._values[0].dataItem.dataContext.name === "TOTALE")
          item.children._values[0].events.off("click");
      })
      //iF for manage filters change and no more items in slice selected todo da rivedere
      if (this.innerCircle === 'ANDROID' && this.androidItems.length === 0 ||
        this.innerCircle === 'IOS' && this.iosItems.length === 0 ||
        this.innerCircle === 'WINDOWS' && this.windowsItems.length === 0 ||
        this.innerCircle === 'OSX' && this.osxItems.length === 0) {
        this.bus.emit('removeOsFilters');
        this.innerCircle = undefined;
        this.itemsLoaded = true;
        this.pushInQueue();
      }
      if (!!this.innerCircle && !ignoreLastSliceSelected) {
        toRaw(this.series).nodes.each((item) => {
          if (this.innerCircle === item.dataItem.dataContext.name)
            toRaw(this.series).set("selectedDataItem", item.dataItem);
        });
        if (!!this.lastSliceClicked) {
          toRaw(this.series).nodes.each((item) => {
              if (item.children._values[0].dataItem.dataContext.name === toRaw(this.lastSliceClicked).dataItem.dataContext.name) {
                this.lastSliceClicked = item.children._values[0];
                toRaw(this.lastSliceClicked).setAll({
                  stroke: "white",
                  strokeWidth: 5
                });
              }
            }
          )
        }
      } else
        toRaw(this.series).set("selectedDataItem", toRaw(this.series).dataItems[0]);//Needed to expand chart at start
/*      this.container.children.unshift(
        am5hierarchy.BreadcrumbBar.new(this.chartroot, {
          series: this.series
        })
      );*/
      this.$emit('selectedVersion', {
        newItems: !!this.innerCircle ? toRaw(this.series).get('selectedDataItem')
          .get("children")
          .map(child => child.dataContext)
          .filter(el => !!el.osType) // Prevent case only os version is emitted, when from a selected version teh user select filter that makes go to 0 the elements
          .sort((a, b) => a.value - b.value) : [],
        selectedVersion: undefined,
        onlyItems: !!this.innerCircle,
      });
      this.itemsLoaded = true;
    },
    pushInQueue() {
      this.queueForCalls.push({
        withDevice: true,
        clientIds: this.clientsFilter.map((el) => el.id),
        deviceOsType: this.calcFilterOsType(),
        groupBy: ['eventsPerSunburstChart'],
        criticality: this.criticalityFilter,
        period: this.periodFilter,
        selectedDays: this.selectedDaysFilter,
        eventTypes: this.eventTypesFilter,
        serialNumbers: this.serialNumbersFilter,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      if (this.itemsLoaded)
        this.getData(this.queueForCalls.pop())
    },
    getData(filters) {
      this.itemsLoaded = false;
      this.androidItems = [];
      this.iosItems = [];
      this.windowsItems = [];
      this.osxItems = [];
      this.fetcher(filters).then((items) => {
        if (this.queueForCalls.length > 0) {
          this.getData(this.queueForCalls.pop());
          this.queueForCalls = [];
        } else {
          if (items === 'DONT_CALL_SERVER') {
            this.windowsItems = [];
            this.iosItems = [];
            this.androidItems = [];
            this.osxItems = [];
          } else {
            this.windowsItems = items.rows.windows;
            this.iosItems = items.rows.ios;
            this.androidItems = items.rows.android;
            this.osxItems = items.rows.osx;
          }
          console.log(items)
          this.manageNewItems();
        }
      })
        .catch((err) => {
          console.log(err)
        });
    },
    setPeriodFilterToLastWeek() {
      this.periodFilter = dateService.setPeriodComponentToLastWeek();
    },
    manageNewItems() {
      let totalWindowsEvents = !!this.windowsItems ?
        this.windowsItems.reduce((accumulator, currentElement) => accumulator + currentElement.num, 0) :
        0;
      let totalAndroidEvents = !!this.androidItems ?
        this.androidItems.reduce((accumulator, currentElement) => accumulator + currentElement.num, 0) :
        0;
      let totalIosEvents = !!this.iosItems ?
        this.iosItems.reduce((accumulator, currentElement) => accumulator + currentElement.num, 0) :
        0;
      let totalOsxEvents = !!this.osxItems ?
        this.osxItems.reduce((accumulator, currentElement) => accumulator + currentElement.num, 0) :
        0;
      let windowObj = {
        name: "WINDOWS",
        children: [],
        sliceSettings: {
          fill: am5.color("#a2a8d3")
        }
      };
      let iosObj = {
        name: "IOS",
        children: [],
        sliceSettings: {
          fill: am5.color("#b0757c"),
        }
      };
      let androidObj = {
        name: "ANDROID",
        children: [],
        sliceSettings: {
          fill: am5.color("#83afa6")
        }
      };
      let osxObj = {
        name: "OSX",
        children: [],
        sliceSettings: {
          fill: am5.color("#0070C9")
        }
      };
      (!!this.windowsItems ? this.windowsItems : []).forEach((el) => {
        let obj = {}
        obj.name = el.version;
        obj.value = el.num;
        obj.osType = 'WINDOWS';
        obj.sliceSettings = {
          fill: am5.color("#385170"),
        }
        if ((el.num / totalWindowsEvents) < 0.05)
          obj.sliceSettings.dRadius = 10;
        windowObj.children.push(obj);
      });
      (!!this.androidItems ? this.androidItems : []).forEach((el) => {
        let obj = {}
        obj.name = el.version;
        obj.value = el.num;
        obj.osType = 'ANDROID';
        obj.sliceSettings = {
          fill: am5.color("#58727f"),
        }
        if ((el.num / totalAndroidEvents) < 0.05)
          obj.sliceSettings.dRadius = 10;
        androidObj.children.push(obj);
      });
      (!!this.iosItems ? this.iosItems : []).forEach((el) => {
        let obj = {}
        obj.name = el.version;
        obj.value = el.num;
        obj.osType = 'IOS';
        obj.sliceSettings = {
          fill: am5.color("#9b5d73"),
        }
        if ((el.num / totalIosEvents) < 0.05)
          obj.sliceSettings.dRadius = 10;
        iosObj.children.push(obj);
      });
      (!!this.osxItems ? this.osxItems : []).forEach((el) => {
        let obj = {}
        obj.name = el.version;
        obj.value = el.num;
        obj.osType = 'OSX';
        obj.sliceSettings = {
          fill: am5.color("#0070C9"),
        }
        if ((el.num / totalOsxEvents) < 0.05)
          obj.sliceSettings.dRadius = 10;
        osxObj.children.push(obj);
      });
      this.setItems([windowObj, iosObj, androidObj, osxObj].filter(el => el.children.length > 0));
    },
    clearFilters() {
      this.innerCircle = undefined;
      this.lastSliceClicked = null;
      this.criticalityFilter = null;
      this.eventTypesFilter = null;
      this.serialNumbersFilter = null;
      this.selectedDaysFilter = null;
    },
    renderChart() {
      this.setPeriodFilterToLastWeek();
      this.chartroot = am5.Root.new("SunburstChart");

      toRaw(this.chartroot).setThemes([
        am5themes_Animated.new(toRaw(this.chartroot))
      ]);

      this.container = toRaw(this.chartroot).container.children.push(
        am5.Container.new(toRaw(this.chartroot), {
          width: am5.percent(100),
          height: am5.percent(100),
          layout: toRaw(this.chartroot).verticalLayout
        })
      );

      this.sunburstInstance =
        am5hierarchy.Sunburst.new(toRaw(this.chartroot), {
          //singleBranchOnly: false,
          downDepth: 1,
          initialDepth: 1,
          innerRadius: am5.percent(10),
          valueField: "value",
          categoryField: "name",
          childDataField: "children",
          radius: am5.percent(90)
        });
      this.series = toRaw(this.container).children.push(
        toRaw(this.sunburstInstance)
      );
      this.legend = toRaw(this.container).children.push(am5.Legend.new(toRaw(this.chartroot), {
        layout: toRaw(this.chartroot).verticalLayout,
      }));
    },
    calcFilterOsType() {
      if (!!this.innerCircle && this.innerCircle === 'IOS')
        return 'ios'
      else if (!!this.innerCircle && this.innerCircle === 'WINDOWS')
        return 'windows'
      else if (!!this.innerCircle && this.innerCircle === 'ANDROID')
        return 'android'
      else if (!!this.innerCircle && this.innerCircle === 'OSX')
        return 'osx'
      else return undefined
    },
  },
  computed: {},
  watch: {
    selectVersionFromParent(newVal, oldVal) {
      if (!newVal)
        return;
      let versionsOfOsSelected = [];
      this.series.nodes.each((node) => {
        if (node.dataItem.dataContext.osType == this.innerCircle)
          versionsOfOsSelected.push(node)
      });
      let sliceSelected = (versionsOfOsSelected.find((node) => node.dataItem.dataContext.name == newVal)).children._values[0];
      if (!!this.lastSliceClicked) {
        this.lastSliceClicked.setAll({
          stroke: "white",
          strokeWidth: 1
        });
        //reclick on slice already selected
        if (this.lastSliceClicked.dataItem.dataContext.name === newVal) {
          this.lastSliceClicked = undefined;
          this.bus.emit('osVersionFilter', undefined);
          this.$emit('selectedVersion', {
            newItems: this.series.get('selectedDataItem')
              .get("children")
              .map(child => child.dataContext)
              .sort((a, b) => a.value - b.value),
            selectedVersion: undefined
          });
        }
        //click on another slice
        else {
          this.lastSliceClicked = sliceSelected;
          this.lastSliceClicked.setAll({
            stroke: "white",
            strokeWidth: 5
          });
          this.bus.emit('osVersionFilter', newVal);
          this.$emit('selectedVersion', {
            newItems: this.series.get('selectedDataItem')
              .get("children")
              .map(child => child.dataContext)
              .sort((a, b) => a.value - b.value),
            selectedVersion: newVal
          });
        }
      } else {
        this.lastSliceClicked = sliceSelected;
        this.lastSliceClicked.setAll({
          stroke: "white",
          strokeWidth: 5
        });
        this.bus.emit('osVersionFilter', newVal);
        this.$emit('selectedVersion', {
          newItems: this.series.get('selectedDataItem')
            .get("children")
            .map(child => child.dataContext)
            .sort((a, b) => a.value - b.value),
          selectedVersion: newVal
        });
      }
    }
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

.test {
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
