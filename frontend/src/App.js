import {Navigate, Route, Routes} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";
import SEO from "./components/SEO";
import useDarkMode from "./hooks/useDarkMode";
import useLanguage from "./hooks/useLanguage";

function App() {
    const [dark, setDark] = useDarkMode();
    const [language, setLanguage] = useLanguage();

    return (
        <div
            className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-black dark:text-gray-200 transition-colors">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col flex-grow">
                <Navbar dark={dark} setDark={setDark} language={language} setLanguage={setLanguage}/>
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" replace/>}/>
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