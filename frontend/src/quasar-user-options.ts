import "./styles/quasar.scss";
import "@quasar/extras/roboto-font/roboto-font.css";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-symbols-outlined/material-symbols-outlined.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";
import { Notify } from "quasar";

// To be used on app.use(Quasar, { ... })
export default {
  config: {},
  plugins: { Notify },
};
