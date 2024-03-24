import { I18nOptions } from "vue-i18n";

const datetimeFormats: I18nOptions["datetimeFormats"] = {
  "en-US": {
    short: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    middle: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "2-digit",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    },
  },
  "it-IT": {
    short: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
    middle: {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
    },
    long: {
      year: "numeric",
      month: "long",
      day: "2-digit",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
    },
  },
};

export default datetimeFormats;
