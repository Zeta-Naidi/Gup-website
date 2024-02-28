class GlobalEventsHandler extends EventTarget {
  showNotificationSnackbar(color, message, icon) {
    //https://medium.com/@zandaqo/eventtarget-the-future-of-javascript-event-systems-205ae32f5e6b
    this.dispatchEvent(new CustomEvent('showNotificationSnackbar', {
      detail:{
        color: color,
        message: message,
        icon: icon
      },
    }));
  }
}
export default new GlobalEventsHandler()
