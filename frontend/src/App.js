import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About"; // ← import About
import Footer from "./components/Footer";

function App() {
    const [activeSection, setActiveSection] = useState("home");

    return (
        <div className="min-h-screen flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
            <div className="max-w-6xl mx-auto px-6 w-full flex flex-col flex-grow">
                <Navbar setActiveSection={setActiveSection} />
                <main className="flex-grow">
                    {activeSection === "home" && <Hero />}
                    {activeSection === "projects" && <Projects />}
                    {activeSection === "about" && <About />}
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default App;