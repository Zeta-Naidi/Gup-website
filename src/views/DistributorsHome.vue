<template>
  <div class="mx-5 mt-5">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loadingItems"
      :footer-props="footerProps"
    >
      <template v-slot:top>
        <v-toolbar class="px-2">
          <v-toolbar-title>{{ getTranslation('DISTRIBUTORS') }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="createItem">{{ getTranslation('ADD') }}</v-btn>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon v-if="appMod !== 'production'" @click="openConfirmMigrateDialog(item.database,'down')">mdi-database-arrow-down-outline</v-icon>
        <v-icon class="ml-5" @click="openConfirmMigrateDialog(item.database)">mdi-database-arrow-up-outline</v-icon>
      </template>
    </v-data-table>
    <v-btn color="primary" @click="openConfirmMigrateDialog(usersDatabaseName)" class="ma-5">
      {{ getTranslation('MIGRATE_USERS_DATABASE') }}
    </v-btn>
    <v-btn color="primary" @click="openConfirmMigrateDialog(usersDatabaseName,'down')" class="ma-5" v-if="appMod !== 'production'">
      {{ getTranslation('MIGRATE_DOWN_USERS_DATABASE') }}
    </v-btn>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card style="border-color: #63adf2; border-style: solid">
        <v-card-title><span class="title">{{ getTranslation('NEW_DISTRIBUTOR') }}</span></v-card-title>
        <v-card-text>
          <v-container>
            <v-select
              v-model="distributorToAdd"
              :label="getTranslation('DISTRIBUTORS')"
              :items="distributorsItems"
              item-text="companyName"
              return-object
              outlined
            />
            <v-switch
              v-model="connectionConfigSwitch"
              :label="getTranslation('CONNECTION')"
            />
          </v-container>
          <v-container v-if="connectionConfigSwitch">
            <v-text-field outlined type="text" id="host" label="Host"/>
            <v-text-field outlined type="text" id="port" label="Port"/>
            <v-text-field outlined type="text" id="username" label="Username"/>
            <v-text-field outlined type="password" id="password" label="Password"/>
            <v-text-field outlined type="text" id="unixSocket" label="Unix Socket"/>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" :loading="loadingButton" @click="close">{{ getTranslation('CANCEL') }}</v-btn>
          <v-btn color="primary" :loading="loadingButton" @click="create">{{ getTranslation('ADD') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="isConfirmMigrateDialogOpened"
      persistent
      max-width="600px"
    >
      <v-card style="border-color: #63adf2; border-style: solid">
        <v-card-title style="height: 2em">
          {{ getTranslation('CONFIRM_MIGRATE_DATABASE_MESSAGE') }}
        </v-card-title>
        <v-card-text style="height: 10em">
          <span>{{ 'Database: ' + databaseNameToMigrate }}</span>
          <br>
          <span>{{ getTranslation('MODALITY') + ': ' +(modalityMigration === 'up' ? getTranslation('UP') : getTranslation('DOWN')) }}</span>

        </v-card-text>
        <v-divider/>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" :loading="loadingButton" @click="isConfirmMigrateDialogOpened = false">
            {{ getTranslation('CANCEL') }}
          </v-btn>
          <v-btn color="primary" :loading="loadingButton" @click="migrateDatabase(databaseNameToMigrate, true)">
            {{ getTranslation('CONFIRM') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import axios from "axios";
import translateService from "@/globalServices/translate";
import utilsFunctions from "@/globalServices/utilsFunctions";
import apiService from "@/globalServices/apiService";
import {useAppStore} from "@/plugins/pinia/app";
import {useUserStore} from "@/plugins/pinia/user";
import {mapState} from "pinia";

export default {
  name: 'DistributorsHome',
  data() {
    return {
      loadingItems: false,
      headers: [
        {text: 'Distributor Name', align: 'start', sortable: true, value: 'distributorName'},
        {text: 'Database', value: 'database', sortable: true},
        {text: 'Actions', value: 'actions', sortable: false},
      ],
      items: [],
      dialog: false,
      editedIndex: -1,
      editedItem: {name: '',},
      defaultItem: {name: '',},
      footerProps: {
        itemsPerPageOptions: [5, 10],
        showCurrentPage: true,
        showFirstLastPage: true,
        showingItems: 'from-to-page',
        itemsPerPageText: 'Items per page',
      },
      host: null,
      port: null,
      username: null,
      password: null,
      unixSocket: null,
      distributorsItems: [],
      distributorToAdd: null,
      connectionConfigSwitch: false,
      loadingButton: false,
      isConfirmMigrateDialogOpened: false,
      databaseNameToMigrate: null,
      usersDatabaseName: null,
      modalityMigration: 'up',
      appMod: import.meta.env.APP_MOD,
    };
  },
  created() {
    this.fetchErmetixDistributors();
    this.fetchChimpaDistributors();
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  methods: {
    async fetchErmetixDistributors() {
      this.loadingItems = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/databaseConnection", {
            params: {}
          })
        if (response?.data?.success) {
          this.items = response.data.payload.distributors.map(el => ({...el, actions: true}))
          this.usersDatabaseName = response.data.payload.users;
        }
        this.loadingItems = false
      } catch (e) {
        this.loadingItems = false;
        utilsFunctions.handleServerResponseException(e);
      }
    },
    async fetchChimpaDistributors() {
      this.loadingItems = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/databaseConnection/chimpaDistributors", {
            params: {}
          })
        if (response?.data?.success)
          this.distributorsItems = response.data.payload;
        this.loadingItems = false
      } catch (e) {
        this.loadingItems = false;
        utilsFunctions.handleServerResponseException(e);
      }
    },
    async create() {
      this.loadingButton = true;
      try {
        let response = await apiService.axiosToBackend().get("/api/databaseConnection", {
            distributor: this.distributorToAdd,
            connection: !!this.connectionConfigSwitch ?
              {
                host: this.host,
                port: this.port,
                username: this.username,
                password: this.password,
                unixSocket: this.unixSocket
              }
              : null
          });
        if (response?.data?.success) {
          let databaseName = response.data.payload;
          let attempts = 0;
          let migrated = false
          while (attempts < 10 && !migrated) {
            migrated = await this.migrateDatabase(databaseName);
            attempts++;
          }
          if (attempts < 10)
            await this.fetchErmetixDistributors();
          else
            console.log('HANDLE_PROBLEM'); // TODO HANDLE PROBLEM
        }
        this.loadingButton = false
        this.dialog = false;
      } catch (e) {
        this.loadingButton = false;
        utilsFunctions.handleServerResponseException(e);
      }
    },
    async migrateDatabase(databaseName, handleLoadingButton = false) {
      try {
        if(handleLoadingButton)
          this.loadingButton = true;
        const response = await apiService.axiosToBackend().get("/api/databaseConnection/migrate", {
          databaseName: databaseName,
          mod: (import.meta.env.VUE_APP_MOD !== 'production') && this.modalityMigration
        });
        if (response?.data?.success) {
          if (handleLoadingButton)
            this.loadingButton = false;
          this.dialog = false;
          return true;
        } else return false
      } catch (err) {
        if (handleLoadingButton)
          this.loadingButton = false;
        utilsFunctions.handleServerResponseException(e);
        return false;

      }
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    createItem() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.dialog = true;
    },
    openConfirmMigrateDialog(databaseName, mod = 'up') {
      this.databaseNameToMigrate = databaseName;
      this.modalityMigration = mod;
      this.isConfirmMigrateDialogOpened = true;
    },
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
};

</script>
