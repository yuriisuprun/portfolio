import { useEffect, useState } from "react";
import axios from "axios";

export default function Projects({ language }) {

    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get("https://yuriisuprun.onrender.com/api/repos")
            .then(res => setRepos(res.data.slice(0, 6)))
            .finally(() => setLoading(false));
    }, []);

    const text = {
        en: { title: "Projects", view: "View Code", loading: "Server waking up... loading projects" },
        it: { title: "Progetti", view: "Vedi Codice", loading: "Il server si sta avviando... caricamento progetti" }
    };

    const t = text[language];

    return (
        <section className="py-16">

            <h2 className="text-3xl mb-10">
                {t.title}
            </h2>

            {loading ? (
                <>
                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                        ⚡ {t.loading}
                    </p>

                    <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="border border-gray-300 dark:border-terminal p-6 rounded animate-pulse"
                            >
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-2/3 mb-4"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 w-5/6"></div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">

                    {repos.map(repo => (

                        <div
                            key={repo.id}
                            className="border border-gray-300 dark:border-terminal p-6 rounded"
                        >

                            <h3 className="text-lg font-bold">
                                {repo.name}
                            </h3>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {repo.description}
                            </p>

                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-4 text-blue-600 dark:text-green-400"
                            >
                                &gt; {t.view}
                            </a>

                        </div>

                    ))}

                </div>
            )}

        </section>
    );
}