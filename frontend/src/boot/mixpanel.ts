import { boot } from "quasar/wrappers";
import mixpanel from "mixpanel-browser";

export default boot(async () => {
  // Initialize mixpanel
  mixpanel.init("1132ec256586f264683f340260fca53a", {
    debug: process.env.NODE_ENV != "production",
    ignore_dnt: true,
    track_pageview: true,
    persistence: "localStorage",
  });
});
