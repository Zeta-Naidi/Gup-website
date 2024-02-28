<template>
  <div>
    <div class="d-flex justify-center hover-center" v-if="loadingItems">
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
      <div class="cube"></div>
    </div>
    <div class="d-flex-wrap justify-start" :class="{'divHovered': loadingItems}">
      <v-alert
        v-for="(el, index) in data"
        :key="index"
        border="start"
        :class="{'events-alert': true, 'pl-3': true, 'card-clicked': !!el.clicked}"
        :style="{'height': windowHeight > 1000 ? '120px' : '95px'}"
        :border-color="el.color"
        :color="el.color"
        variant="text"
        elevation="2"
        width="100%"
        class="mb-1"
        @click="cardClicked(el)"
      >
        <div class="d-flex align-center pl-3">
          <div class="title-card">{{ getTranslation(el.title) }}</div>
          <v-spacer></v-spacer>
          <div :style="{'color': el.color}" class="difference-number"
               v-if="!selectedDaysFilter || (Array.isArray(selectedDaysFilter) && selectedDaysFilter.length === 0)">
            {{ calcPercentageToDisplay(el.numberEvents, el.numberEventsLastPeriod) }}
          </div>
        </div>
        <div class="d-flex pl-3">
          <div class="number-events">
            {{ el.numberEvents.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") }}
          </div>
          <v-icon :style="{'color': el.color, 'margin-left': '5px'}"
                  v-if="(Number(el.numberEvents) - Number(el.numberEventsLastPeriod)) < 0">
            mdi-arrow-down
          </v-icon>
          <v-icon :style="{'color': el.color, 'margin-left': '5px'}"
                  v-else-if="(Number(el.numberEvents) - Number(el.numberEventsLastPeriod)) > 0">
            mdi-arrow-up
          </v-icon>
          <v-icon :style="{'color': el.color, 'margin-left': '5px'}"
                  v-else-if="(Number(el.numberEvents) - Number(el.numberEventsLastPeriod)) === 0">
            mdi-equal
          </v-icon>
        </div>
        <div class="mt-1 pl-3" style="font-size: 12px"
             v-if="differentPeriod && (!selectedDaysFilter || (Array.isArray(selectedDaysFilter) && selectedDaysFilter.length === 0))">
          {{
            getTranslation('COMPARED_TO_THE_PERIOD') + ': ' +
            getDateSetWithCurrentTimezone(differentPeriod.from).substring(0, 10) + ' - ' +
            getDateSetWithCurrentTimezone(differentPeriod.to).substring(0, 10)
          }}
        </div>
      </v-alert>
    </div>
  </div>
</template>
<script>
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import axios from "axios";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "SeverityFilter",
  data: () => ({
    data: [
      {
        title: "CRITICAL",
        numberEventsLastPeriod: 0,
        numberEvents: 0,
        downTitle: "rispetto al periodo precedente",
        color: '#b60000',
        clicked: false,
        key: 'critic',
      },
      {
        title: "HIGH",
        numberEventsLastPeriod: 0,
        numberEvents: 0,
        downTitle: "rispetto al periodo precedente",
        color: '#f02929',
        clicked: false,
        key: 'high',
      },
      {
        title: "MEDIUM",
        numberEventsLastPeriod: 0,
        numberEvents: 0,
        downTitle: "rispetto al periodo precedente",
        color: '#f27516',
        clicked: false,
        key: 'medium',
      },
      {
        title: "LOW",
        numberEventsLastPeriod: 0,
        numberEvents: 0,
        downTitle: "rispetto al periodo precedente",
        color: '#fec601',
        clicked: false,
        key: 'low',
      },
    ],
    clientsFilter: undefined,
    osVersionFilter: undefined,
    osTypeFilter: undefined,
    periodFilter: undefined,
    criticalityFilter: [],
    selectedDaysFilter: undefined,
    eventTypesFilter: undefined,
    serialNumbersFilter: undefined,
    differentPeriod: undefined,
    loadingItems: false,
    queueForCalls: [],
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
    },
  },
  mounted() {
    this.setPeriodFilterToLastWeek();
    this.bus.on("clientsSelected", (clientsSelected) => {
      this.clientsFilter = clientsSelected;
      this.clearFilters();
      this.pushInQueue();
    })
    this.bus.on("osVersionFilter", (osVersionFilter) => {
      this.osVersionFilter = !!osVersionFilter ? osVersionFilter.toLowerCase() : undefined;
      this.pushInQueue();
    });
    this.bus.on("osTypeFilter", (osTypeFilter) => {
      this.osTypeFilter = osTypeFilter.toLowerCase()
      this.pushInQueue();
    });
    this.bus.on("removeOsFilters", () => {
      this.osTypeFilter = undefined;
      this.osVersionFilter = undefined;
      this.pushInQueue();
    });
    this.bus.on("periodFilter", (periodFilter) => {
      this.periodFilter = periodFilter
      if (!!this.clientsFilter)
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
    cardClicked(el) {
      el.clicked = !el.clicked;
      if (el.clicked)
        this.criticalityFilter.push(el.key);
      else
        this.criticalityFilter = this.criticalityFilter.filter(item => item !== el.key);
      this.bus.emit('criticalityFilter', this.criticalityFilter);
    },
    pushInQueue() {
      let from = new Date(this.periodFilter.from);
      let to = new Date(this.periodFilter.to);
      from.setDate(from.getDate() - this.periodFilter.numberOfDaysSelected);
      from.setHours(0, 0, 0);
      to.setDate(to.getDate() - this.periodFilter.numberOfDaysSelected);
      to.setHours(23, 59, 59);
      this.differentPeriod = {
        from: (() => {
          const date = from.toISOString().split('T')[0];
          const time = from.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })(),
        to: (() => {
          const date = to.toISOString().split('T')[0];
          const time = to.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })()
      };

      this.queueForCalls.push({
        clientIds: this.clientsFilter.map((el) => el.id),
        withDevice: true,
        deviceOsVersion: this.osVersionFilter,
        deviceOsType: this.osTypeFilter,
        period: this.periodFilter,
        selectedDays: this.selectedDaysFilter,
        eventTypes: this.eventTypesFilter,
        serialNumbers: this.serialNumbersFilter,
        groupBy: ['criticalityLevel'],
        selectAttributes: ['criticalityLevel'],
        onlyNumericData: true,
        sameQueryLastPeriod: this.differentPeriod,
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
          if (items === 'DONT_CALL_SERVER') {
            ['critic', 'high', 'medium', 'low'].forEach((key) => {
              this.buildCardObject(null, key);
            });
            ['critic', 'high', 'medium', 'low'].forEach((key) => {
              this.buildCardLastPeriodObject(null, key);
            });
          }
          else {
            ['critic', 'high', 'medium', 'low'].forEach((key) => {
              this.buildCardObject(items.rows.find(row => row.criticalityLevel === key), key);
            });
            ['critic', 'high', 'medium', 'low'].forEach((key) => {
              this.buildCardLastPeriodObject(items.sameQueryLastPeriod.rows.find(row => row.criticalityLevel === key), key);
            });
          }
          this.loadingItems = false;
        }
      })
        .catch((e) => {
          console.log(e.message);
          this.loadingItems = false;
        });
    },
    buildCardObject(item, key) {
      let obj = this.data.find(card => card.key === key);
      if (!!obj) {
        obj.numberEvents = !!item ? item.num : 0;
        if (key === 'critic')
          this.$emit('amountCriticalEvents', !!item ? item.num : 0)
      }
    },
    buildCardLastPeriodObject(item, key) {
      let obj = this.data.find(card => card.key === key);
      if (!!obj)
        obj.numberEventsLastPeriod = !!item ? item.num : 0;
    },
    getColorSeverity(nameField) {
      if (nameField === 'critic') return "#b60000";
      else if (nameField === 'high') return "#f02929";
      else if (nameField === 'medium') return "#f27516";
      else if (nameField === 'low') return "#fec601";
      else return "";
    },
    setPeriodFilterToLastWeek() {
      this.periodFilter = dateService.setPeriodComponentToLastWeek();
    },
    calcPercentageToDisplay(numberEvents, numberEventsLastPeriod) {
      if (numberEvents === 0 || numberEventsLastPeriod === 0 || numberEventsLastPeriod === 1 || numberEvents === 1) {
        if ((numberEvents === 0 || numberEvents === 1) && numberEventsLastPeriod !== 0) return '- ' + (numberEventsLastPeriod - numberEvents);
        else if (numberEvents !== 0 && (numberEventsLastPeriod === 0 || numberEventsLastPeriod === 1)) return '+ ' + (numberEvents - numberEventsLastPeriod);
        else return '';
      } else {
        let division = (Number(numberEvents) / Number(numberEventsLastPeriod));
        //INCREMENT CASE
        if (division > 1) {
          let divisionFixed = division.toFixed(3);
          if (division < 2)
            return '+ ' + divisionFixed.substring(divisionFixed.substring(2, 3) !== '0' ? 2 : 3, 4) + '%';
          else {
            divisionFixed = (division - 1).toFixed(3); //offset 1
            return '+ ' + divisionFixed.substring(0, 1) + divisionFixed.substring(2, 4) + '%'; // Removing the char '.'
          }
        }
        //DECREMENT CASE
        else if (division < 1) {
          let divisionInverted = (1 - division).toFixed(3);
          return '- ' + divisionInverted.substring(divisionInverted.substring(2, 3) !== '0' ? 2 : 3, 4) + '%';
        } else {
          return '';
        }
      }
    },
    clearFilters() {
      this.osVersionFilter = null;
      this.osTypeFilter = null;
      this.criticalityFilter = [];
      this.eventTypesFilter = null;
      this.serialNumbersFilter = null;
      this.selectedDaysFilter = null;
      this.data.forEach(el => el.clicked = false);
    },
    /**
     * Translates the key with the language chosen
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      return translateService.getTranslation(this.languageChosen, key);
    },
    getDateSetWithCurrentTimezone(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen);
    }
  },
  watch: {},
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
};
</script>

<style>
.events-alert {
  padding: 5px 8px !important;
  width: 180px;
  border-radius: 8px;
}

.events-alert:hover {
  background-color: #3484ce;
  cursor: pointer;
}

.card-clicked {
  background-color: #3484ce !important;
}
</style>
<style scoped lang="scss">
.title-card {
  height: 24px;
  font-size: 16px;
  text-decoration: none solid rgb(255, 255, 255);
  line-height: 24px;
}

.difference-number {
  width: 80px;
  height: 24px;
  font-size: 16px;
  text-decoration: none solid rgb(255, 78, 78);
  line-height: 24px;
  text-align: right;
  padding-right: 3px;
}

.number-events {
  height: 32px;
  font-size: 24px;
  text-decoration: none solid rgb(255, 255, 255);
  line-height: 32px;
  font-weight: 600;
}

$colors: #8cc271, #69beeb, #f5aa39, #e9643b;

.hover-center {
  z-index: 10;
  width: 100%;
  height: 100%;
  position: absolute;
  align-items: center;
}

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

.divHovered {
  opacity: 0.2;
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
