import { useI18n } from "vue-i18n";
import supportedLocales from "src/i18n/supportedLocales";

/**
 * Set project locale.
 *
 * @param locale current locale that shall be set for the project.
 */
export function setLocale(locale: string) {
  const i18n = useI18n();
  i18n.locale.value = locale;
}

/**
 * Get a list of supported locales.
 *
 * @returns the list of supported locales.
 */
export function getSupportedLocales() {
  const annotatedLocales = [];

  for (const [code, name] of Object.entries(supportedLocales)) {
    annotatedLocales.push({
      code: code,
      name: name,
    });
  }

  return annotatedLocales;
}

/**
 * Check if a locale is supported.
 *
 * @param locale locale whose support shall be checked.
 * @returns true if locale is supported, false otherwise.
 */
export function isLocalesSupported(locale: string) {
  return Object.keys(supportedLocales).includes(locale);
}

/**
 * Get preferred locale from browser.
 *
 * @param countryCodeOnly if true, only country code is returned, otherwise full locale name.
 * @returns code of preferred locale from browser.
 */
export function getBrowserLocale(countryCodeOnly = false) {
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language;

  if (!navigatorLocale) return undefined;

  const trimmedLocale = countryCodeOnly
    ? navigatorLocale.trim().split(/-|_/)[0]
    : navigatorLocale.trim();

  return trimmedLocale;
}

/**
 * Get the preferred locale according to browser locale if supported.
 *
 * @returns preferred browser locale if supported, undefined otherwise.
 */
export function getPreferredLocale() {
  const browserLocale = getBrowserLocale();

  if (browserLocale && isLocalesSupported(browserLocale)) return browserLocale;

  return undefined;
}
