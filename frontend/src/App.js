import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Footer from "./components/Footer";

function App() {

    const [activeSection, setActiveSection] = useState("home");
    const [dark, setDark] = useState(false);

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
                <Navbar setActiveSection={setActiveSection} dark={dark} setDark={setDark} />
                <main className="flex-grow">
                    {activeSection === "home" && <Hero dark={dark} />}
                    {activeSection === "projects" && <Projects/>}
                    {activeSection === "about" && <About/>}
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default App;