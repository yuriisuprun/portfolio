import { NavLink } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
    { to: "/home", label: { en: "Home", it: "Home" } },
    { to: "/about", label: { en: "About", it: "Chi Sono" } },
    { to: "/projects", label: { en: "Projects", it: "Progetti" } },
    { to: "/contacts", label: { en: "Contacts", it: "Contatti" } },
];

const ICONS = { sun: "☀️", moon: "🌙" };

const Navbar = ({ dark, setDark, language, setLanguage }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isEnglish = language === "en";

    return (
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-300 dark:border-terminal gap-4 sm:gap-0">
            <NavLink
                to="/home"
                className="font-bold text-xl text-gray-900 dark:text-green-400">
                YS.
            </NavLink>

            <button
                className="sm:hidden text-lg border px-2 py-1 dark:border-green-400"
                aria-label="Toggle menu"
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                onClick={() => setMenuOpen(!menuOpen)}>
                ☰
            </button>

            <div id="nav-menu"
                className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:w-auto transition-all duration-200 ${
                    menuOpen ? "block" : "hidden sm:flex"
                }`}>
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            isActive
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "text-gray-500 hover:text-black dark:hover:text-white"
                        }>
                        {isEnglish ? item.label.en : item.label.it}
                    </NavLink>
                ))}

                <button type="button"
                    onClick={() => setLanguage(isEnglish ? "it" : "en")}
                    className="border px-2 py-1 text-sm border-gray-400 dark:border-green-400"
                    aria-label={isEnglish ? "Switch to Italian" : "Switch to English"}>
                    {isEnglish ? "IT" : "EN"}
                </button>

                <button type="button"
                    onClick={() => setDark(!dark)}
                    className="text-lg"
                    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
                    {dark ? ICONS.sun : ICONS.moon}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;