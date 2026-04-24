import {NavLink} from "react-router-dom";
import {useState} from "react";
import {useT} from "../i18n/i18n";
import CircuitMoonIcon from "./CircuitMoonIcon";

const NAV_ITEMS = [
    {to: "/home", labelKey: "nav.home"},
    {to: "/about", labelKey: "nav.about"},
    {to: "/projects", labelKey: "nav.projects"},
    {to: "/contacts", labelKey: "nav.contacts"},
];

export default function Navbar({dark, setDark, language, setLanguage}) {
    const {t} = useT(language);
    const [menuOpen, setMenuOpen] = useState(false);
    const isEnglish = language === "en";

    return (
        <nav
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-black/20 dark:border-white/20 gap-4 sm:gap-0">
            <NavLink to="/home" className="font-bold text-xl text-black dark:text-white">
                {t("nav.brand")}
            </NavLink>

            <button className="sm:hidden text-lg border px-2 py-1 border-black/30 dark:border-white/30"
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
                                ? "font-semibold text-black dark:text-white underline underline-offset-4"
                                : "text-black/70 hover:text-black dark:text-white/70 dark:hover:text-white"
                        }>
                        {t(item.labelKey)}
                    </NavLink>
                ))}

                <button type="button" onClick={() => setLanguage(isEnglish ? "it" : "en")}
                    className="border px-2 py-1 text-sm border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label={isEnglish ? t("nav.switchToItalianAria") : t("nav.switchToEnglishAria")}>
                    {isEnglish ? t("nav.localeIt") : t("nav.localeEn")}
                </button>

                <button type="button" onClick={() => setDark(!dark)}
                    className="border px-2 py-1 text-sm border-black/30 dark:border-white/30 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label={dark ? t("nav.darkModeToLightAria") : t("nav.darkModeToDarkAria")}>
                    <CircuitMoonIcon size={18} className="block"/>
                </button>
            </div>
        </nav>
    );
}

