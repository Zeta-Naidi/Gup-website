<template>
  <div class="mx-5 mt-2">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      :footer-props="{
        'items-per-page-text': getTranslation('ROWS_PER_PAGE'),
        'show-current-page': true,
        'show-first-last-page': true,
        'items-per-page-options':[15,50,100],
         }"
      fixed-header
      multi-sort
      show-expand
      single-expand
      mobile-breakpoint="0"
      :expanded.sync="expandedRows"
      item-key="id"
      :server-items-length="totalRows"
      :item-class="rowTableClasses"
      :options.sync="optionsPagination"
      @click:row="expandRow"
      @update:options="updatePagination"
    >
      <!--      @update:options="updatePagination"-->
      <!--chiedo a cosa servver -->
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>
            <div class="d-flex ml-5">
              {{ getTranslation('ADMINISTRATOR_LOGS') }}
            </div>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <!--<v-row style="max-width: 40%;" class="mr-5 py-2" v-if="!$vuetify.breakpoint.xs">-->
          <v-row style="max-width: 40%;" class="mr-5 py-2">
            <v-col cols="6">
              <v-menu
                v-model="menuStartDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    :model-value="formatStartDate"
                    :label="getTranslation('FROM')"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    hide-details="auto"
                    outlined
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="startDate"
                  @input="menuStartDate = false"
                  :locale="getDatePickerLanguage()"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu
                v-model="menuEndDate"
                :close-on-content-click="false"
                transition="scale-transition"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ props }">
                  <v-text-field
                    :model-value="formatEndDate"
                    :label="getTranslation('TO')"
                    prepend-icon="mdi-calendar"
                    readonly
                    v-bind="props"
                    hide-details="auto"
                    outlined
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="endDate"
                  @input="menuEndDate = false"
                  :locale="getDatePickerLanguage()"
                ></v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
          <v-menu
            :v-model="menuFilters"
            offset-y
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" color="primary" class="mr-2">
                {{ getTranslation('FILTERS') }}
                <v-badge
                  bordered
                  color="#63adf2"
                  :offset-y="numberFiltersActive > 0 ? 20 : -40"
                  offset-x="10"
                  :content="numberFiltersActive"
                >
                  <v-btn
                    plain
                    icon
                  >
                    <v-icon>
                      mdi-filter
                    </v-icon>
                  </v-btn>
                </v-badge>
              </v-btn>
            </template>
            <v-card width="600" style="border-color: #63adf2; border-style: solid">
              <v-card-text style="height: 450px">
                <v-list>
                  <v-list-subheader>{{ getTranslation('FILTER_BY_TYPE') }}</v-list-subheader>
                  <v-list-item>
                    <v-autocomplete
                      v-model="typeFilter"
                      :items="typeItems"
                      item-value="type"
                      :item-title="()=>null"
                      multiple
                      outlined
                      filled
                      hide-details="auto"
                    >
                      <template #selection="{item}">
                        <v-chip
                          :closable="true"
                          size="x-large"
                          :color="getColorByType(item.raw.type)"
                          @click:close="removeFilter(item.raw.type, 'type')"
                        >
                          {{ getTranslation(item.raw.type)}}
                        </v-chip>
                      </template>
                      <template v-slot:item="{ item,props }">
                        <v-list-item v-bind="props" class="d-flex">
                          <v-icon
                            :color="getColorByType(item.raw.type)"
                            variant="elevated"
                            size="x-large"
                            class="pr-1"
                          >
                          </v-icon>
                          {{ getTranslation(item.raw.type)}}
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-list-item>
                  <v-divider></v-divider>
                    <v-list-subheader>{{ getTranslation('FILTER_BY_IP_ADDRESS') }}</v-list-subheader>
                  <v-list-item>
                    <v-autocomplete
                      v-model="ipFilter"
                      :items="ipItems"
                      :item-title="()=>null"
                      item-value="ip"
                      multiple
                      outlined
                      hide-details="auto"
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          close
                          color="primary"
                          @click:close="removeFilter(item.raw.ip, 'ip')"
                        >
                          {{ item.raw.ip }}
                        </v-chip>
                      </template>
                      <template v-slot:item="{ item,props }">
                        <v-list-item v-bind="props" class="d-flex">
                          <v-icon
                            :color="getColorByType(item.raw.ip)"
                            variant="elevated"
                            size="x-large"
                            class="pr-1"
                          >
                          </v-icon>
                          {{ getTranslation(item.raw.ip)}}
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-list-item>
                  <v-divider></v-divider>
                      <v-list-subheader>{{ getTranslation('FILTER_BY_USERNAME') }}</v-list-subheader>
                  <v-list-item>
                    <v-autocomplete
                      v-model="usernameFilter"
                      :items="usernameItems"
                      :item-title="()=>null"
                      item-value="username"
                      multiple
                      outlined
                      hide-details="auto"
                    >
                      <template v-slot:selection="{item}">
                        <v-chip
                          close
                          :color="!!item.raw.username ? 'primary' : 'red'"
                          @click:close="removeFilter(item.raw.username, 'username')"
                        >
                          {{ !!item.raw.username ? item.raw.username : getTranslation('UNKNOWN') }}
                        </v-chip>
                      </template>
                      <template v-slot:item="{ item,props }">
                        <v-list-item v-bind="props" class="d-flex">
                          <v-icon
                            :color="getColorByType(item.raw.username)"
                            variant="elevated"
                            size="x-large"
                            class="pr-1"
                          >
                          </v-icon>
                          {{ !!item.raw.username ? item.raw.username : getTranslation('UNKNOWN') }}
                        </v-list-item>
                      </template>
                    </v-autocomplete>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions style="height: 50px">
                <v-spacer></v-spacer>
                <v-btn
                  color="#6c757d"
                  @click="
                    ipFilter=undefined;
                    optionsPagination.page = 1;
                    typeFilter=undefined;
                    usernameFilter=undefined;
                    numberFiltersActive=0;
                    currentPage = 1;
                    fetchData();"
                  :loading="loading"
                  class="mr-2"
                >
                  {{ getTranslation('RESET_FILTERS') }}
                </v-btn>
                <v-btn
                  color="primary"
                  @click="
                    optionsPagination.page = 1;
                    fetchData();
                    numberFiltersActive =
                    (!!typeFilter ? typeFilter.length : 0) +
                    (!!ipFilter ? ipFilter.length : 0) +
                    (!!usernameFilter ? usernameFilter.length : 0) ;"
                  :loading="loading"
                  class="mr-2"
                >
                  {{ getTranslation('APPLY') }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>
        </v-toolbar>
      </template>
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length -1 " style="border-color: #63adf2;border-style: solid;" class="pr-0 pl-1">
          <div style="word-wrap: break-word;">
            {{ formatItemValue(JSON.parse(item.value)) }}
          </div>
        </td>
      </template>
      <template v-slot:header.username>
        {{ getTranslation('USER') }}
      </template>
      <template v-slot:header.ip>
        {{ getTranslation('IP_ADDRESS') }}
      </template>
      <template v-slot:header.userAgent>
        {{ getTranslation('User Agent') }}
      </template>
      <template v-slot:header.type>
        {{ getTranslation('TYPE') }}
      </template>
      <template v-slot:header.createdAt>
        {{ getTranslation('DATE') }}
      </template>
      <template v-slot:item.username="{ item }">
        <v-chip color="primary" v-if="!!item.username">
          {{ item.username }}
        </v-chip>
        <v-chip v-else color="red">
          {{ getTranslation('UNKNOWN') }}
        </v-chip>
      </template>
      <template v-slot:item.ip="{ item }">
        <v-chip>
          {{ item.ip }}
        </v-chip>
      </template>
      <template v-slot:item.type="{ item }">
        <v-chip :color="getColorByType(item.type)">
          {{ getTranslation(item.type) }}
        </v-chip>
      </template>
      <template v-slot:item.createdAt="{ item }">
        <v-chip>
          {{ getDateWithCorrectFormat(item.createdAt) }}
        </v-chip>
      </template>
      <template v-slot:item.data-table-expand="{ item }">
        <v-icon v-if="!!item.value && !item.checked">
          mdi-arrow-down
        </v-icon>
        <v-icon v-if="!!item.value && !!item.checked">
          mdi-arrow-up
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import translateService from "@/globalServices/translate";
import axios from "axios";
import dateService from "@/globalServices/dateService";
import utilsFunctions from "@/globalServices/utilsFunctions";
import {useAppStore} from "@/plugins/pinia/app";
import {useUserStore} from "@/plugins/pinia/user";
import apiService from "@/globalServices/apiService";
import {mapState} from "pinia";

export default {
  name: "AdministratorLogTable",
  data() {
    return {
      filterSwitchLogType:true,
      filterSwitchLogIp:true,
      filterSwitchLogUsername:true,
      loading: false,
      expandedRows: [],
      singleExpand: false,
      filters: {},
      headers: [
        {text: 'username', align: 'start', sortable: true, value: 'username'},
        {text: 'ip', value: 'ip', sortable: true},
        {text: 'userAgent', value: 'userAgent', sortable: false},
        {text: 'Type', value: 'type'},
        {text: 'createdAt', value: 'createdAt'},
        {text: '', value: 'data-table-expand'},
      ],
      items: [],
      ipFilter: undefined,
      usernameFilter: undefined,
      periodFilter: undefined,
      typeFilter: [],
      orderByFilter: [{attribute: 'createdAt', order: 'desc'}],
      numberFiltersActive: 0,
      startDate: undefined,
      formatStartDate:undefined,
      formatEndDate:undefined,
      endDate: undefined,
      menuStartDate: undefined,
      menuEndDate: undefined,
      totalRows: 0,
      rowsPerPage: 15,
      currentPage: 1,
      ipItems: [],
      usernameItems: [],
      typeItems: [
        {text: "SUCCESS_LOGIN", value: "SUCCESS_LOGIN"},
        {text: "LOGOUT", value: "LOGOUT"},
        {text: "SESSION_EXPIRED", value: "SESSION_EXPIRED"},
        {text: "WRONG_LOGIN", value: "WRONG_LOGIN"},
        {text: "SUCCESS_LOGIN_MFA", value: "SUCCESS_LOGIN_MFA"},
        {text: "SUCCESS_REGISTER_MFA", value: "SUCCESS_REGISTER_MFA"},
        {text: "WRONG_LOGIN_MFA", value: "WRONG_LOGIN_MFA"},
        {text: "WRONG_REGISTER_MFA", value: "WRONG_REGISTER_MFA"},
        {text: "CREATE_USER", value: "CREATE_USER"},
        {text: "UPDATE_USER", value: "UPDATE_USER"},
        {text: "DELETE_USER", value: "DELETE_USER"},
        {text: "USER_BLOCKED", value: "USER_BLOCKED"},
        {text: "IP_ADDRESS_BLOCKED", value: "IP_ADDRESS_BLOCKED"},
        {text: "SUCCESS_RESET_PASSWORD", value: "SUCCESS_RESET_PASSWORD"},
        {text: "WRONG_RESET_PASSWORD", value: "WRONG_RESET_PASSWORD"},
      ],
      menuFilters: false,
      firstFetchDone: false,
      optionsPagination: {},
      changesAreValid: false,
      filterIpsWhenOpenedMenu: undefined,
      filterTypeWhenOpenedMenu: undefined,
      filterUsernameWhenOpenedMenu: undefined
    };
  },
  created() {
    this.setPeriodFilterToLastWeek();
    this.fetchData();
  },
  methods: {
    closeMenu() {
      this.menuFilters = false;
    },
    formatItemValue(value) {
      if (value) {
        if (value.ipBlocked) {
          return this.getTranslation('IP_BLOCKED') + ': ' + value.ipBlocked + ", " + this.getTranslation('REASON') + ': ' + value.reason;
        } else if (value.usernameBlocked) {
          const usernameBlocked = value.usernameBlocked[0];
          return this.getTranslation('USERNAME_BLOCKED') + ': ' + usernameBlocked.username + ", " + this.getTranslation('BLOCKED_UNTIL') + ": " + this.getDateWithCorrectFormat(usernameBlocked.blockedUntil) + ", " + this.getTranslation('REASON') + ': ' + value.reason;
        }
      }
      return 'N/A';
    },
    /**
     * groupBy:Array(0)
     * groupDesc:Array(0)
     * itemsPerPage:10
     * multiSort:false
     * mustSort:false
     * page:1
     * sortBy:Array(0)
     * sortDesc:Array(1)
     */
    updatePagination(optionsPagination) {
      this.currentPage = optionsPagination.page;
      this.rowsPerPage = optionsPagination.itemsPerPage;
      this.expandedRows = [];
      if (optionsPagination.sortBy.length > 0)
        this.orderByFilter = optionsPagination.sortBy.map((el, index) => ({
          attribute: el,
          order: !!optionsPagination.sortDesc[index] ? 'desc' : 'asc'
        }));
      else
        this.orderByFilter = [{attribute: 'createdAt', order: 'desc'}]
      if (!!this.firstFetchDone)
        this.fetchData();
    },
    fetchData() {
      this.loading = true;
      Promise.all([
        this.fetchLogs(['id', 'username', 'ip', 'userAgent', 'toUser', 'type', 'value', 'logType', 'createdAt', 'distributorId'], true, ['ip']),
        this.fetchLogs(['id', 'username', 'ip', 'userAgent', 'toUser', 'type', 'value', 'logType', 'createdAt', 'distributorId'], true, ['username']),
        this.fetchLogs(['id', 'username', 'ip', 'userAgent', 'toUser', 'type', 'value', 'logType', 'createdAt', 'distributorId'], true, ['type']),
        this.fetchLogs(null, true, ['ip', 'username', 'type', 'userAgent', 'toUser', 'value', 'createdAt'], this.orderByFilter),
      ]).then((response) => {
        this.ipItems = response[0].data;
        this.usernameItems = response[1].data;
        this.typeItems = response[2].data;
        this.items = response[3].data;
        this.totalRows = response[3].total;
        this.currentPage = response[3].current_page;
        this.firstFetchDone = true;
        this.loading = false;
        this.changesAreValid = true;
        this.menuFilters = false
      })
        .catch(err => {
          console.log(err)
          this.typeItems = [];
          this.loading = false;
          this.changesAreValid = true;
          this.menuFilters = false
        })
    },
    async fetchLogs(groupByFilter, paginate, selectAttributes, orderByFilter) {
      axios.defaults.withCredentials = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/log/administrator", {
            params: {
              filters: JSON.stringify({
                period: this.periodFilter,
                type: (!groupByFilter && Array.isArray(this.typeFilter) && this.typeFilter.length > 0) ? this.typeFilter : undefined,
                ip: (!groupByFilter && Array.isArray(this.ipFilter) && this.ipFilter.length > 0) ? this.ipFilter : undefined,
                username: (!groupByFilter && Array.isArray(this.usernameFilter) && this.usernameFilter.length > 0) ? this.usernameFilter : undefined,
                paginate: paginate,
                page: this.currentPage,
                rowsPerPage: this.rowsPerPage,
                groupBy: groupByFilter,
                selectAttributes: selectAttributes,
                orderBy: !groupByFilter ? orderByFilter : undefined,
              })
            }
          })
        return response?.data?.payload;
      } catch (e) {
        utilsFunctions.handleServerResponseException(e);
      }
    },
    removeFilter(value, type) {
      if (type === 'type')
        this.typeFilter = this.typeFilter.filter(el => el !== value);
      else if (type === 'ip')
        this.ipFilter = this.ipFilter.filter(el => el !== value);
      else if (type === 'username')
        this.usernameFilter = this.usernameFilter.filter(el => el !== value);
      else return null;
    },
    setPeriodFilterToLastWeek() {
      let startDate = new Date();
      let endDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 1);
      endDate.setHours(23, 59, 59, 59);
      this.periodFilter = {
        from: (() => {
          const date = startDate.toISOString().split('T')[0];
          const time = startDate.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })(),
        to: (() => {
          const date = endDate.toISOString().split('T')[0];
          const time = endDate.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })()
      };
       this.formatStartDate = String(startDate.getFullYear()) + '-'
         + (startDate.getMonth() < 9 ? '0' + String(startDate.getMonth() + 1) : String(startDate.getMonth() + 1)) + '-'
         + (startDate.getDate() < 10 ? '0' + String(startDate.getDate()) : String(startDate.getDate()));

       this.formatEndDate = String(endDate.getFullYear()) + '-'
         + (endDate.getMonth() < 9 ? '0' + String(endDate.getMonth() + 1) : String(endDate.getMonth() + 1)) + '-'
         + (endDate.getDate() < 10 ? '0' + String(endDate.getDate()) : String(endDate.getDate()));

      this.startDate = startDate;
      this.endDate = endDate;
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    expandRow(rowClicked) {
      if (!rowClicked.value)
        return;
      let isRowExpanded = this.expandedRows.find(row => row.id === rowClicked.id);
      if (!!isRowExpanded) {
        this.expandedRows = this.expandedRows.filter(row => row.id !== rowClicked.id);
        rowClicked.checked = undefined;
      } else {
        this.expandedRows.push(rowClicked);
        rowClicked.checked = true;
      }
    },
    rowTableClasses(row) {
      let classes = [];
      classes.push('row-access-log')
      if (!!row.checked)
        classes.push('row-checked-access-log');
      return classes.join(" ");
    },
    getColorByType(type) {
      let obj = {
        SUCCESS_LOGIN: "#28a745",
        LOGOUT: "#007bff",
        SESSION_EXPIRED: "#ffc107",
        WRONG_LOGIN: "#dc3545",
        SUCCESS_LOGIN_MFA: "#28a745",
        SUCCESS_REGISTER_MFA: "#28a745",
        WRONG_LOGIN_MFA: "#dc3545",
        WRONG_REGISTER_MFA: "#dc3545",
        CREATE_USER: "#17a2b8",
        UPDATE_USER: "#ffc107",
        DELETE_USER: "#dc3545",
        USER_BLOCKED: '#FF0000',
        IP_ADDRESS_BLOCKED: '#FFA500',
        SUCCESS_RESET_PASSWORD: '#008000',
        WRONG_RESET_PASSWORD: '#FFC0CB',
      };
      return obj[type];
    },
    getDateWithCorrectFormat(date) {
      return dateService.getDateSetWithCurrentTimezone(date, this.languageChosen);
    },
    getDatePickerLanguage() {
      return dateService.getBCP74Tag(this.languageChosen);
    }
  },
  watch: {
    startDate(newVal) {
      if (!!this.firstFetchDone) {
        let fromDate = new Date(newVal);
        fromDate.setHours(0, 0, 0, 1);
        this.periodFilter.from = (() => {
          const date = fromDate.toISOString().split('T')[0];
          const time = fromDate.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })();
        this.fetchData();
      }
    },
    endDate(newVal) {
      if (!!this.firstFetchDone) {
        let toDate = new Date(newVal);
        toDate.setHours(23, 59, 59, 59);
        this.periodFilter.to = (() => {
          const date = toDate.toISOString().split('T')[0];
          const time = toDate.toISOString().split('T')[1].substring(0, 8);
          return `${date} ${time}`
        })();
        this.fetchData();
      }
    },
    menuFilters(newVal) {
      if (newVal) {
        this.changesAreValid = false
        this.filterIpsWhenOpenedMenu = this.ipFilter;
        this.filterTypeWhenOpenedMenu = this.typeFilter;
        this.filterUsernameWhenOpenedMenu = this.usernameFilter;
      } else {
        if (!this.changesAreValid) {
          this.ipFilter = this.filterIpsWhenOpenedMenu;
          this.typeFilter = this.filterTypeWhenOpenedMenu;
          this.usernameFilter = this.filterUsernameWhenOpenedMenu;
        }
      }
    }
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style scoped>

.v_text_field_datetime{
  font-size: 13px;
}

.icons{
  margin-right: 2vh;
  font-size: 20px
}

.row-checked-access-log {
  background-color: #63adf2 !important;
}

.row-access-log {
  cursor: pointer;
}
</style>
