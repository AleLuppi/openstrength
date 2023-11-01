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
import osSelect from "./components/basic/osSelect.vue";
import osTable from "./components/basic/osTable.vue";
import osTableSheet from "./components/basic/osTableSheet.vue";
import osToggleButtons from "./components/basic/osToggleButtons.vue";
import osVariableElement from "./components/basic/osVariableElement.vue";
import osWrapWithLines from "./components/basic/osWrapWithLines.vue";

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
app.component("osSelect", osSelect);
app.component("osTable", osTable);
app.component("osTableSheet", osTableSheet);
app.component("osToggleButtons", osToggleButtons);
app.component("osVariableElement", osVariableElement);
app.component("osWrapWithLines", osWrapWithLines);

// Add plugins
app.use(router).use(createPinia()).use(i18n).use(Quasar, quasarUserOptions);

// Mount the application
app.mount("#app");
