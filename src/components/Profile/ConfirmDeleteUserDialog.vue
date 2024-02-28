<template>
  <v-dialog
    v-model="localValue"
    :persistent="true"
    max-width="50%"
    hide-overlay
  >
    <v-card>
      <v-card-title>
        <v-alert
          dense
          icon="mdi-alert-circle"
          outlined
          prominent
          color="red"
          type="error"
          style="width: 100%"
        >
          Remove user {{userSelected ? userSelected.username : ''}} ?
        </v-alert>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="ml-3" color="red" @click="$emit('close')">
          {{ getTranslation('CLOSE') }}
        </v-btn>
        <v-btn class="ml-3" color="primary" @click="deleteUser()">
          {{ getTranslation('DELETE') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import axios from "axios";
import {mapState} from "pinia";
import {useUserStore} from "@/plugins/pinia/user";
import {useAppStore} from "@/plugins/pinia/app";
import apiService from "@/globalServices/apiService";

export default {
  name: "ConfirmDeleteUserDialog",
  data: () => ({
    localValue: false,
  }),
  props: {
    value: {
      type: Boolean,
      default: false
    },
    userSelected:{
      type: Object,
      default: () => {}
    }
  },
  methods:{
    async deleteUser() {
      apiService.axiosToBackend().post("/api/user/delete/" + this.userSelected.id, {})
        .then((response) => {
          this.$emit('userDeleted');
        })
        .catch((err) => console.log(err));

    },
    getTranslation(key){
      let result = translateService.getTranslation(this.languageChosen,key);
      if(!result)
        return key;
      else
        return result
    },
  },
  watch: {
    value(newVal) {
      this.localValue = newVal;
    },
  },
  computed: {
    ...mapState(useUserStore, ['user']),
    ...mapState(useAppStore, ['languageChosen'])
  }


}
</script>

<style scoped>
*{
  font-size: 13px;
}

.v_text_field_datetime{
  font-size: 13px;
}

.icons{
  margin-right: 2vh;
  font-size: 20px
}

/* hide the "scrim", it's pointless */
.v-overlay--active .v-overlay__scrim {
  display: none;
}
/* style the overlay container as required */
.v-overlay--active {
  background: transparent;
}
/* if you have an auto dark theme
   for prefers-color-scheme: dark
   I find the 0.8 too dark
*/
@media (prefers-color-scheme: dark) {
  .v-overlay--active {
    background: transparent;
  }
}
</style>
