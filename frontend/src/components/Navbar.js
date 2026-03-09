import ThemeToggle from "./ThemeToggle";

export default function Navbar({ setActiveSection }) {

    return (

        <nav className="flex justify-between p-6 border-b">

            <h1
                className="font-bold text-xl cursor-pointer"
                onClick={() => setActiveSection("home")}
            >
                YS.
            </h1>

            <div className="flex gap-6">

                <button
                    onClick={() => setActiveSection("home")}
                    className="hover:underline"
                >
                    Home
                </button>

                <button
                    onClick={() => setActiveSection("projects")}
                    className="hover:underline"
                >
                    Projects
                </button>

                <ThemeToggle />

            </div>

        </nav>

    );

}