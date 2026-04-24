import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {useT} from "../i18n/i18n";

const API_URL = "/api/repos";
const REPO_LIMIT = 6;
const SKELETON_COUNT = 6;

const ALLOWED_REPOS = [
    "polaris",
    "portfolio",
    "monolith-to-microservices",
    "smart-trip",
    "library-system",
];

const GRID_CLASSNAME = "grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6";
const CARD_CLASSNAME = "border border-black/20 dark:border-white/20 p-6 rounded";

export default function Projects({language}) {
    const {t} = useT(language);
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

                const filtered = data.filter((repo) => ALLOWED_REPOS.includes(repo.name));

                const ordered = filtered.sort(
                    (a, b) => ALLOWED_REPOS.indexOf(a.name) - ALLOWED_REPOS.indexOf(b.name)
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
            <h2 className="text-3xl mb-10 leading-tight">{t("projects.title")}</h2>

            {loading && (
                <>
                    <p className="text-[0.95em] text-black/70 dark:text-white/70 mb-6 leading-relaxed">
                        {t("projects.info")}
                    </p>
                    <div className={GRID_CLASSNAME}>
                        {Array.from({length: SKELETON_COUNT}).map((_, i) => (
                            <div key={i} className={`${CARD_CLASSNAME} animate-pulse`}>
                                <div className="h-4 bg-black/10 dark:bg-white/15 w-2/3 mb-4"/>
                                <div className="h-3 bg-black/10 dark:bg-white/15 mb-2"/>
                                <div className="h-3 bg-black/10 dark:bg-white/15 w-5/6"/>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && error && (
                <p className="text-[0.95em] text-black dark:text-white leading-relaxed" role="alert">
                    {t("projects.error")}
                </p>
            )}

            {!loading && !error && (
                <div className={GRID_CLASSNAME}>
                    {repos.map((repo) => (
                        <div key={repo.id} className={CARD_CLASSNAME}>
                            <h3 className="text-lg font-bold leading-snug">{repo.name}</h3>

                            {repo.description && (
                                <p className="text-[0.95em] text-black/70 dark:text-white/70 mt-2 leading-relaxed">
                                    {repo.description}
                                </p>
                            )}

                            <a href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="block mt-4 underline underline-offset-4 hover:no-underline">
                                &gt; {t("projects.view")}
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

Projects.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};
