import {useEffect, useState} from "react";

const STORAGE_KEY = "darkMode";

export default function useDarkMode() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dark));
    }, [dark]);

    return [dark, setDark];
}