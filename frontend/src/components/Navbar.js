import { NavLink } from "react-router-dom";

export default function Navbar({ dark, setDark, language, setLanguage }) {

    const linkClass = ({ isActive }) =>
        isActive
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-500 hover:text-black dark:hover:text-white";

    const toggleLanguage = () => {
        setLanguage(language === "en" ? "it" : "en");
    };

    return (
        <nav className="flex justify-between items-center py-6 border-b border-gray-300 dark:border-terminal">

            <NavLink to="/home" className="font-bold text-xl text-gray-900 dark:text-green-400">
                YS.
            </NavLink>

            <div className="flex gap-6 items-center text-sm">

                <NavLink to="/home" className={linkClass}>home</NavLink>

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
                    onClick={toggleLanguage}
                    className="border px-2 py-1 text-sm border-gray-400 dark:border-green-400"
                >
                    {language === "en" ? "IT" : "EN"}
                </button>

                <button
                    onClick={() => setDark(!dark)}
                    className="text-lg"
                >
                    {dark ? "☀️" : "🌙"}
                </button>

            </div>

        </nav>
    );
}