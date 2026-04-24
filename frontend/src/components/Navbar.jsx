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
        <header className="py-6 border-b border-black/10 dark:border-white/15">
            <div className="flex items-center justify-between gap-4">
                <NavLink
                    to="/home"
                    className="shrink-0 font-extrabold tracking-wide leading-none text-[18px] text-[rgb(var(--app-fg))]"
                >
                    {t("nav.brand")}
                </NavLink>

                <nav aria-label="Primary" className="hidden md:flex flex-1 justify-center">
                    <ul className="flex items-center gap-7 leading-none">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({isActive}) =>
                                        isActive
                                            ? "relative font-semibold text-[rgb(var(--app-fg))] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-[rgb(var(--app-accent))]"
                                            : "text-[rgb(var(--app-muted))] hover:text-[rgb(var(--app-fg))]"
                                    }
                                >
                                    {t(item.labelKey)}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="shrink-0 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setLanguage(isEnglish ? "it" : "en")}
                        className="h-10 border px-3 text-sm rounded-md border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        aria-label={isEnglish ? t("nav.switchToItalianAria") : t("nav.switchToEnglishAria")}
                    >
                        {isEnglish ? t("nav.localeIt") : t("nav.localeEn")}
                    </button>

                    <button
                        type="button"
                        onClick={() => setDark(!dark)}
                        className="h-10 border px-3 text-sm rounded-md border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[rgb(var(--app-fg))]"
                        aria-label={dark ? t("nav.darkModeToLightAria") : t("nav.darkModeToDarkAria")}
                    >
                        <CircuitMoonIcon size={18} className="block"/>
                    </button>

                    <button
                        type="button"
                        className="md:hidden h-10 text-lg border px-3 rounded-md border-black/15 dark:border-white/20 bg-white/60 dark:bg-white/5"
                        aria-label={t("nav.toggleMenuAria")}
                        aria-expanded={menuOpen}
                        aria-controls="nav-menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {"\u2630"}
                    </button>
                </div>
            </div>

            <nav
                id="nav-menu"
                aria-label="Mobile primary"
                hidden={!menuOpen}
                className="md:hidden mt-4"
            >
                <ul className="flex flex-col gap-4">
                    {NAV_ITEMS.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                onClick={() => setMenuOpen(false)}
                                className={({isActive}) =>
                                    isActive
                                        ? "font-semibold text-[rgb(var(--app-fg))]"
                                        : "text-[rgb(var(--app-muted))]"
                                }
                            >
                                {t(item.labelKey)}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}

