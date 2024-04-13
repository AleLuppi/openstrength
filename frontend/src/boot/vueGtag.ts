import { boot } from "quasar/wrappers";
import VueGtag from "vue-gtag";

export default boot(async ({ app }) => {
  app.use(VueGtag, {
    config: { id: "G-G8BLW1JL0M" },
    enabled: process.env.NODE_ENV == "production",
  });
});
