/***** Imports *****/
// Vue and related plugins
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Additional styling and frontend management
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import i18n from './i18n'


/***** Set constant global properties *****/
export const appGlobals = {
};


/***** Build and start the application *****/
// Create the app
const app = createApp(App);

// Add global variables to be used in components
app.provide("appGlobals", appGlobals);
app.config.globalProperties.$appGlobals = appGlobals;

// Add plugins and start the application
app.use(Quasar, quasarUserOptions)
    .use(i18n)
    .use(router)
    .mount('#app')
