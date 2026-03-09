import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

function App() {

    const [activeSection, setActiveSection] = useState("home");

    return (
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">

            <div className="max-w-6xl mx-auto px-6">

                <Navbar setActiveSection={setActiveSection} />

                {activeSection === "home" && <Hero/>}

                {activeSection === "projects" && <Projects/>}

                <Footer/>

            </div>

        </div>
    );
}

export default App;