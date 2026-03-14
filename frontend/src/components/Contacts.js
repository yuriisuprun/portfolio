import { SITE_CONFIG } from "../config/siteConfig";

export default function Contacts({ language }) {

    const text = {
        en: {
            title: "Contacts",
            description: "Feel free to reach out if you'd like to collaborate."
        },
        it: {
            title: "Contatti",
            description: "Sentiti libero di contattarmi se vuoi collaborare."
        }
    };

    const t = text[language];

    return (
        <section className="py-20">

            <h2 className="text-3xl mb-6">
                {t.title}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-10">
                {t.description}
            </p>

            <div className="space-y-3">

                <p>
                    &gt; <a href={`mailto:${SITE_CONFIG.email}`}>
                    {SITE_CONFIG.email}
                </a>
                </p>

                <p>
                    &gt; <a href={SITE_CONFIG.github} target="_blank" rel="noreferrer noopener">
                    github.com/{SITE_CONFIG.githubUsername}
                </a>
                </p>

                <p>
                    &gt; <a href={SITE_CONFIG.linkedin} target="_blank" rel="noreferrer noopener">
                    linkedin.com/in/yurii-suprun
                </a>
                </p>

            </div>

        </section>
    );
}
