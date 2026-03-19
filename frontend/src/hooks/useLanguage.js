import { useEffect, useState } from "react";

const STORAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED = new Set(["en", "it"]);

export default function useLanguage() {
    const [language, setLanguage] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored && SUPPORTED.has(stored) ? stored : DEFAULT_LANGUAGE;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, language);
    }, [language]);

    return [language, setLanguage];
}