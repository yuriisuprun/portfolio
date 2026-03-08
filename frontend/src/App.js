import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";

function App() {

    return (
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">

            <Navbar/>
            <Hero/>
            <Projects/>

        </div>
    );

}

export default App;