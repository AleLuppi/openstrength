import { boot } from "quasar/wrappers";
import { createI18n } from "vue-i18n";
import { getPreferredLocale } from "src/helpers/locales";

import messages from "src/i18n";
import datetimeFormats from "src/i18n/datetimeFormats";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const i18n = createI18n({
  legacy: false,
  locale: getPreferredLocale() || process.env.I18N_LOCALE || "en-US",
  fallbackLocale: process.env.I18N_FALLBACK_LOCALE || "en-US",
  messages: messages,
  datetimeFormats: datetimeFormats,
});

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});

export { i18n };
