<template>
  <v-dialog
      transition="dialog-bottom-transition"
      v-model="dialogChooseOSModal"
      :persistent="true"
      max-width="110vh"
  >
    <v-card max-height="100vh">
      <div class="modal-header" >
        <p class="text-h5 h5-header"> {{ getTranslation('SELECT_OPERATING_SYSTEM') }} </p>
      </div>
      <v-card-text>
        <div id="selectOs" style="text-align: center">
          <v-icon class="fa" @click="openDialog('Mixed')">mdi-asterisk</v-icon>
          <v-icon class="fa" @click="openDialog('Apple')">mdi-apple</v-icon>
          <v-icon class="fa" @click="openDialog('Android')" style="color: #3dda84">mdi-android</v-icon>
          <v-icon class="fa" @click="openDialog('Windows')" style="color: #0076FD">mdi-microsoft-windows</v-icon>
        </div>

      </v-card-text>
      <v-card-actions
          style="padding: 25px;">
        <v-spacer></v-spacer>
        <v-btn
            style="padding: 0px 30px;"
            color="primary"
            variant="outlined"
            @click="close"
        >
          CLOSE
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import translateService from "@/globalServices/translate";
import {useAppStore} from "@/plugins/pinia/app";

export default {
  name: "ChooseOSDialog",
  props: {
    dialogChooseOS: Boolean,
  },
  data: () => ({
    dialogChooseOSModal: false,
  }),
  created() {
    this.dialogChooseOSModal = this.dialogChooseOS;
  },
  computed: {
    languageChosen: {
      get() {
        // Use the languageChosen from the store
        return useAppStore().languageChosen;
      }
    },
  },
  methods: {
    getTranslation(key) {
        let result = translateService.getTranslation(this.languageChosen, key);
        if (!result)
            return key;
        else
            return result
    },
    openDialog(osType){
      this.$emit('openDialog', osType);
    },
    close(){
      this.$emit('closeDialog');
    }

  }
}
</script>

<style scoped>
#selectOs .fa{
  font-size: 10vh;
  line-height: 110px;
  cursor: pointer;
  width: 35vh;
  border-radius: 15px;
  text-align: center;
  padding: 19px 60px 40px 60px;
  margin: 0 15px;
  position: relative;
  display: table-cell;
  height: 23vh;
  margin: 15px;
  display: inline-block;
  box-shadow: 0 5px 10px rgb(0 0 0 / 15%)
}
#selectOs .fa span,#selectOs .fab span,#selectFilterMethod .fab span,#selectFilterMethod .fa span {
  font-family: "Gotham","Segoe UI","Helvetica Neue",Helvetica,Arial,sans-serif;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 14px;
  color: #2c2c2c;
  line-height: 50px
}
#selectOs .fa:hover,#selectOs .fab:hover,#selectFilterMethod .fab:hover,#selectFilterMethod .fa:hover {
  color: white!important;
  background-color: #0059a9
}

#selectOs .fa:hover span,#selectOs .fab:hover span,#selectFilterMethod .fab:hover span,#selectFilterMethod .fa:hover span {
  color: white
}
</style>
