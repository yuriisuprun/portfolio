import {useEffect, useState} from "react";
import {Navigate, Route, Routes} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";

const STORAGE_KEYS = {
    darkMode: "darkMode",
    language: "language",
};

const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = new Set(["en", "it"]);

function readStoredBoolean(key, fallback = false) {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "boolean" ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function readStoredLanguage(key, fallback = DEFAULT_LANGUAGE) {
    const raw = localStorage.getItem(key);
    return raw && SUPPORTED_LANGUAGES.has(raw) ? raw : fallback;
}

function App() {
    const [dark, setDark] = useState(() =>
        readStoredBoolean(STORAGE_KEYS.darkMode, false)
    );
    const [language, setLanguage] = useState(() =>
        readStoredLanguage(STORAGE_KEYS.language, DEFAULT_LANGUAGE)
    );

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        localStorage.setItem(STORAGE_KEYS.darkMode, JSON.stringify(dark));
    }, [dark]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.language, language);
    }, [language]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-black dark:text-gray-200">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col flex-grow">
                <Navbar
                    dark={dark}
                    setDark={setDark}
                    language={language}
                    setLanguage={setLanguage}
                />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Navigate to="/home"/>}/>
                        <Route path="/home" element={<Hero language={language}/>}/>
                        <Route path="/about" element={<About language={language}/>}/>
                        <Route path="/projects" element={<Projects language={language}/>}/>
                        <Route path="/contacts" element={<Contacts language={language}/>}/>
                    </Routes>
                </main>
                <Footer language={language} />
            </div>
        </div>
    );
}

export default App;