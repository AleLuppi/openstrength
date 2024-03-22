import { boot } from "quasar/wrappers";
import VueGtag from "vue-gtag";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.use(VueGtag, {
    config: { id: "G-G8BLW1JL0M" },
    enabled: process.env.NODE_ENV == "production",
  });
});
