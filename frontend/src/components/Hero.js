import React from "react";
import { SITE_CONFIG } from "../config/siteConfig"; // Make sure this path is correct

// Text for hero section
const HERO_COPY = {
    en: { role: "Software engineer passionate about solving real-world problems with code" },
    it: { role: "Ingegnere software appassionato di risolvere problemi del mondo reale con il codice" },
};

// Helper link component
function HeroLink({ href, external = false, children }) {
    return external ? (
        <a href={href} target="_blank" rel="noreferrer" className="hover:underline">
            {children}
        </a>
    ) : (
        <a href={href} className="hover:underline">{children}</a>
    );
}

export default function Hero({ language = "en" }) {
    const t = HERO_COPY[language] ?? HERO_COPY.en;

    const links = [
        { label: "GitHub", href: SITE_CONFIG.github, external: true },
        { label: "LinkedIn", href: SITE_CONFIG.linkedin, external: true },
        { label: "Email", href: `mailto:${SITE_CONFIG.email}`, external: false },
    ];

    return (
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
            <img
                src="/myphoto.jpg"
                alt={SITE_CONFIG.name}
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg"
            />

            <div className="flex-1 space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-5xl font-bold">{SITE_CONFIG.name}</h1>
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">{t.role}</p>

                <div className="space-y-1">
                    {links.map(({ label, href, external }) => (
                        <p key={label} className="dark:text-green-400 text-sm sm:text-base">
                            &gt; <HeroLink href={href} external={external}>{label}</HeroLink>
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}