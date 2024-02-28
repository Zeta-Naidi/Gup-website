<template>
  <div class="pa-5">
    <v-card class="mt-2">
      <v-card-title class="py-5">
        <div class="d-flex align-center" style="min-width: 100%">
          {{ getTranslation("USERS_LIST") }}
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="AddUserDialogOpen">
            {{ getTranslation("ADD_USER") }}
          </v-btn>
        </div>
      </v-card-title>
      <v-data-table
        :headers="tableHeaders"
        :items="tableItems"
        height="70vh"
        :loading="loadingUsers"
        :footer-props="{
            'items-per-page-text': getTranslation('ROWS_PER_PAGE'),
            'show-current-page': true,
            'show-first-last-page': true,
            'items-per-page-options': [1,10, 20, 50],
          }"
        mobile-breakpoint="0"
        :options.sync="optionsPagination"
        :server-items-length="totalRows"
        @update:options="updatePagination"
      >
        <template v-slot:header.username>
          {{ getTranslation("USERNAME") }}
        </template>
        <template v-slot:header.email>
          {{ getTranslation("EMAIL") }}
        </template>
        <template v-slot:header.relationship>
          {{ getTranslation("RELATIONSHIP") }}
        </template>
        <template v-slot:header.isMfaActive>
          {{ getTranslation("IS_MFA_ACTIVE") }}
        </template>
        <template v-slot:header.permissions>
          {{ getTranslation("PERMISSIONS") }}
        </template>
        <template v-slot:header.actions>
          {{ getTranslation("ACTIONS") }}
        </template>
        <template v-slot:item.username="{ item }">
          <v-chip close close-icon="mdi-account">
            {{ item.username }}
          </v-chip>
        </template>
        <template v-slot:item.email="{ item }">
          <v-chip close close-icon="mdi-email">
            {{ item.email }}
          </v-chip>
        </template>
        <template v-slot:item.relationship="{ item }">
          <v-chip close close-icon="mdi-relation-one-to-one">
            {{ getTranslation(item.relationship.toUpperCase()) }}
          </v-chip>
        </template>
        <template v-slot:item.permissions="{ item }">
          <div class="d-flex align-center justify-space-around">
            <v-tooltip :text="getTranslation('SYSTEM_LOGS_PERMISSION')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" v-if="!!item.rolesUser.systemLogsPermission"
                >mdi-application-cog-outline
                </v-icon>
              </template>
            </v-tooltip>
            <v-tooltip :text="getTranslation('ACCESS_LOGS_PERMISSION')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  v-if="!!item.rolesUser.accessLogsPermission"
                >mdi-account-card-outline
                </v-icon>
              </template>
            </v-tooltip>
            <v-tooltip :text="getTranslation('ACCESS_LOGS_PERMISSION')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-bind="props"
                  v-if="!!item.rolesUser.iamPermission"
                >
                  mdi-account-cog
                </v-icon>
              </template>
            </v-tooltip>
            <v-tooltip :text="getTranslation('CONFIGURATION_PERMISSION')" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon
                  v-if="!!item.rolesUser.configurationPermission"
                  v-bind="props"
                >
                  mdi-cog
                </v-icon>
              </template>
            </v-tooltip>
          </div>
        </template>
        <template v-slot:item.isMfaActive="{ item }">
          <div class="d-flex align-center">
            <v-switch
              :input-value="item.isMfaActive"
              hide-details="auto"
              readonly
              disabled
            ></v-switch>
          </div>
        </template>
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-icon
              class="icons"
              v-if="user.id !== item.id"
              color="primary"
              @click="editUser(item)"
            >mdi-pencil
            </v-icon>

            <v-icon
              class="icons"
              v-if="user.id !== item.id"
              color="red"
              @click="deleteUser(item)"
            >mdi-trash-can
            </v-icon>
          </div>
        </template>
      </v-data-table>
    </v-card>
    <AddUserDialog
      v-model="isAddUserDialogOpen"
      :test="true"
      @close="isAddUserDialogOpen = false"
      @userRegistered="
        fetchUsers();
        isAddUserDialogOpen = false;
      "
    ></AddUserDialog>
    <EditUserDialog
      v-model="isEditUserDialogOpen"
      :user-selected="userToBeEdited"
      @userUpdated="
        fetchUsers();
        isEditUserDialogOpen = false;
      "
      @close="isEditUserDialogOpen = false"
    ></EditUserDialog>
    <ConfirmDeleteUserDialog
      v-model="isDeleteUserDialogOpen"
      :user-selected="userToBeDeleted"
      @userDeleted="
        fetchUsers();
        isDeleteUserDialogOpen = false;
      "
      @close="isDeleteUserDialogOpen = false"
    ></ConfirmDeleteUserDialog>
  </div>
</template>

<script>
import AddUserDialog from "@/components/Profile/AddUserDialog.vue";
import translateService from "@/globalServices/translate";
import EditUserDialog from "@/components/Profile/EditUserDialog.vue";
import ConfirmDeleteUserDialog from "@/components/Profile/ConfirmDeleteUserDialog.vue";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";
import {mapActions, mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";

export default {
  name: "Profile",
  components: {
    ConfirmDeleteUserDialog,
    EditUserDialog,
    AddUserDialog,
  },
  data: () => ({
    isAddUserDialogOpen: false,
    isEditUserDialogOpen: false,
    isDeleteUserDialogOpen: false,
    userToBeEdited: undefined,
    userToBeDeleted: undefined,
    tableHeaders: [
      {value: "username", sortable: true, width: "20%"},
      {value: "email", sortable: true, width: "20"},
      {value: "relationship", sortable: true, width: "20%"},
      {value: "permissions", sortable: true, width: "15%"},
      {value: "isMfaActive", sortable: false, width: "15%"},
      {value: "actions", sortable: false, width: "10%"},
    ],
    tableItems: [],
    loadingUsers: false,
    totalRows: 0,
    currentPage: 1,
    rowsPerPage: 1,
    lastPage: 0,
    orderBy: {attribute: "username", order: "asc"},
    optionsPagination: {},
  }),
  created() {
    this.fetchUsers();
  },
  methods: {
    AddUserDialogOpen() {
      this.isAddUserDialogOpen = true;
    },
    editUser(user) {
      this.userToBeEdited = user;
      this.isEditUserDialogOpen = true;
    },
    deleteUser(user) {
      this.userToBeDeleted = user;
      this.isDeleteUserDialogOpen = true;
    },
    async fetchUsers() {
      this.loadingUsers = true;
      //orderBy: this.orderBy,
      apiService.axiosToBackend().get("/api/user", {
        params: {
          filters: JSON.stringify({
            paginate: true,
            page: this.currentPage,
            rowsPerPage: this.rowsPerPage,
          }),
        },
      })
        .then((response) => {
          if (response?.data?.success) {
            this.tableItems = response.data.payload.data;
            this.currentPage = response.data.payload.current_page;
            this.totalRows = response.data.payload.total;
          }
          this.loadingUsers = false;
        })
        .catch((err) => {
          this.loadingUsers = false;
          console.log(err);
          //unauthorized case
          if (err.response && err.response.status === 401) {
            this.$router.push({name: "Login"}).catch(() => {
            });
            //...mapActions(useUserStore, ['setCredentials']);
          }
          //block case
          else if (err.response && err.response.status === 429) {
            // ...mapActions(useUserStore, ['setCredentials']);
            this.$router
              .push({
                name: "Login",
                params: {
                  redirectUserBlocked: true,
                },
              })
              .catch(() => {
              });
          }
        });
    },
    updatePagination(optionsPagination) {
      this.currentPage = optionsPagination.page;
      this.rowsPerPage = optionsPagination.itemsPerPage;
      if (optionsPagination.sortBy.length > 0)
        this.orderBy = optionsPagination.sortBy.map((el, index) => ({
          attribute: this.getCorrectAttributeName(el),
          order: !!optionsPagination.sortDesc[index] ? "desc" : "asc",
        }));
      else this.orderBy = [{attribute: "detectionDate", order: "desc"}];
      this.fetchUsers();
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result) return key;
      else return result;
    },
  },
  watch: {},
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }
};
</script>

<style scoped>

.icons {
  margin-right: 2vh;
  font-size: 20px
}
</style>
