import ThemeToggle from "./ThemeToggle";

export default function Navbar(){

    return(

        <nav className="flex justify-between p-6 border-b">

            <h1 className="font-bold text-xl">
                Yurii Suprun
            </h1>

            <div className="flex gap-6">

                <a href="#home">Home</a>
                <a href="#projects">Projects</a>

                <ThemeToggle/>

            </div>

        </nav>

    )

}