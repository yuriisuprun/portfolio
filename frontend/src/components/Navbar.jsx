import {NavLink} from "react-router-dom";
import {useState} from "react";
import {useT} from "../i18n/i18n";

const NAV_ITEMS = [
    {to: "/home", labelKey: "nav.home"},
    {to: "/about", labelKey: "nav.about"},
    {to: "/projects", labelKey: "nav.projects"},
    {to: "/contacts", labelKey: "nav.contacts"},
];

// Use escapes to avoid encoding issues in source files.
const ICONS = {sun: "\u2600\uFE0F", moon: "\uD83C\uDF19"};

export default function Navbar({dark, setDark, language, setLanguage}) {
    const {t} = useT(language);
    const [menuOpen, setMenuOpen] = useState(false);
    const isEnglish = language === "en";

    return (
        <nav
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-gray-300 dark:border-terminal gap-4 sm:gap-0">
            <NavLink to="/home" className="font-bold text-xl text-gray-900 dark:text-green-400">
                {t("nav.brand")}
            </NavLink>

            <button className="sm:hidden text-lg border px-2 py-1 dark:border-green-400"
                aria-label={t("nav.toggleMenuAria")}
                aria-expanded={menuOpen}
                aria-controls="nav-menu"
                onClick={() => setMenuOpen(!menuOpen)}>
                {"\u2630"}
            </button>

            <div id="nav-menu"
                className={`flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full sm:w-auto transition-all duration-200 ${
                    menuOpen ? "block" : "hidden sm:flex"
                }`}>
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({isActive}) =>
                            isActive
                                ? "font-semibold text-gray-900 dark:text-white"
                                : "text-gray-500 hover:text-black dark:hover:text-white"
                        }>
                        {t(item.labelKey)}
                    </NavLink>
                ))}

                <button type="button" onClick={() => setLanguage(isEnglish ? "it" : "en")}
                    className="border px-2 py-1 text-sm border-gray-400 dark:border-green-400"
                    aria-label={isEnglish ? t("nav.switchToItalianAria") : t("nav.switchToEnglishAria")}>
                    {isEnglish ? t("nav.localeIt") : t("nav.localeEn")}
                </button>

                <button type="button" onClick={() => setDark(!dark)}
                    className="text-lg"
                    aria-label={dark ? t("nav.darkModeToLightAria") : t("nav.darkModeToDarkAria")}>
                    {dark ? ICONS.sun : ICONS.moon}
                </button>
            </div>
        </nav>
    );
}

