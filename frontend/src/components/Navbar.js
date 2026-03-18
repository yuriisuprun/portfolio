import { NavLink } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
    { to: "/home", label: { en: "home", it: "home" } },
    { to: "/about", label: { en: "about", it: "chi sono" } },
    { to: "/projects", label: { en: "projects", it: "progetti" } },
    { to: "/contacts", label: { en: "contacts", it: "contatti" } },
];

const ICONS = {
    sun: "\u2600\uFE0F",
    moon: "\uD83C\uDF19",
};

const getNavLinkClassName = ({ isActive }) =>
    isActive
        ? "font-semibold text-gray-900 dark:text-white"
        : "text-gray-500 hover:text-black dark:hover:text-white";

const Navbar = ({ dark, setDark, language, setLanguage }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const isEnglish = language === "en";

    // Event Handlers
    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const toggleDarkMode = () => setDark((prev) => !prev);
    const toggleLanguage = () => setLanguage((prev) => (prev === "en" ? "it" : "en"));

    const NavItem = ({ to, label }) => (
        <NavLink key={to} to={to} className={getNavLinkClassName}>
            {isEnglish ? label.en : label.it}
        </NavLink>
    );

    return (
        <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-300 dark:border-terminal gap-4 sm:gap-0">
            {/* Logo */}
            <NavLink to="/home" className="font-bold text-xl text-gray-900 dark:text-green-400">
                Yurii Suprun
            </NavLink>

            {/* Mobile Menu Toggle */}
            <div className="sm:hidden self-end">
                <button
                    onClick={toggleMenu}
                    className="text-lg border px-2 py-1 dark:border-green-400"
                    aria-label="Toggle menu"
                >
                    ☰
                </button>
            </div>

            {/* Navigation Items */}
            <div
                className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:w-auto transition-all duration-200 ${
                    menuOpen ? "block" : "hidden sm:flex"
                }`}
            >
                {NAV_ITEMS.map((item) => (
                    <NavItem key={item.to} to={item.to} label={item.label} />
                ))}

                {/* Language Switch */}
                <button
                    type="button"
                    onClick={toggleLanguage}
                    className="border px-2 py-1 text-sm border-gray-400 dark:border-green-400"
                    aria-label={isEnglish ? "Switch to Italian" : "Passa a inglese"}
                >
                    {isEnglish ? "IT" : "EN"}
                </button>

                {/* Dark Mode Switch */}
                <button
                    type="button"
                    onClick={toggleDarkMode}
                    className="text-lg"
                    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {dark ? ICONS.sun : ICONS.moon}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;