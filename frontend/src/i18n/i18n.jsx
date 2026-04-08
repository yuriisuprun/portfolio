import React, {createContext, useContext, useMemo} from "react";
import { DEFAULT_LOCALE, coerceSupportedLocale } from "./locales";
import { MESSAGES } from "./messages";

function getByPath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[part];
  }
  return cur;
}

function createTranslator(locale) {
  const safeLocale = coerceSupportedLocale(locale, DEFAULT_LOCALE);
  const fallback = MESSAGES[DEFAULT_LOCALE];
  const catalog = MESSAGES[safeLocale] || fallback;

  const getValue = (key) => {
    const fromLocale = getByPath(catalog, key);
    if (fromLocale !== undefined) return fromLocale;
    return getByPath(fallback, key);
  };

  const t = (key) => {
    const value = getValue(key);
    if (typeof value === "string") return value;

    if (process.env.NODE_ENV !== "production") {
      // Surface missing/incorrect keys early in dev/tests.
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing string for key "${key}" (locale=${safeLocale})`);
    }
    return key;
  };

  const tArray = (key) => {
    const value = getValue(key);
    if (Array.isArray(value)) return value;

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing array for key "${key}" (locale=${safeLocale})`);
    }
    return [];
  };

  const tObject = (key) => {
    const value = getValue(key);
    if (value && typeof value === "object" && !Array.isArray(value)) return value;

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] Missing object for key "${key}" (locale=${safeLocale})`);
    }
    return {};
  };

  return { locale: safeLocale, t, tArray, tObject };
}

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
  tArray: () => [],
  tObject: () => ({}),
});

export function I18nProvider({ locale, setLocale, children }) {
  const translator = useMemo(() => createTranslator(locale), [locale]);

  const value = useMemo(
    () => ({
      locale: translator.locale,
      setLocale,
      t: translator.t,
      tArray: translator.tArray,
      tObject: translator.tObject,
    }),
    [setLocale, translator]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

// Convenience hook: allow components to accept an optional `language` prop override
// while moving the default source-of-truth to context.
export function useT(languageOverride) {
  const ctx = useI18n();
  const effectiveLocale = languageOverride ?? ctx.locale;
  return useMemo(() => createTranslator(effectiveLocale), [effectiveLocale]);
}
