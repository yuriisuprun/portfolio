import React from "react";
import { SITE_CONFIG } from "../config/siteConfig";

const HERO_COPY = {
    en: {
        role:
            "My name is Yurii, and I'm a software engineer. I create interactive, scalable, and engaging web solutions.",
    },
    it: {
        role:
            "Mi chiamo Yurii e sono un ingegnere del software. Creo soluzioni web interattive, scalabili e coinvolgenti.",
    },
};

const HERO_LINKS = [
    { key: "github", label: "GitHub", href: SITE_CONFIG.github, external: true },
    {
        key: "linkedin",
        label: "LinkedIn",
        href: SITE_CONFIG.linkedin,
        external: true,
    },
    { key: "email", label: "Email", href: `mailto:${SITE_CONFIG.email}`, external: false },
];

function Hero({ language = "en" }) {
    const role = HERO_COPY[language]?.role ?? HERO_COPY.en.role;

    return (
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
            <img
                src="/myphoto.jpg"
                alt="Yurii Suprun - Software Engineer"
                className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg mt-6 sm:mt-14"
                loading="lazy"
            />

            <div className="flex-1 space-y-4 sm:space-y-6">
                {/*<h1 className="text-3xl sm:text-5xl font-bold">{SITE_CONFIG.name}</h1>*/}
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">{role}</p>

                <div className="space-y-1">
                    {HERO_LINKS.map(({ key, label, href, external }) => (
                        <p key={key} className="dark:text-green-400 text-sm sm:text-base">
                            &gt;{" "}
                            <a
                                href={href}
                                target={external ? "_blank" : "_self"}
                                rel={external ? "noreferrer" : undefined}
                                className="hover:underline"
                            >
                                {label}
                            </a>
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Hero;