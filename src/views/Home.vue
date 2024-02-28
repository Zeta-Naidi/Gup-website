<template>
  <div class="px-5" style="min-height: 90%">
    <v-tabs v-model="tab">
      <v-tab v-for="(tabElement, index) in tabs" :key="index">
        <v-icon class="mr-1">
          {{ tabElement.icon }}
        </v-icon>
        {{ tabElement.title }}
      </v-tab>
    </v-tabs>
    <v-divider></v-divider>
    <v-window
      v-model="tab"
      class="mt-3"
      :style="{'background-color': 'transparent !important', 'height': '100%'}"
      touchless
    >
      <v-window-item v-for="subTab in tabs" :key="subTab.name">
        <DevicesView
          v-if="user.type === 'MDM' && subTab.name === 'devices'"
          :isTabFocused="tabFocused === 'devices'"
          :windowHeight="windowHeight"
          style="min-height: 80vh;"
        />
        <ProfilesView
          v-if="user.type === 'MDM' && subTab.name === 'profiles'"
          :isTabFocused="tabFocused === 'profiles'"
          :windowHeight="windowHeight"
        />
        <Dashboard
          v-else-if="user.type === 'SIEM' && subTab.name === 'monitoring'"
          :windowHeight="windowHeight"
        />
        <StatisticAnalysis
           v-else-if="user.type === 'SIEM' && subTab.name === 'operations'"
           :isTabFocused="tabFocused === 'operations'"
           :windowHeight="windowHeight"
        />
      </v-window-item>
    </v-window>
  </div>
</template>

<script>
import StatisticAnalysis from "@/components/home/operations/StatisticAnalysis.vue";
import ProfilesView from "@/components/home/uemProfile/ProfilesView.vue";
import DevicesView from "@/components/home/uemDevice/DevicesView.vue";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import Dashboard from "@/components/home/dashboard/Dashboard.vue";

export default {
  name: "Home",
  components: {
    Dashboard,
    StatisticAnalysis,
    ProfilesView,
    DevicesView
  },
  data: () => ({
    tab: 0,
    tabs: [
      {
        title: "Monitoring",
        name: "monitoring",
        icon: "mdi-gauge",
      },
      {
        title: "Operations",
        name: "operations",
        icon: "mdi-cog-stop-outline",
      },
      {
        title: "Profiles",
        name: "profiles",
        icon: "mdi-account-multiple-plus",
      },
      {
        title: "Devices",
        name: "devices",
        icon: "mdi-cellphone",
      },
    ],
    tabFocused: 'monitoring',
    modFilter: undefined,
    windowHeight: window.innerHeight,
    MDM_verify: 0
  }),
  props: {},
  created() {
    if(this.user.type === 'SIEM'){
      this.tabs = this.tabs.filter(el => !['profiles','devices'].includes(el.name))
    }
    else {
      //MDM
      this.tabs = this.tabs.filter(el => !['operations','monitoring'].includes(el.name))
    }
    if (this.user?.rolesUser?.modFilter)
      this.tabs = this.tabs.filter(el => this.user.rolesUser.modFilter === el.name)

  },
  mounted() {
    window.addEventListener('resize', () => {
      this.windowHeight = window.innerHeight;
    });
  },
  methods: {},
  computed: {
    ...mapState(useUserStore, ['user']),
  },
  watch: {
    tab(newVal) {
      this.tabFocused = this.tabs[newVal].name
    },
  }
};
</script>

<style>
.v-tabs .theme--dark {
  background-color: transparent !important;
}

.v-toolbar__content {
  padding: 0 !important;
}
</style>
