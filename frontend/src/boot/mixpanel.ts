import { boot } from "quasar/wrappers";
import mixpanel from "mixpanel-browser";

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // Initialize mixpanel
  mixpanel.init("1132ec256586f264683f340260fca53a", {
    debug: process.env.NODE_ENV != "production",
    ignore_dnt: true,
    track_pageview: true,
    persistence: "localStorage",
  });
});
