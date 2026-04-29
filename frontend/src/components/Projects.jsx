import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {useT} from "../i18n/i18n";

const API_URL = "/api/repos";
const REPO_LIMIT = 6;
const SKELETON_COUNT = 6;

const ALLOWED_REPOS = [
    "AI-language-tutoring-system",
    "polaris",
    "portfolio",
    "monolith-to-microservices",
    "library-system",
];

const GRID_CLASSNAME = "grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6";
const CARD_CLASSNAME =
    "relative rounded-2xl border border-black/10 dark:border-white/15 bg-[rgb(var(--app-card))] p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-shadow";

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
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-10 leading-tight text-[rgb(var(--app-fg))]">
                {t("projects.title")}
            </h2>

            {loading && (
                <>
                    <p className="text-[0.95em] text-[rgb(var(--app-muted))] mb-6 leading-relaxed">
                        {t("projects.info")}
                    </p>
                    <div className={GRID_CLASSNAME}>
                        {Array.from({length: SKELETON_COUNT}).map((_, i) => (
                            <div key={i} className={`${CARD_CLASSNAME} animate-pulse`}>
                                <div className="h-4 bg-black/10 dark:bg-white/10 w-2/3 mb-4 rounded"/>
                                <div className="h-3 bg-black/10 dark:bg-white/10 mb-2 rounded"/>
                                <div className="h-3 bg-black/10 dark:bg-white/10 w-5/6 rounded"/>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && error && (
                <p className="text-[0.95em] text-[rgb(var(--app-fg))] leading-relaxed" role="alert">
                    {t("projects.error")}
                </p>
            )}

            {!loading && !error && (
                <div className={GRID_CLASSNAME}>
                    {repos.map((repo) => (
                        <div key={repo.id} className={CARD_CLASSNAME}>
                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute right-5 top-5 text-[rgb(var(--app-muted))] hover:text-[rgb(var(--app-fg))]"
                                aria-label={`${repo.name} external link`}
                                title={t("projects.view")}
                            >
                                <span aria-hidden="true">↗</span>
                            </a>

                            <h3 className="text-lg font-bold leading-snug text-[rgb(var(--app-fg))]">{repo.name}</h3>

                            {repo.description && (
                                <p className="text-[0.95em] text-[rgb(var(--app-muted))] mt-2 leading-relaxed">
                                    {repo.description}
                                </p>
                            )}

                            <a
                                href={repo.html_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 mt-5 font-semibold text-[rgb(var(--app-fg))] hover:opacity-80"
                            >
                                {t("projects.view")}
                                <span aria-hidden="true">→</span>
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
