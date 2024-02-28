/**
 * plugins/router.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import pinia from "./pinia";
import vuetify from './vuetify'
import router from './router'

export function registerPlugins (app) {
  app.use(pinia);
  app.use(vuetify);
  app.use(router);
}
