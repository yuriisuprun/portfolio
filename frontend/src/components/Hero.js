import { SITE_CONFIG } from "../config/siteConfig";

export default function Hero({ language }) {

    const text = {
        en: { role: "Software Engineer" },
        it: { role: "Ingegnere Software" }
    };

    const t = text[language];

    return (
        <section className="flex items-center min-h-[70vh]">

            <div className="flex items-center gap-10">

                <img
                    src="/myphoto.png"
                    alt="Yurii Suprun Profile Photo"
                    className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg"
                />

                <div className="space-y-6">

                    <h1 className="text-5xl font-bold">
                        {SITE_CONFIG.name}
                    </h1>

                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t.role}
                    </p>

                    <div className="space-y-2">

                        <p className="dark:text-green-400">
                            &gt; <a href={SITE_CONFIG.github} target="_blank" rel="noreferrer">
                            GitHub
                        </a>
                        </p>

                        <p className="dark:text-green-400">
                            &gt; <a href={SITE_CONFIG.linkedin} target="_blank" rel="noreferrer">
                            LinkedIn
                        </a>
                        </p>

                        <p className="dark:text-green-400">
                            &gt; <a href={`mailto:${SITE_CONFIG.email}`}>
                            Email
                        </a>
                        </p>

                    </div>

                </div>

            </div>

        </section>
    );
}