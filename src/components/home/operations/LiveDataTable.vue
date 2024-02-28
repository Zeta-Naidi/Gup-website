<template>
  <v-data-table
    :height="dynamicHeight"
    :headers="headers"
    :items="items"
    fixed-header
    :class="{divHovered: loadingItems}"
    :row-props="rowTableClasses"
    :items-per-page-text="getTranslation('ROWS_PER_PAGE')"
    :show-current-page="true"
    :show-first-last-page="true"
    :items-per-page-options="[10,15]"
    transition="slide-y-transition"
    @click:row="rowClicked"
  >
    <template v-slot:header.score>
      {{ getTranslation('SEVERITY') }}
    </template>
    <template v-slot:header.client>
      {{ getTranslation('CLIENT') }}
    </template>
    <template v-slot:header.description>
      {{ getTranslation('DESCRIPTION') }}
    </template>
    <template v-slot:header.deviceSerialNumber>
      {{ getTranslation('SERIAL') }}
    </template>
    <template v-slot:header.detectionDate>
      {{ getTranslation('DATE') }}
    </template>
    <template v-slot:header.actions>
      {{ getTranslation('ACTIONS') }}
    </template>

    <template v-slot:item.score="{ item }">
      <div class="d-flex align-center">
        <div
          class="d-flex"
          :style="{'border-left': '5px solid ' + getColorSeverity(item.score), 'padding-left':'8px'}">
          {{ item.score + ' ' + getLabelSeverity(item.score) }}
        </div>
      </div>
    </template>
    <template v-slot:item.client="{ item }">
      <div class="d-flex align-center">
        <div
          class="d-flex">
          {{ item.client?.companyName }}
        </div>
      </div>
    </template>
    <template v-slot:item.description="{ item }">
      <div class="d-flex align-center">
        <v-icon class="pr-1">
          {{ getEventTypeIcon(item.eventTypeKey) }}
        </v-icon>
        {{ getTranslation(item.description) }}
      </div>
    </template>
    <template v-slot:item.detectionDate="{ item }">
      <v-text-field
        :model-value="getDateString(item.detectionDate)"
        readonly
        outlined
        hide-details="auto"
      >
        <template v-slot:label>
          <v-icon style="vertical-align: middle">
            mdi-calendar
          </v-icon>
        </template>
      </v-text-field>
    </template>
    <template v-slot:item.deviceSerialNumber="{ item }">
      <div class="d-flex align-center">
        <v-icon :color="getColorIconOsType(item.osType)" class="pr-1">
          {{ getNameIconOsType(item.osType) }}
        </v-icon>
        {{ item.deviceName ?? item.deviceSerialNumber }}
      </div>
    </template>
    <template v-slot:item.actions="{ item }">
      <div class="d-flex align-center">
        <v-btn
          v-if="!item.hasBeenSolved && item.remediationAction && !item.remediationActionStarted"
          color="primary"
          @click.stop="resolveEvent(item); item.checked = true;"
        >
          {{ getTranslation('REPAIR') }}
        </v-btn>
        <v-btn
          v-else-if="!item.hasBeenSolved && !item.remediationAction && !item.remediationActionStarted"
          dense
          @click.stop="redirectToChimpa(item); item.checked = true;"
        >
          {{ getTranslation('MANUAL_REPAIR') }}
        </v-btn>
        <v-btn
          v-else-if="!item.hasBeenSolved && !!item.remediationActionStarted"
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
    </template>
  </v-data-table>
</template>

<script>
import translateService from "@/globalServices/translate";
import dateService from "@/globalServices/dateService";
import deviceService from "@/globalServices/deviceService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";


export default {
  name: "LiveDataTable",
  components: {},
  data() {
    return {
      headers: [
        {title: '', value: "score", sortable: false, width: "8%"},
        {title: '', value: "client", sortable: false, width: "8%"},
        {title: '', value: "description", sortable: false, width: "40%"},
        {title: '', value: "deviceSerialNumber", sortable: false, width: "10%"},
        {title: '', value: "detectionDate", sortable: false, width: "20%"},
        {title: '', value: "actions", sortable: false, width: "13%"},
      ],
      loadingItems: false,
      periodFilter: undefined,
      items: [],
    };
  },
  props: {
    dynamicHeight: {
      type: Number,
      default: 330
    },
    newItems: {
      type: Array,
      default: () => []
    },
    newItemsToUpdate: {
      type: Array,
      default: () => []
    },
  },
  mounted() {
  },
  methods: {
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
    /**
     * Return the label associated with the severity score
     * @param {Number} score
     */
    getLabelSeverity(score) {
      if (Number(score) > 9.0) return this.getTranslation('CRITICAL');
      else if (Number(score) >= 7.0 && Number(score) <= 9.0) return this.getTranslation('HIGH');
      else if (Number(score) >= 4.0 && Number(score) < 7.0) return this.getTranslation('MEDIUM');
      else if (Number(score) < 4.0) return this.getTranslation('LOW');
      else return "";
    },
    async resolveEvent(item) {
      this.$emit('resolveEvent', item);
    },
    rowTableClasses(row) {
      const item = row.item;
      let classes = {};
      if (!item.checked)
        classes['not-checked'] = true;
      if (!!item.justInserted)
        classes['just-inserted'] = true;
      return {
        class: {
          ...classes
        }
      }
    },
    rowClicked(event, row) {
      this.$emit('rowClicked', {
        items: this.items,
        index: row.index,
        id: row.item.id,
      });
    },
    async redirectToChimpa(event) {
      try {
        const response = await apiService.axiosToBackend()
          .get("/api/redirectToChimpa/" + event.clientId)
        if (response.data.success) {
          const host = response.data.payload.clientHost;
          const baseUrl = response.data.payload.clientBaseUrl;
          //const base64Str = Buffer.from(event.deviceSerialNumber, 'utf8').toString('base64');
          window.open('https://' + host + '/' + baseUrl + '/' + '/panel/login', '_blank').focus();
        }
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
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
    /**
     * @param {String} date - date to convert, e.g. 2022-10-12 00:30:21
     * @returns {String}
     */
    getDateString(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen)
    },
    getNameIconOsType(osName) {
      return deviceService.getNameIconOsType(osName);
    },
    getColorIconOsType(osName) {
      return deviceService.getColorIconOsType(osName);
    },
    getEventTypeIcon(eventType) {
      return deviceService.getIconByEventType(eventType);
    },
  },
  watch: {
    newItems: {
      handler(newVal) {
        this.items.unshift(...newVal)
        setTimeout(() => {
          for(const row of this.items) {
            if(row.justInserted)
              row.justInserted = false;
            else break;
          }
        }, 3200)
      },
    },
    newItemsToUpdate(newVal){
      const eventsMap = new Map();
      for(const eventToUpdate of newVal)
        eventsMap.set(eventToUpdate.id,eventToUpdate)
      const idsToCheck = eventsMap.keys();
      this.items.forEach(eventInTable => {
        if(idsToCheck.includes(eventInTable.id)){
          eventInTable.hasBeenSolved = eventsMap.get(eventInTable.id).hasBeenSolved;
          eventInTable.remediationActionStarted = eventsMap.get(eventInTable.id).remediationActionStarted;
        }
      })
    }
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>
<style scoped lang="scss">
:deep(.not-checked) {
  background-color: rgba(112, 141, 150, 0.8);
}

:deep(.just-inserted) {
  animation: fadeIn 3s;
}

:deep(td) {
  height: 80px !important;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateX(-900px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
