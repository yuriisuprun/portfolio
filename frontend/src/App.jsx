import {Navigate, Route, Routes} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import About from "./components/About";
import Contacts from "./components/Contacts";
import Footer from "./components/Footer";
import SEO from "./components/SEO";

import useDarkMode from "./hooks/useDarkMode";
import useLanguage from "./hooks/useLanguage";
import {I18nProvider, useT} from "./i18n/i18n";

const routeConfig = () => [
    {
        path: "/home",
        component: <Hero/>,
        seoKey: "seo.home",
    },
    {
        path: "/about",
        component: <About/>,
        seoKey: "seo.about",
    },
    {
        path: "/projects",
        component: <Projects/>,
        seoKey: "seo.projects",
    },
    {
        path: "/contacts",
        component: <Contacts/>,
        seoKey: "seo.contacts",
    },
];

function App() {
    const [dark, setDark] = useDarkMode();
    const [language, setLanguage] = useLanguage();
    const {tObject} = useT(language);

    return (
        <I18nProvider locale={language} setLocale={setLanguage}>
            <div
                className="min-h-screen flex flex-col bg-transparent text-[rgb(var(--app-fg))] transition-colors">
                <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 flex flex-col flex-grow">
                    <Navbar dark={dark} setDark={setDark} language={language} setLanguage={setLanguage}/>

                    <main className="flex-grow text-[16px] sm:text-[17px] leading-[1.65]">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" replace/>}/>
                            {routeConfig().map(({path, component, seoKey}) => (
                                <Route
                                    key={path}
                                    path={path}
                                    element={
                                        <>
                                            <SEO {...tObject(seoKey)} />
                                            {component}
                                        </>
                                    }
                                />
                            ))}
                        </Routes>
                    </main>

                    <Footer language={language}/>
                </div>
            </div>
        </I18nProvider>
    );
}

export default App;
