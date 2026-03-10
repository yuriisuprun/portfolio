import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Footer from "./components/Footer";
import Contacts from "./components/Contacts";

function App() {
    const [activeSection, setActiveSection] = useState("home");
    const [dark, setDark] = useState(false);
    const [language, setLanguage] = useState("en");

    useEffect(() => {
        if (dark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [dark]);

    return (
        <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto px-6 w-full flex flex-col flex-grow">

                <Navbar
                    setActiveSection={setActiveSection}
                    dark={dark}
                    setDark={setDark}
                    language={language}
                    setLanguage={setLanguage}
                />

                <main className="flex-grow">
                    {activeSection === "home" && <Hero language={language} />}
                    {activeSection === "about" && <About language={language} />}
                    {activeSection === "projects" && <Projects language={language} />}
                    {activeSection === "contacts" && <Contacts language={language} />}
                </main>

                <Footer language={language} />
            </div>
        </div>
    );
}

export default App;