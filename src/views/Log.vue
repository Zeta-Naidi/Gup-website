<template>
  <div class="px-5">
    <div>
      <v-tabs v-model="tab">
        <v-tab v-for="(tabElement, index) in tabs" :key="index">
          <v-icon class="mr-3">
            {{ tabElement.icon }}
          </v-icon>
          {{ getTranslation(tabElement.title) }}
        </v-tab>
<!--        <v-tabs-slider></v-tabs-slider>-->
      </v-tabs>
      <v-divider></v-divider>
      <v-window
        v-model="tab"
        class="mt-3"
        :style="{ 'background-color': 'transparent !important' }"
        touchless
      >
        <v-window-item v-for="subTab in tabs" :key="subTab.name">
          <AccessLogTable
            v-if="subTab.name === 'accessLogs' && user?.rolesUser?.accessLogsPermission"
          />
          <SystemLogTable
            v-else-if="subTab.name === 'systemLogs' && user?.rolesUser?.systemLogsPermission"
            :isTabFocused="tabFocused === 'systemLogs'"
          />
          <AdministratorLogTable
            v-else-if="subTab.name === 'administratorLogs' && user?.rolesUser?.iamPermission"
            :isTabFocused="tabFocused === 'administratorLogs'"
          />
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script>
import AccessLogTable from "@/components/logsComponents/AccessLogTable.vue";
import SystemLogTable from "@/components/logsComponents/SystemLogsTable.vue";
import translateService from "@/globalServices/translate";
import AdministratorLogTable from "@/components/logsComponents/AdministratorLogTable.vue";
import {useAppStore} from "@/plugins/pinia/app";
import {useUserStore} from "@/plugins/pinia/user";
import {mapState} from "pinia";

export default {
  name: "Log",
  components: {SystemLogTable, AccessLogTable, AdministratorLogTable},
  data: () => ({
    tab: 0,
    tabs: [
      {
        title: 'ACCESS_LOGS',
        name: "accessLogs",
        icon: "mdi-account-card-outline",
      },
      {
        title: 'SYSTEM_LOGS',
        name: "systemLogs",
        icon: "mdi-application-cog-outline",
      },
      {
        title: 'ADMINISTRATOR_LOGS',
        name: "administratorLogs",
        icon: "mdi-shield-crown-outline",
      },
    ],
    tabFocused: 'accessLogs',
  }),
  created() {
    //TODO HANDLE FIRST VIEW HERE
    if(!this.user?.rolesUser?.accessLogsPermission)
      this.tabs = this.tabs.filter(el => el.title !== 'ACCESS_LOGS')
    if (!this.user?.rolesUser?.systemLogsPermission)
      this.tabs = this.tabs.filter(el => el.title !== 'SYSTEM_LOGS')
    if (this.user?.levelAdmin <= 1)
      this.tabs = this.tabs.filter(el => el.title !== 'ADMINISTRATOR_LOGS')

    this.tabFocused = this.tabs[0].name;
  },
  methods: {
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }
}
</script>

<style>

</style>
