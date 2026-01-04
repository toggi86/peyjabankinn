import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import is from "./locales/is.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      is: { translation: is },
    },
    fallbackLng: "is",
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "language",
      caches: ["localStorage"],
    },
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("initialized", () => {
  const storedLang = localStorage.getItem("language");

  if (!storedLang) {
    i18n.changeLanguage("is");
    localStorage.setItem("language", "is");
  }
});

export default i18n;
