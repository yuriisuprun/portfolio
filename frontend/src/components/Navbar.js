import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar({ dark, setDark, language, setLanguage }) {

    return (
        <nav className="flex justify-between p-6 border-b">

            <Link to="/home" className="font-bold text-xl">
                YS.
            </Link>

            <div className="flex gap-6 items-center">

                <Link to="/home" className="hover:underline">
                    {language === "en" ? "home" : "home"}
                </Link>

                <Link to="/about" className="hover:underline">
                    {language === "en" ? "about" : "chi sono"}
                </Link>

                <Link to="/projects" className="hover:underline">
                    {language === "en" ? "projects" : "progetti"}
                </Link>

                <Link to="/contacts" className="hover:underline">
                    {language === "en" ? "contacts" : "contatti"}
                </Link>

                <button
                    onClick={() => setLanguage(language === "en" ? "it" : "en")}
                    className="text-sm border px-2 py-1 rounded"
                >
                    {language === "en" ? "IT" : "EN"}
                </button>

                <ThemeToggle dark={dark} setDark={setDark} />

            </div>

        </nav>
    );
}