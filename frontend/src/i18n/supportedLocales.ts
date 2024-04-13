import messages from "src/i18n";

// Define supported locales with local names
const localesLocalName: { [key in keyof typeof messages]: string } = {
  "en-US": "English",
  "it-IT": "Italiano",
};

export default localesLocalName;
