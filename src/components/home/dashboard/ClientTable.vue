<template>
  <div>
    <v-data-table
      v-if="modOfDisplay === 'table'"
      v-model="selectedClients"
      :height="dynamicHeight"
      :headers="headers"
      :items="items"
      :fixed-header="true"
      :single-select="false"
      :show-select="true"
      :hover="true"
      :loading="loadingData"
      :search="search"
      last-icon=""
      first-icon=""
      item-class="row-clients-table"
      :items-per-page-text="getTranslation('ROWS_PER_PAGE')"
      @click:row="rowCLicked"
      :options.sync="optionsPagination"
    >
      <template v-slot:[`header.data-table-select`]>
        <div class="text-start">
          <v-btn
            style="border-radius: 10px; align-content: start"
            @click="modOfDisplay = modOfDisplay === 'table' ? 'groupedByReseller' : 'table'"
            small
            color="primary"
            class="d-flex align-center"
          >
            <v-icon size="x-large">
              mdi-account-group
            </v-icon>
          </v-btn>
        </div>
      </template>
      <template v-slot:header.companyName>
        {{ getTranslation('NAME') }}
      </template>
      <template v-slot:item.data-table-select="{ item }">
        <div class="d-flex justify-center">
          <v-checkbox
            @click.prevent=""
            :model-value="!!selectedClients.find(el => el.id === toRaw(item).id)"
            hide-details="auto"
          ></v-checkbox>
        </div>
      </template>
      <template v-slot:item.companyName="{item,index}">
        <div class="client">
          {{
            ((!!optionsPagination.page && optionsPagination.page > 1) ?
              String(Number(optionsPagination.itemsPerPage * (optionsPagination.page - 1)) + Number(index + 1))
              : (index + 1)) + ". " + item.companyName
          }}
        </div>
      </template>
    </v-data-table>
    <div v-else-if="modOfDisplay === 'groupedByReseller' && groupedClientsAreFetched">
      <div class="pt-2 pl-4 d-flex align-center">
        <v-btn
          style="border-radius: 10px; align-content: start"
          @click="modOfDisplay = modOfDisplay === 'table' ? 'groupedByReseller' : 'table'"
          small
          color="secondary"
          class="d-flex align-center"
        >
          <v-icon size="x-large">
            mdi-account-group
          </v-icon>
        </v-btn>
        <div class="ml-2" style="font-size: 18px; color: #63adf2;">{{ getTranslation('GROUPED_BY_RESELLER') }}</div>
      </div>
      <v-sheet :style="{'height': dynamicHeight === 330 ? '350px' : '35vh','overflow-y': 'scroll'}" class="pt-1">
        <v-expansion-panels v-for="resellerName of Object.keys(itemsGroupedByReseller)" :key="resellerName">
          <v-expansion-panel style="border-color: #63adf2; border-style: solid">
            <v-expansion-panel-title class="py-2">
              <div class="d-flex align-center">
                <v-checkbox
                  hide-details="auto"
                  :input-value="isCheckboxResellerTrue(resellerName)"
                  @click.stop.prevent="isCheckboxResellerTrue(resellerName) ?
                      selectedClients = selectedClients.filter(el => el.resellerName !== resellerName) :
                      (() => {
                        selectedClients = selectedClients.filter(el => el.resellerName !== resellerName);
                        selectedClients.push(...items.filter(el => el.resellerName === resellerName));
                      })()
                      "
                />
                {{ resellerName }}
                <v-spacer/>
                <div class="d-flex align-center px-4 mr-3"
                     style="border-color: #63adf2; border-style: solid; border-radius: 10px">
                  <div style="font-size: 18px" class="py-2">
                    {{ selectedClients.filter(el => el.resellerName === resellerName).length }}
                  </div>
                  <div style="font-size: 26px" class="py-2">
                    {{ "/" }}
                  </div>
                  <div style="font-size: 18px" class="py-2">
                    {{ items.filter(el => el.resellerName === resellerName).length }}
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div style="max-height: 250px; overflow-y: scroll; border-top: solid #63adf2">
                <div
                  class="d-flex align-center ml-3 py-1"
                  v-for="(clientOfReseller, index) of itemsGroupedByReseller[resellerName]"
                  :key="clientOfReseller.id"
                  @click="rowCLicked(null, clientOfReseller)"
                  style="cursor: pointer"
                >
                  <v-checkbox
                    hide-details="auto"
                    :input-value="!!selectedClients.find(el => el.id === clientOfReseller.id)"
                    @click.stop.prevent="!!selectedClients.find(el => el.id === clientOfReseller.id) ?
                      selectedClients = selectedClients.filter(el => el.id !== clientOfReseller.id) :
                      selectedClients.push(clientOfReseller)"
                  ></v-checkbox>
                  {{
                    ((!!optionsPagination.page && optionsPagination.page > 1) ?
                      String(Number(optionsPagination.itemsPerPage * (optionsPagination.page - 1)) + Number(index + 1))
                      : (index + 1)) + ". " + clientOfReseller.companyName
                  }}
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {toRaw} from "vue";

export default {
  name: "ClientTable",
  data: () => ({
    headers: [
      {value: "companyName", sortable: false},
    ],
    items: [],
    dynamicHeight: '',
    selectedClients: [],
    optionsPagination: {},
    modOfDisplay: 'table',
    groupedClientsAreFetched: false,
    itemsGroupedByReseller: {},
    loadingData: false,
  }),
  props: {
    bus: {
      type: Object,
      default: () => {
      }
    },
    windowHeight: {
      type: Number,
    },
    search: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.loadingData = true;
    this.dynamicHeight = this.windowHeight > 1000 ? '35vh' : 330;
    apiService.axiosToBackend().get("/api/client", {
      params:
        {
          filters: JSON.stringify({
            selectAttributes: ['resellers.name as resellerName', 'clients.id', 'baseUrl', 'host', 'companyName'],
          })
        }
    })
      .then((response) => {
        if (response?.data?.success)
          this.items = response.data.payload;
        this.loadingData = false;
      })
      .catch((err) => {
        this.loadingData = false;
        utilsFunctions.handleServerResponseException(err)
      });
  },
  methods: {
    toRaw,
    rowCLicked(event, row) {
      const item = row.item;
      if (!this.selectedClients.find(el => el.id === item.id)) {
        this.selectedClients.push(item);
      } else if (!!this.selectedClients.find(el => el.id === item.id)) {
        this.selectedClients = this.selectedClients.filter(el => el.id !== item.id)
      } else return;
    },
    isCheckboxResellerTrue(resellerName) {
      return this.selectedClients.filter(el => el.resellerName === resellerName).length > 0 &&
        this.selectedClients.filter(el => el.resellerName === resellerName).length === this.items.filter(el => el.resellerName === resellerName).length
    },
    /**
     * Translates the key with the language chosen
     * @param {string} key -key to translate
     * @returns {string} key translated
     */
    getTranslation(key) {
      return translateService.getTranslation(this.languageChosen, key);
    },
    fetchClientsGroupedByReseller() {
      this.groupedClientsAreFetched = false;
      this.itemsGroupedByReseller = {};
      this.items.forEach(client => {
        if (!this.itemsGroupedByReseller[client.resellerName])
          this.itemsGroupedByReseller[client.resellerName] = [client];
        else
          this.itemsGroupedByReseller[client.resellerName].push(client);
      });
      this.groupedClientsAreFetched = true;
    }
  },
  watch: {
    modOfDisplay(newVal) {
      if (newVal === 'groupedByReseller') {
        this.fetchClientsGroupedByReseller();
        this.$emit('hideSearchBox');
      } else
        this.$emit('showSearchBox');
    },
    selectedClients: {
      handler(val,oldVal){
        this.bus.emit('clientsSelected', this.selectedClients);
        this.$emit('clientSelectedForSubtitle');
      },
      deep: true
    },
  },
  computed: {
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>
<style scoped lang=scss>
:deep(.v-input--selection-controls) {
  margin-top: 0;
  margin-bottom: 6px;
}

:deep(.client) {
  cursor: pointer;
}

</style>
