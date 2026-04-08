import {useEffect, useState} from "react";
import {
    DEFAULT_LOCALE,
    coerceSupportedLocale,
    getPreferredLocaleFromNavigator,
} from "../i18n/locales";

const STORAGE_KEY = "language";

export default function useLanguage() {
    const [language, setLanguage] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return coerceSupportedLocale(stored, DEFAULT_LOCALE);
        return getPreferredLocaleFromNavigator(DEFAULT_LOCALE);
    });

    useEffect(() => {
        const safe = coerceSupportedLocale(language, DEFAULT_LOCALE);
        localStorage.setItem(STORAGE_KEY, safe);
        document.documentElement.lang = safe;
    }, [language]);

    return [language, setLanguage];
}
