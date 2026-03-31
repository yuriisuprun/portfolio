import {useEffect, useMemo, useState} from "react";
import axios from "axios";

const API_URL = "/api/repos";
const REPO_LIMIT = 6;
const SKELETON_COUNT = 6;

const ALLOWED_REPOS = [
    "polaris",
    "portfolio",
    "monolith-to-microservices",
    "comment-sender"
];

const TRANSLATIONS = {
    en: {
        title: "My projects on GitHub",
        view: "View Code",
        info: "Waking up the server… this may take a few seconds.",
        error: "Failed to load repositories",
    },
    it: {
        title: "I miei progetti su GitHub",
        view: "Vedi Codice",
        info: "Avvio del server in corso… potrebbero volerci alcuni secondi.",
        error: "Caricamento repository fallito",
    },
};

const GRID_CLASSNAME = "grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6";
const CARD_CLASSNAME = "border border-gray-300 dark:border-terminal p-6 rounded";

export default function Projects({language = "en"}) {
    const t = useMemo(() => TRANSLATIONS[language] ?? TRANSLATIONS.en, [language]);
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const fetchRepos = async () => {
            try {
                setLoading(true);
                const res = await axios.get(API_URL, {signal: controller.signal});
                if (!isMounted) return;

                const data = Array.isArray(res.data) ? res.data : [];

                const filtered = data.filter((repo) =>
                    ALLOWED_REPOS.includes(repo.name)
                );

                const ordered = filtered.sort(
                    (a, b) =>
                        ALLOWED_REPOS.indexOf(a.name) -
                        ALLOWED_REPOS.indexOf(b.name)
                );

                setRepos(ordered.slice(0, REPO_LIMIT));
            } catch (err) {
                if (!isMounted) return;
                setError(err);
                setRepos([]);
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        fetchRepos();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    return (
        <section className="py-16">
            <h2 className="text-3xl mb-10">{t.title}</h2>

            {loading && (
                <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        {t.info}
                    </p>
                    <div className={GRID_CLASSNAME}>
                        {Array.from({length: SKELETON_COUNT}).map((_, i) => (
                            <div key={i} className={`${CARD_CLASSNAME} animate-pulse`}>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 w-2/3 mb-4"/>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 mb-2"/>
                                <div className="h-3 bg-gray-200 dark:bg-gray-600 w-5/6"/>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && error && (
                <p className="text-sm text-red-600 dark:text-red-400">
                    {t.error}
                </p>
            )}

            {!loading && !error && (
                <div className={GRID_CLASSNAME}>
                    {repos.map((repo) => (
                        <div key={repo.id} className={CARD_CLASSNAME}>
                            <h3 className="text-lg font-bold">{repo.name}</h3>

                            {repo.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {repo.description}
                                </p>
                            )}

                            <a href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-4 text-blue-600 dark:text-green-400">
                                &gt; {t.view}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}