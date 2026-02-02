import "i18next";
import translation from "../i18n/translations.en.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof translation;
    };
  }
}

export {};
