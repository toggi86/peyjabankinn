import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import en from "./locales/en.json";
import is from "./locales/is.json";

i18n
  .use(LanguageDetector) // detect user language
  .use(initReactI18next) // pass i18n instance to react-i18next
  .init({
    resources: {
      en: { translation: en },
      is: { translation: is },
    },
    fallbackLng: "is",      // default language if detection fails
    debug: true,            // set to false in production
    interpolation: {
      escapeValue: false,   // react already escapes values
    },
  });

export default i18n;
