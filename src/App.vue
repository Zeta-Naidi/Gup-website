<template>
  <v-app>
    <v-app-bar>
      <div
        class="d-flex align-center pr-5"
        style="width: 100%; height: 100%"
      >
        <div v-if="!!user.id" style="cursor: pointer" @click="$router.push({name: 'Home'})">
          <v-img
            src="@/assets/logoMsspBanner.png"
            max-height="100%"
            width="220"
            class="mb-3"
          ></v-img>
        </div>
        <v-spacer></v-spacer>
        <v-text-field
          id="globalSearchBar"
          v-if="!!user.id"
          variant="underlined"
          v-model="searchText"
          :hide-details="false"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 25px;"
          @focus="isSearchBarLarge = true"
          @blur="!searchText ? isSearchBarLarge = false : isSearchBarLarge = true"
          :label="getTranslation('INSERT_AT_LEAST_4_CHARACTERS')"
          :class="{
            'search-bar-fade-in': isSearchBarLarge
          }"
        >
        </v-text-field>
        <div v-if="!!user.id" class="divider"></div>
        <v-menu
          v-if="!!user.id"
          rounded
          location="bottom"
          :close-on-content-click="true"
          @click="burgerIconClicked"
        >
          <template v-slot:activator="{ props }">
            <div>
              <v-icon
                style="cursor: pointer"
                v-bind="props"
                :class="{
                  'opened-icon': iconMenu === 'mdi-menu',
                  'closed-icon': iconMenu === 'mdi-menu-open'
                }"
              >
                {{ iconMenu }}
              </v-icon>
            </div>
          </template>
          <v-card style="border-color: #63adf2; border-style: solid;width: 250px" border>
              <div class="mx-auto text-center my-3">
                <div v-if="user.type === 'SIEM'">
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'handleDevices'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('HANDLE_DEVICES') }}
                  </v-btn>
                </div>
                <div v-if="user.type === 'MDM'">
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'Tags'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('TAGS') }}
                  </v-btn>
                </div>
                <div v-if=" user.type === 'SIEM' && (!!user?.rolesUser?.accessLogsPermission || !!user?.rolesUser?.systemLogsPermission)">
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'logs'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('LOGS') }}
                  </v-btn>
                </div>
                <div v-if=" user.type === 'SIEM' && user.isAdmin">
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'distributorsHome'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('LIST_DISTRIBUTORS') }}
                  </v-btn>
                </div>
                <div v-if="user.isAdmin">
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'superAdminHome'}).catch(()=>{})"
                    style="width: 100%"
                  >
                    {{ getTranslation('SUPER_ADMIN_HOME') }}
                  </v-btn>
                </div>
                <div v-if="user.isAdmin || user?.rolesUser?.iamPermission">
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'handleUsers'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('HANDLE_USERS') }}
                  </v-btn>
                </div>
                <div v-if="user.type === 'SIEM' && user?.rolesUser?.configurationPermission">
                  <v-divider class="my-3"></v-divider>
                  <v-btn
                    depressed
                    rounded
                    flat
                    @click="$router.push({name: 'configurations'}).catch(()=>{})"
                    style="width: 90%"
                  >
                    {{ getTranslation('CONFIGURATIONS') }}
                  </v-btn>
                </div>
              </div>
          </v-card>
        </v-menu>
        <v-menu
          v-if="!!user.id"
          location="bottom"
          rounded
          :close-on-content-click="true"
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              color="primary"
              size="40"
              class="ml-5"
              style="cursor:pointer"
              v-bind="props"
            >
              <span class="white--text">{{ user.username.substring(0, 2).toUpperCase() }}</span>
            </v-avatar>
          </template>
          <v-card style="border-color: #63adf2; border-style: solid; width: 250px" border>
            <div class="justify-center">
              <div class="mx-auto text-center py-5">
                <v-avatar
                  color="primary"
                  class="mb-1"
                >
                  <span class="white--text text-h5">{{ user.username.substring(0, 2).toUpperCase() }}</span>
                </v-avatar>
                <h3>{{ user.username.toUpperCase() }}</h3>
                <v-divider class="my-3"></v-divider>
                <v-btn
                  depressed
                  rounded
                  flat
                  @click="$router.push({name: 'profile'}).catch(()=>{})"
                  style="width: 90%"
                >
                  {{ getTranslation('PROFILE') }}
                </v-btn>
                <v-divider class="my-3"></v-divider>
                <v-btn
                  depressed
                  rounded
                  flat
                  @click="logout"
                  style="width: 90%"
                >
                  Logout
                </v-btn>
                <v-divider class="my-3"></v-divider>
                <div class="d-flex px-5">
                  <LanguageSelector />
                  <v-spacer />
                  <v-switch
                    v-model="themeSwitchValue"
                    v-if="appMod === 'development'"
                    inset
                    prepend-icon="mdi-theme-light-dark"
                    color="primary"
                    hide-details="auto"
                    @click="toggleTheme"
                  >
                  </v-switch>
                </div>
              </div>
            </div>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
    <v-main>
      <router-view/>
      <GlobalSearchDialog
        v-if="!!isSearchBarLarge"
        @close="isSearchBarLarge = false; searchText = ''; childSearchText=''"
        :search-text="childSearchText"
        style="z-index: 999; position: absolute; top: 0; min-height: 100%; min-width:100%"
      />
      <confirm ref="confirm"></confirm>
      <dialog-loader ref="dialogLoader"></dialog-loader>
      <NotificationSnackbarShower></NotificationSnackbarShower>
    </v-main>

  </v-app>
</template>

<script>
import translateService from "@/globalServices/translate";
import GlobalSearchDialog from "@/components/appBar/GlobalSearchDialog.vue";
import LanguageSelector from "@/components/appBar/LanguageSelector.vue";
import utilsFunctions from "@/globalServices/utilsFunctions";
import DialogLoader from "./components/global/DialogLoader.vue";
import Confirm from "./components/global/Confirm.vue";
import {useAppStore} from "@/plugins/pinia/app";
import {useUserStore} from "@/plugins/pinia/user";
import {mapState} from "pinia";
import apiService from "@/globalServices/apiService";
import NotificationSnackbarShower from "@/components/global/NotificationSnackbarShower.vue";
import {useTheme} from "vuetify";

export default {
  name: "App",

  components: {
    NotificationSnackbarShower,
    LanguageSelector,
    GlobalSearchDialog,
    DialogLoader,
    Confirm,
  },
  data() {
    return {
      languages: [
        {name: "it", image: "@/assets/images/italyFlag.jpeg"},
        {name: "en", image: "@/assets/images/ukFlag.png"},
        {name: "de", image: "@/assets/images/germanyFlag.jpeg"},
        {name: "es", image: "@/assets/images/spainFlag.jpeg"},
      ],
      loadingButton: false,
      iconMenu: 'mdi-menu',
      searchIconClicked: false,
      isSearchBarLarge: false,
      searchText:'',
      childSearchText: '',
      appMod: import.meta.env.VITE_APP_MOD,
      theme: useTheme(),
      themeSwitchValue: false,
    };
  },
  mounted() {
    this.$root.$confirm = this.$refs.confirm.open;
    this.$root.$dialogLoader = this.$refs.dialogLoader;
  },
  methods: {
    toggleTheme() {
      this.themeSwitchValue = !this.themeSwitchValue;
      this.theme.global.name = this.themeSwitchValue ? 'light' : 'dark';
    },
    async logout() {
      try {
        this.loadingButton = true;
        const response = await apiService.axiosToBackend().post( "/api/user/logout");
        if (response.status === 204) {
          (useUserStore()).setCredentials(null);
          this.$router.push({name: 'Login'});
        }
        this.loadingButton = false;
      } catch (error) {
        this.loadingButton = false;
        utilsFunctions.handleServerResponseException(error);
      }
    },
    burgerIconClicked() {
      if (this.iconMenu === 'mdi-menu')
        this.iconMenu = 'mdi-menu-open';
      else
        this.iconMenu = 'mdi-menu';
    },
    searchTextChanged(newVal){
      this.childSearchText = this.searchText;
      /*      if(!newVal){
              this.isSearchBarLarge = false;
              document.getElementById('globalSearchBar').blur();
            }*/
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
  },
  watch:{
    searchText(newVal){
      this.$nextTick(() => this.searchTextChanged(newVal))
    },
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }
};
</script>

<style scoped>
.divider {
  width: 2px;
  background-color: #ccc;
  height: 50%;
  margin-right: 20px;
  margin-left: 20px;
}

.closed-icon {
  transform-origin: center;
  transform: rotate(-90deg);
}
.opened-icon{
  transform-origin: center;
  transform: rotate(180deg);
}
.search-bar-fade-in {
  animation: fadeInRightToLeft 0.7s forwards;
  transform-origin: 100% 50%;
  max-width: 25% !important;
  margin-top: 20px;
}

@keyframes fadeInRightToLeft {
  0% {
    transform: scaleX(0%);
  }
  100% {
    transform: scaleX(100%);
  }
}
</style>
