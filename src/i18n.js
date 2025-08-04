import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import tr from "./locales/tr/translation.json";
import de from "./locales/de/translation.json";
import it from "./locales/it/translation.json";
import fr from "./locales/fr/translation.json";
import es from "./locales/es/translation.json";
import pt from "./locales/pt/translation.json";

const LANG_STORAGE_KEY = "user-language";

const resources = {
  en: { translation: en },
  ru: { translation: ru },
  tr: { translation: tr },
  de: { translation: de },
  it: { translation: it },
  fr: { translation: fr },
  es: { translation: es },
  pt: { translation: pt },
};

const getInitialLanguage = async () => {
  const savedLang = await AsyncStorage.getItem(LANG_STORAGE_KEY);

  const locales = Localization.getLocales();
  const localeLang =
    locales && locales.length > 0 ? locales[0].languageCode : "en";

  const lang = ["en", "ru"].includes(savedLang)
    ? savedLang
    : ["en", "ru"].includes(localeLang)
    ? localeLang
    : "en";

  return lang;
};

export const initI18n = async () => {
  const lng = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    lng,
    fallbackLng: "en",
    resources,
    interpolation: {
      escapeValue: false,
    },
  });
};

export const changeLanguage = async (lang) => {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
};

export default i18n;
