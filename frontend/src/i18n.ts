import {
  createI18n,
  I18nOptions,
  LocaleMessages,
  VueMessageType,
} from "vue-i18n";
import { getPreferredLocale } from "@/helpers/locales";
import datetimeFormats from "@/locales/datetimeFormats";

/**
 * Load locale messages
 *
 * The loaded `JSON` locale messages is pre-compiled by `@intlify/vue-i18n-loader`, which is integrated into `vue-cli-plugin-i18n`.
 * See: https://github.com/intlify/vue-i18n-loader#rocket-i18n-resource-pre-compilation
 */
function loadLocaleMessages(): { [x: string]: LocaleMessages<VueMessageType> } {
  const locales = require.context(
    "./locales",
    true,
    /[A-Za-z0-9-_,\s]+\.json$/i,
  );
  const messages: { [x: string]: LocaleMessages<VueMessageType> } = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      const locale = matched[1];
      messages[locale] = locales(key).default;
    }
  });
  return messages;
}

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: getPreferredLocale() || process.env.VUE_APP_I18N_LOCALE || "en",
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || "en",
  messages: loadLocaleMessages(),
  datetimeFormats: datetimeFormats as I18nOptions["datetimeFormats"],
});
