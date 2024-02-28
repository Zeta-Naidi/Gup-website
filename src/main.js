/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

const start = window.performance.now();
// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

const app = createApp(App)


//Pinia
import pinia from "@/plugins/pinia";


import utilsFunctions from "@/globalServices/utilsFunctions";

// Restore state after reload
const savedState = sessionStorage.getItem("piniaAppState");
if (savedState) {
    pinia.state.value = JSON.parse(savedState);
}

// Save state before unload
window.addEventListener("beforeunload", () => {
    sessionStorage.setItem("piniaAppState", JSON.stringify(pinia.state.value));
});

registerPlugins(app)
app.mount("#app");

const end = window.performance.now();
const duration = end - start;
utilsFunctions.appReady(duration);
