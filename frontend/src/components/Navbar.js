import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ dark, setDark, language, setLanguage }) {

    const linkClass = ({ isActive }) =>
        isActive
            ? "underline font-semibold"
            : "hover:underline";

    return (
        <nav className="flex justify-between items-center p-6 border-b">

            <NavLink
                to="/home"
                className="font-bold text-xl"
            >
                YS.
            </NavLink>

            <div className="flex gap-6 items-center">

                <NavLink to="/home" className={linkClass}>
                    {language === "en" ? "home" : "home"}
                </NavLink>

                <NavLink to="/about" className={linkClass}>
                    {language === "en" ? "about" : "chi sono"}
                </NavLink>

                <NavLink to="/projects" className={linkClass}>
                    {language === "en" ? "projects" : "progetti"}
                </NavLink>

                <NavLink to="/contacts" className={linkClass}>
                    {language === "en" ? "contacts" : "contatti"}
                </NavLink>

                <button
                    onClick={() => setLanguage(language === "en" ? "it" : "en")}
                    className="text-sm border px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    {language === "en" ? "IT" : "EN"}
                </button>

                <ThemeToggle dark={dark} setDark={setDark} />

            </div>

        </nav>
    );
}