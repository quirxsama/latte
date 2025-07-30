import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
import en from './locales/en.json';
import tr from './locales/tr.json';

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'latte_language',
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false,
    }
  });

export default i18n;
