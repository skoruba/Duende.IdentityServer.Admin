import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import translation from "./translations.en.json";

const getStoredLanguage = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language");
  }
  return null;
};

i18next.use(initReactI18next).init({
  lng: getStoredLanguage() || "en",
  fallbackLng: "en",
  debug: process.env.NODE_ENV !== "production",
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation },
  },
});

export default i18next;
