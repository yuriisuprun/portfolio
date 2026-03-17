import {NavLink} from "react-router-dom";
import {useState} from "react";

export default function Navbar({dark, setDark, language, setLanguage}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const isEnglish = language === "en";

    const NAV_ITEMS = [
        {to: "/home", label: {en: "home", it: "home"}},
        {to: "/about", label: {en: "about", it: "chi sono"}},
        {to: "/projects", label: {en: "projects", it: "progetti"}},
        {to: "/contacts", label: {en: "contacts", it: "contatti"}},
    ];

    const ICON_SUN = "\u2600\uFE0F";
    const ICON_MOON = "\uD83C\uDF19";

    const navLinkClassName = ({isActive}) =>
        isActive
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-500 hover:text-black dark:hover:text-white";

    return (
        <nav
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-300 dark:border-terminal gap-4 sm:gap-0">
            <NavLink
                to="/home"
                className="font-bold text-xl text-gray-900 dark:text-green-400"
            >
                YS.
            </NavLink>

            {/* Mobile toggle */}
            <div className="sm:hidden self-end">
                <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="text-lg border px-2 py-1 dark:border-green-400"
                >
                    ☰
                </button>
            </div>

            <div
                className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:w-auto transition-all duration-200 ${
                    menuOpen ? "block" : "hidden sm:flex"
                }`}
            >
                {NAV_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to} className={navLinkClassName}>
                        {isEnglish ? item.label.en : item.label.it}
                    </NavLink>
                ))}

                <button
                    type="button"
                    onClick={() => setLanguage((l) => (l === "en" ? "it" : "en"))}
                    className="border px-2 py-1 text-sm border-gray-400 dark:border-green-400"
                    aria-label={isEnglish ? "Switch to Italian" : "Passa a inglese"}
                >
                    {isEnglish ? "IT" : "EN"}
                </button>

                <button
                    type="button"
                    onClick={() => setDark((d) => !d)}
                    className="text-lg"
                    aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {dark ? ICON_SUN : ICON_MOON}
                </button>
            </div>
        </nav>
    );
}