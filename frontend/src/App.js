import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";

function App() {

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
      <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-black dark:text-gray-200">

        <div className="max-w-6xl mx-auto px-6 w-full flex flex-col flex-grow">

          <Navbar
              dark={dark}
              setDark={setDark}
              language={language}
              setLanguage={setLanguage}
          />

          <main className="flex-grow">

            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="/home" element={<Hero language={language} />} />
              <Route path="/about" element={<About language={language} />} />
              <Route path="/projects" element={<Projects language={language} />} />
              <Route path="/contacts" element={<Contacts language={language} />} />
            </Routes>

          </main>

          <Footer />

        </div>

      </div>
  );
}

export default App;
