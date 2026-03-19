import {useEffect, useState} from "react";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";
import SEO from "./components/SEO";

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
                        <Route
                            path="/home"
                            element={
                                <>
                                    <SEO
                                        title={language === "en" ? "Home - Yurii Suprun" : "Home - Yurii Suprun"}
                                        description={
                                            language === "en"
                                                ? "Yurii Suprun - Software Engineer, creating interactive and scalable web solutions."
                                                : "Yurii Suprun - Ingegnere del software, creo soluzioni web interattive e scalabili."
                                        }
                                        keywords="software engineer, portfolio, Yurii Suprun, web development"
                                    />
                                    <Hero language={language}/>
                                </>
                            }
                        />
                        <Route
                            path="/about"
                            element={
                                <>
                                    <SEO
                                        title={language === "en" ? "About Me - Yurii Suprun" : "Chi Sono - Yurii Suprun"}
                                        description={
                                            language === "en"
                                                ? "Learn more about Yurii Suprun, a software engineer skilled in full-stack development and cloud technologies."
                                                : "Scopri Yurii Suprun, ingegnere del software esperto in sviluppo full-stack e tecnologie cloud."
                                        }
                                        keywords="about, software engineer, Yurii Suprun, portfolio"
                                    />
                                    <About language={language}/>
                                </>
                            }
                        />
                        <Route
                            path="/projects"
                            element={
                                <>
                                    <SEO
                                        title={language === "en" ? "Projects - Yurii Suprun" : "Progetti - Yurii Suprun"}
                                        description={
                                            language === "en"
                                                ? "Explore projects by Yurii Suprun including GitHub repositories and web development works."
                                                : "Esplora i progetti di Yurii Suprun, inclusi repository GitHub e lavori di sviluppo web."
                                        }
                                        keywords="projects, GitHub, software development, Yurii Suprun"
                                    />
                                    <Projects language={language}/>
                                </>
                            }
                        />
                        <Route
                            path="/contacts"
                            element={
                                <>
                                    <SEO
                                        title={language === "en" ? "Contacts - Yurii Suprun" : "Contatti - Yurii Suprun"}
                                        description={
                                            language === "en"
                                                ? "Get in touch with Yurii Suprun for collaboration or project inquiries."
                                                : "Contatta Yurii Suprun per collaborazioni o richieste di progetto."
                                        }
                                        keywords="contact, email, Yurii Suprun, collaboration"
                                    />
                                    <Contacts language={language}/>
                                </>
                            }
                        />
                    </Routes>
                </main>
                <Footer language={language}/>
            </div>
        </div>
    );
}

export default App;