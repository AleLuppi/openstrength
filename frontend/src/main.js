import { createApp } from 'vue'
import App from './App.vue'
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import router from './router'
import i18n from './i18n'

createApp(App).use(i18n).use(router).use(Quasar, quasarUserOptions).mount('#app')
