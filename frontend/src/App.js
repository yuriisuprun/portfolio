import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

function App() {

    return (
        <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">

            <div className="max-w-6xl mx-auto px-6">

                <Navbar/>
                <Hero/>
                <Projects/>
                <Footer/>

            </div>

        </div>
    );

}

export default App;