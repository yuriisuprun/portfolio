import ThemeToggle from "./ThemeToggle";

export default function Navbar({ setActiveSection, dark, setDark, language, setLanguage }) {

    return (
        <nav className="flex justify-between p-6 border-b">

            <h1
                className="font-bold text-xl cursor-pointer"
                onClick={() => setActiveSection("home")}
            >
                YS.
            </h1>

            <div className="flex gap-6 items-center">

                <button onClick={() => setActiveSection("home")} className="hover:underline">
                    {language === "en" ? "home" : "home"}
                </button>

                <button onClick={() => setActiveSection("about")} className="hover:underline">
                    {language === "en" ? "about" : "chi sono"}
                </button>

                <button onClick={() => setActiveSection("projects")} className="hover:underline">
                    {language === "en" ? "projects" : "progetti"}
                </button>

                <button onClick={() => setActiveSection("contacts")} className="hover:underline">
                    {language === "en" ? "contacts" : "contatti"}
                </button>

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