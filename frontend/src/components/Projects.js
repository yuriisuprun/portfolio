import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "https://yuriisuprun.onrender.com/api/repos";
const REPO_LIMIT = 6;
const SKELETON_COUNT = 6;
const BOOT_INTERVAL_MS = 1200;

const TRANSLATIONS = {
  en: {
    title: "Projects",
    view: "View Code",
    boot: [
      "> connecting to backend...",
      "> waking up server instance...",
      "> loading GitHub repositories...",
    ],
    info:
      "Backend hosted on free tier. First request may take ~30-60s due to cold start.",
    error: "Failed to load repositories. Please try again later.",
  },
  it: {
    title: "Progetti",
    view: "Vedi Codice",
    boot: [
      "> connessione al backend...",
      "> avvio istanza server...",
      "> caricamento repository GitHub...",
    ],
    info:
      "Backend ospitato su piano gratuito. La prima richiesta potrebbe richiedere ~30-60 secondi a causa del cold start.",
    error: "Caricamento repository fallito. Riprova piu tardi.",
  },
};

const GRID_CLASSNAME = "grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6";
const CARD_CLASSNAME = "border border-gray-300 dark:border-terminal p-6 rounded";

function SkeletonCard() {
  return (
    <div className={`${CARD_CLASSNAME} animate-pulse`}>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 w-2/3 mb-4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-600 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-600 w-5/6" />
    </div>
  );
}

function ProjectCard({ repo, viewLabel }) {
  return (
    <div className={CARD_CLASSNAME}>
      <h3 className="text-lg font-bold">{repo.name}</h3>

      {repo.description ? (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {repo.description}
        </p>
      ) : null}

      <a
        href={repo.html_url}
        target="_blank"
        rel="noreferrer"
        className="block mt-4 text-blue-600 dark:text-green-400"
      >
        &gt; {viewLabel}
      </a>
    </div>
  );
}

function BootingState({ info, bootLines, bootStep }) {
  return (
    <>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{info}</p>

      <div className="font-mono text-green-500 dark:text-green-400 mb-8 space-y-1">
        {bootLines.slice(0, bootStep + 1).map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <div className={GRID_CLASSNAME}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </>
  );
}

export default function Projects({ language = "en" }) {
  const t = useMemo(
    () => TRANSLATIONS[language] ?? TRANSLATIONS.en,
    [language]
  );

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bootStep, setBootStep] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    axios
      .get(API_URL, { signal: controller.signal })
      .then((res) => {
        if (!isMounted) return;

        const data = Array.isArray(res.data) ? res.data : [];
        setRepos(data.slice(0, REPO_LIMIT));
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err?.name === "CanceledError") return;

        setRepos([]);
        setError(err);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!loading) return;

    setBootStep(0);

    const maxStep = Math.max(0, (t.boot?.length ?? 0) - 1);
    const interval = setInterval(() => {
      setBootStep((prev) => (prev >= maxStep ? prev : prev + 1));
    }, BOOT_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loading, t.boot]);

  return (
    <section className="py-16">
      <h2 className="text-3xl mb-10">{t.title}</h2>

      {loading ? (
        <BootingState info={t.info} bootLines={t.boot} bootStep={bootStep} />
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{t.error}</p>
      ) : (
        <div className={GRID_CLASSNAME}>
          {repos.map((repo) => (
            <ProjectCard key={repo.id} repo={repo} viewLabel={t.view} />
          ))}
        </div>
      )}
    </section>
  );
}

