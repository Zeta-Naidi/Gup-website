import router from "@/plugins/router";
import {useUserStore} from "@/plugins/pinia/user";
import GlobalEventsHandler from "@/globalServices/GlobalEventsHandler";

class UtilsFunctions {

  constructor() {
  }

  appReady(duration){
    console.log('App ready in ' + duration + 'ms')
  }
  arraysAreEqual(array1, array2) {
    if(!Array.isArray(array1) || !Array.isArray(array2))
      return false;

    if (array1.length !== array2.length)
      return false;

    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }

  handleServerResponseException(err) {
    const userStore = useUserStore();
    //unauthorized case
    if (err?.response?.status === 400) {
      //SHOW PARAMETERS NOT CORRECT
      GlobalEventsHandler.showNotificationSnackbar('orange','BAD_PARAMETERS','mdi-alert');
    }
    else if (err?.response?.status === 401) {
      userStore.setCredentials(null);
      router.push({name: 'Login'}).catch(() => {})
    }
    //block case
    else if (err?.response?.status === 429) {
      userStore.setCredentials(null);
      router.push({
        name: 'Login',
        params: {
          redirectUserBlocked: true
        }
      }).catch(() => {
      })
    }
    else if (err?.response?.status === 500 ){
      GlobalEventsHandler.showNotificationSnackbar('red','SERVER_ERROR','mdi-alert');
    }
  }

  handleServerResponseSuccess(message) {
    GlobalEventsHandler.showNotificationSnackbar('primary',message,'mdi-checkbox-marked-circle-outline');
  }

} export default new UtilsFunctions()
