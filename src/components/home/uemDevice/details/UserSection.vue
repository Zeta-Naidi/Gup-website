<template>
  <div>
    <v-container>
      <v-row no-gutters class="userSection d-flex justify-center">
        <v-col cols="12" sm="12">
          <v-sheet class="ma-2 pa-2 sheet">
            <template>
              <v-card class="section justify-center" elevated="20" v-for="(user, index) in users " :key="index">
                <!-- TODO: REFACTOR GETUSERIMG -->
                <img :src="getUserImg(user['Sid']).src" :alt="getUserImg(user['Sid']).alt"
                     :style="getUserImg(user['Sid']).style">
                <h3>
                  {{ user.DisplayName }}
                </h3>
                <span>{{ user.Sid }}</span>
                <v-icon :style="{ 'color': getStatusColor(user.IsLoggedIn) }">{{ user.IsLoggedIn ? 'mdi-lan-connect' :
                    'mdi-lan-disconnect' }}</v-icon>

                <!-- <div v-if="userSection.section === 'AVATAR'">
                  <img :src="user.avatar ? user.avatar : userSection.keys.src" :style="userSection.keys.style"
                    :alt="userSection.keys.alt" />
                </div>
                <v-divider></v-divider>

                <div v-if="userSection.section === 'DETAILS'">
                  <v-list>
                    <v-list-item v-for="(value, key) in userSection.keys" :key="`item-${key}`">
                      <span class="listValue">{{
                        getTranslation(value)
                      }}</span>
                      {{
                        getTranslation(this.user[key])
                      }}
                    </v-list-item>
                  </v-list>
                </div> -->
              </v-card>
            </template>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "UserSection",
  props: {
    data: {
      type: Object,
      required: true,
      default: [],
    },
    currentDevice: {
      type: Object,
      // required: true,
      default: {},
    },
  },
  data() {
    return {
      device: {
        "deviceId": 34,
        "deviceName": "DESKTOP-V1DDC9F",
        "modelName": "VirtualBox",
        "modelDevice": "VirtualBox",
        "vendorId": "8870C07893D2910172FB18779A33FBD43AF929EB82ED2AE25C72363B74622B76",
        "udid": "A7710B12213FDE42BD165C997C70E8D0",
        "usersList": [
          {
            "Sid": "S-1-12-1-664005012-1339673011-2454397844-2923814922",
            "DisplayName": "FedericaAiello",
            "IsLoggedIn": false
          },
          {
            "Sid": "S-1-5-21-938365551-4169992982-207680662-1001",
            "DisplayName": "XnoovaAdmin",
            "IsLoggedIn": true
          },
          {
            "Sid": "S-1-5-21-938365551-4169992982-207680662-1002",
            "DisplayName": "XnoovaUser",
            "IsLoggedIn": false
          },
          {
            "Sid": "S-1-5-21-938365551-4169992982-207680662-1004",
            "DisplayName": "XnoovaAdminDefault",
            "IsLoggedIn": true
          },
          {
            "Sid": "S-1-5-21-938365551-4169992982-207680662-1005",
            "DisplayName": "Test",
            "IsLoggedIn": false
          }
        ],
      },
      users: [],
      usersImg: [{
        "Sid": "S-1-12-1-664005012-1339673011-2454397844-2923814922",
        "section": "AVATAR",
        "title": "AVATAR",
        "keys": {
          "src": "https://placehold.co/180x180",
          "style": "width: 180px",
          "alt": "Avatar utente",
        },
      },
        {
          "Sid": "S-1-5-21-938365551-4169992982-207680662-1001", "section": "AVATAR",
          "section": "AVATAR",
          "title": "AVATAR",
          "keys": {
            "src": "https://placehold.co/180x180",
            "style": "width: 180px",
            "alt": "Avatar utente",
          },
        },
        {
          "Sid": "S-1-5-21-938365551-4169992982-207680662-1002", "section": "AVATAR",
          "section": "AVATAR",
          "title": "AVATAR",
          "keys": {
            "src": "https://placehold.co/180x180",
            "style": "width: 180px",
            "alt": "Avatar utente",
          },
        },
        {
          "Sid": "S-1-5-21-938365551-4169992982-207680662-1004", "section": "AVATAR",
          "section": "AVATAR",
          "title": "AVATAR",
          "keys": {
            "src": "https://placehold.co/180x180",
            "style": "width: 180px",
            "alt": "Avatar utente",
          },
        },
        {
          "Sid": "S-1-5-21-938365551-4169992982-207680662-1005", "section": "AVATAR",
          "section": "AVATAR",
          "title": "AVATAR",
          "keys": {
            "src": "https://placehold.co/180x180",
            "style": "width: 180px",
            "alt": "Avatar utente",
          },
        }]
    };
  },
  watch: {
  },
  created() {
    this.user = this.data.user;
  },
  mounted() {
    this.getUsers();
  },
  setup() {
    const appStore = useAppStore();

    return {
      languageChosen: appStore.languageChosen,
    };
  },
  methods: {
    getUsers() {
      this.users.push(...this.device["usersList"]);
    },
    getUserImg(sid) {
      let coso = this.usersImg.filter(userImg => userImg["Sid"] === sid)[0];
      return coso.keys;
    },
    getStatusColor(isOnline) {
      return isOnline ? 'green' : 'red';
    },
    getTranslation(key) {
      let result = translateService.getTranslation(this.languageChosen, key);
      if (!result)
        return key;
      else
        return result
    },
    // computeListItems() {
    //   if (this.users && this.users[0]) {
    //     this.user["id"] = this.users[0].id;
    //     this.user["nameSurname"] =
    //       this.users[0].name + " " + this.users[0].surname;
    //     this.user["username"] = this.users[0].email.replace("@xnoova.com", "");
    //     this.user["lastActivity"] = this.users[0].lastActivity
    //       ? this.users[0].lastActivity
    //       : this.getTranslation(
    //         "NOT_AVAILABLE",
    //         this.languageChosen
    //       );
    //   }
    // },
  },
};
</script>
<style scoped lang="scss">
.userSection {
  .sheet {
    display: flex;
    flex-flow: row wrap;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 1rem;
    /* background-color: rgb(250, 250, 248);
    box-shadow: inset 0 0 15px rgba(55, 84, 170, 0),
      inset 0 0 20px rgba(255, 255, 255, 0),
      10px 10px 18px rgba(55, 84, 170, 0.15), -10px -10px 22px white,
      inset 0px 0px 4px rgba(255, 255, 255, 0.2); */
    border-radius: 0.5rem;
  }

  .section {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: rgba(250, 250, 250, 0.1);
    /* border-radius: 1rem; */
    box-shadow: inset 0 0 15px rgba(55, 84, 170, 0),
    inset 0 0 20px rgba(255, 255, 255, 0),
    0 0 10px rgba(250, 250, 250, 0.1),
    inset 0px 0px 4px rgba(255, 255, 255, 0.2);
    flex: 0 0 32%;

    &>* {
      margin-bottom: 1rem;
    }

    /* &:first-child {
      margin-bottom: 2rem;
    } */
  }

  .listValue {
    font-weight: 600;

    &__icon {
      margin-right: 0.5rem;
    }
  }
}
</style>
