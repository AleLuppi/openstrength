/***** Imports *****/
// Vue and related plugins
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// Additional styling and frontend management
import { Quasar } from "quasar";
import PrimeVue from "primevue/config";
import quasarUserOptions from "./quasar-user-options";
import i18n from "./i18n";

// Additional import for PrimeVue
import "primeflex/primeflex.css";
import "primevue/resources/themes/lara-light-blue/theme.css";
import "primevue/resources/primevue.min.css"; /* Deprecated */
import "primeicons/primeicons.css";

/***** Set constant global properties *****/
export const globalProperties = {};

/***** Build and start the application *****/
// Create the app
const app = createApp(App);

// Add global variables to be used in components
app.provide("globalProperties", globalProperties);
app.config.globalProperties.$globalProperties = globalProperties;

// Add plugins and start the application
app
  .use(router)
  .use(createPinia())
  .use(i18n)
  .use(Quasar, quasarUserOptions)
  .use(PrimeVue, { ripple: true });

app.mount("#app");
