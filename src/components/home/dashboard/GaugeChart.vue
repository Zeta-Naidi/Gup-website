<template>
  <div>
    <div class="d-flex justify-center hover-center" v-if="loadingData">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
  <div id="GaugeChart" :class="{'divHovered': loadingData}"></div>
  </div>
</template>

<script>
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5radar from "@amcharts/amcharts5/radar";

import * as am5xy from "@amcharts/amcharts5/xy";
import {toRaw} from "vue";

export default {
  name: "GaugeChart",
  data: () => ({
    bandsData: [
      {
        title: "Highly vulnerable",
        color: "#ee1f25",
        lowScore: 0,
        highScore: 30
      }, {
        title: "At risk",
        color: "#f04922",
        lowScore: 30,
        highScore: 50
      }, {
        title: "Somewhat secure",
        color: "#f3eb0c",
        lowScore: 50,
        highScore: 70
      }, {
        title: "Secure",
        color: "#54b947",
        lowScore: 70,
        highScore: 90
      }, {
        title: "Very Secure",
        color: "#0f9747",
        lowScore: 90,
        highScore: 100
      }
    ],
    root: undefined,
    chart: undefined,
    axisRenderer: undefined,
    xAxis: undefined,
    axisDataItem: undefined,
    clockHand: undefined,
    chartRendered: false,
  }),
  props: {
    value: {
      type: Number,
      default: 0
    },
    loadingData: {
      type: Boolean,
      default: false,
    }
  },
  mounted() {
    this.renderChart();
    this.chartRendered = true;
    this.axisDataItem.animate({
      key: "value",
      to: this.value,
      duration: 500,
      easing: am5.ease.out(am5.ease.cubic)
    });
  },
  methods: {
    renderChart() {
      this.root = am5.Root.new("GaugeChart");
      //this.chartroot._logo.dispose();
      toRaw(this.root).setThemes([
        am5themes_Animated.new(toRaw(this.root))
      ]);
      this.chart = toRaw(this.root).container.children.push(am5radar.RadarChart.new(toRaw(this.root), {
        panX: false,
        panY: false,
        startAngle: 140,
        endAngle: 400
      }));
      this.axisRenderer = am5radar.AxisRendererCircular.new(toRaw(this.root), {
        innerRadius: 0,
      });
      this.axisRenderer.grid.template.setAll({
        stroke: toRaw(this.root).interfaceColors.get("background"),
        visible: false,
        strokeOpacity: 0.8,
      });
      this.axisRenderer.labels.template.setAll({
        fill: am5.color('#ffffff'),
      });

      this.xAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(toRaw(this.root), {
        maxDeviation: 0,
        min: 0,
        max: 100,
        strictMinMax: true,
        renderer: this.axisRenderer
      }));

      this.axisDataItem = this.xAxis.makeDataItem({});

      this.clockHand = am5radar.ClockHand.new(toRaw(this.root), {
        pinRadius: am5.percent(20),
        radius: am5.percent(100),
        bottomWidth: 40
      })

      let bullet = this.axisDataItem.set("bullet", am5xy.AxisBullet.new(toRaw(this.root), {
        sprite: this.clockHand
      }));

      this.xAxis.createAxisRange(this.axisDataItem);

      let label = this.chart.radarContainer.children.push(am5.Label.new(toRaw(this.root), {
        fill: am5.color(0x1e1e1e),
        centerX: am5.percent(50),
        textAlign: "center",
        centerY: am5.percent(50),
        fontSize: "2.5em"
      }));
      let self = this;
      //this.axisDataItem.set("value", 50);
      bullet.get("sprite").on("rotation", function () {
        let value = self.axisDataItem.get("value");
        let fill = am5.color(0x000000);
        self.xAxis.axisRanges.each(function (axisRange) {
          if (value >= axisRange.get("value") && value <= axisRange.get("endValue")) {
            fill = axisRange.get("axisFill").get("fill");
          }
        })

        label.set("text", Math.round(value).toString());

        self.clockHand.pin.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
        self.clockHand.hand.animate({ key: "fill", to: fill, duration: 500, easing: am5.ease.out(am5.ease.cubic) })
      });
      this.chart.bulletsContainer.set("mask", undefined);


      am5.array.each(this.bandsData, function (data) {
        let axisRange = self.xAxis.createAxisRange(self.xAxis.makeDataItem({}));

        axisRange.setAll({
          value: data.lowScore,
          endValue: data.highScore
        });

        axisRange.get("axisFill").setAll({
          visible: true,
          fill: am5.color(data.color),
          fillOpacity: 0.8
        });

        axisRange.get("label").setAll({
          text: data.title,
          inside: true,
          radius: 15,
          fontSize: "0.7em",
          fill: toRaw(self.root).interfaceColors.get("background")
        });
      });
    },
  },
  watch: {
    value(newVal){
      if(this.chartRendered){
        this.axisDataItem.animate({
          key: "value",
          to: this.value,
          duration: 500,
          easing: am5.ease.out(am5.ease.cubic)
        });
      }
    }
  }
}
</script>
<style scoped lang="scss">
  #GaugeChart {
  width: 100%;
  height: 300px;
}
  .divHovered {
    opacity: 0.2;
  }
  .hover-center {
    z-index: 10;
    top: 300px;
    left: 40%;
    position: absolute;
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
