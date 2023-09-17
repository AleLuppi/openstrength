/***** Imports *****/
// Vue and related plugins
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";

// Additional styling and frontend management
import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options";
import i18n from "./i18n";

// Custom components to register
import osInput from "./components/basic/osInput.vue";
import osTable from "./components/basic/osTable.vue";

/***** Set constant global properties *****/
export const globalProperties = {};

/***** Build and start the application *****/
// Create the app
const app = createApp(App);

// Add global variables to be used in components
app.provide("globalProperties", globalProperties);
app.config.globalProperties.$globalProperties = globalProperties;

// Register components
app.component("osInput", osInput);
app.component("osTable", osTable);

// Add plugins
app.use(router).use(createPinia()).use(i18n).use(Quasar, quasarUserOptions);

// Mount the application
app.mount("#app");
