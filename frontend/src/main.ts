/***** Imports *****/
// Vue and related plugins
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import VueGtag from "vue-gtag";
import Hotjar from "vue-hotjar";
import mixpanel from "mixpanel-browser";

// Initialize mixpanel
mixpanel.init("1132ec256586f264683f340260fca53a", {
  debug: true,
  ignore_dnt: true,
  track_pageview: true,
  persistence: "localStorage",
});

// Additional styling and frontend management
import { Quasar } from "quasar";
import quasarUserOptions from "./quasar-user-options";
import i18n from "./i18n";
import VueSocialSharing from "vue-social-sharing";

// Custom components to register
import osButtonSupport from "./components/basic/osButtonSupport.vue";
import osField from "./components/basic/osField.vue";
import osInput from "./components/basic/osInput.vue";
import osSelect from "./components/basic/osSelect.vue";
import osSocialSharingItems from "./components/basic/osSocialSharingItems.vue";
import osTable from "./components/basic/osTable.vue";
import osTableSheet from "./components/basic/osTableSheet.vue";
import osTextCopyable from "./components/basic/osTextCopyable.vue";
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
app.component("osButtonSupport", osButtonSupport);
app.component("osField", osField);
app.component("osInput", osInput);
app.component("osSelect", osSelect);
app.component("osSocialSharingItems", osSocialSharingItems);
app.component("osTable", osTable);
app.component("osTableSheet", osTableSheet);
app.component("osTextCopyable", osTextCopyable);
app.component("osToggleButtons", osToggleButtons);
app.component("osVariableElement", osVariableElement);
app.component("osWrapWithLines", osWrapWithLines);

// Add plugins
app
  .use(router)
  .use(createPinia())
  .use(i18n)
  .use(Quasar, quasarUserOptions)
  .use(VueGtag, {
    config: { id: "G-G8BLW1JL0M" },
    enabled: process.env.NODE_ENV == "production",
  })
  .use(VueSocialSharing)
  .use(Hotjar, {
    id: "3825238",
    isProduction: process.env.NODE_ENV == "production",
  });

// Mount the application
app.mount("#app");
