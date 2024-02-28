<template>
  <VSonner position="top-right"/>
</template>

<script>
import {toast, VSonner} from "vuetify-sonner";
import {mapState} from "pinia";
import {useAppStore} from "@/plugins/pinia/app";
import translateService from "@/globalServices/translate";
import GlobalEventsHandler from "@/globalServices/GlobalEventsHandler";

export default {
  name: "NotificationSnackbarShower",
  components: {
    VSonner,
  },
  created() {
    GlobalEventsHandler.addEventListener('showNotificationSnackbar', (e) => {
      const {message,color,icon} = e.detail;
      this.toast(message,color,icon);
    });
  },
  data: () => ({}),
  methods: {
    toast(message, color, icon){
      toast(this.getTranslation(message), {
        cardProps: {
          color: color,
          width: 380,
          class: 'mt-2',
        },
        cardTextProps: {
        },
        cardActionsProps: {
        },
        prependIcon: icon,
          prependIconProps: {
          // v-icon props
        }
        })
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
    ...mapState(useAppStore, ['languageChosen'])
  }
};
</script>
<style>
</style>

