import React from "react";
import { SITE_CONFIG } from "../config/siteConfig";

const HERO_COPY = {
    en: {
        role: "My name is Yurii, and I'm a software engineer. I create and develop diverse, interactive, and " +
            "engaging solutions. I am passionate about solving real-world problems with code",
    },
    it: {
        role: "Mi chiamo Yurii e sono un ingegnere del software. Creo e sviluppo soluzioni diverse, interattive e " +
            "coinvolgenti. Sono appassionato di risolvere problemi reali tramite il codice",
    },
};

const HERO_LINKS = [
    {
        key: "github",
        label: "GitHub",
        getHref: (config) => config.github,
        external: true,
    },
    {
        key: "linkedin",
        label: "LinkedIn",
        getHref: (config) => config.linkedin,
        external: true,
    },
    {
        key: "email",
        label: "Email",
        getHref: (config) => `mailto:${config.email}`,
        external: false,
    },
];

const HeroLink = React.memo(function HeroLink({ href, external, children }) {
    const baseProps = {
        href,
        className: "hover:underline",
    };

    return external ? (
        <a {...baseProps} target="_blank" rel="noreferrer">
            {children}
        </a>
    ) : (
        <a {...baseProps}>{children}</a>
    );
});

function useHeroCopy(language) {
    return HERO_COPY[language] ?? HERO_COPY.en;
}

export default function Hero({ language = "en" }) {
    const { role } = useHeroCopy(language);

    return (
        <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
            <ProfileImage />
            <HeroContent role={role} />
        </section>
    );
}

function ProfileImage() {
    return (
        <img
            src="/myphoto.jpg"
            alt={SITE_CONFIG.name}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg"
        />
    );
}

function HeroContent({ role }) {
    return (
        <div className="flex-1 space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-5xl font-bold">
                {/*{SITE_CONFIG.name}*/}
            </h1>

            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
                {role}
            </p>

            <HeroLinks />
        </div>
    );
}

function HeroLinks() {
    return (
        <div className="space-y-1">
            {HERO_LINKS.map(({ key, label, getHref, external }) => (
                <p key={key} className="dark:text-green-400 text-sm sm:text-base">
                    &gt;{" "}
                    <HeroLink href={getHref(SITE_CONFIG)} external={external}>
                        {label}
                    </HeroLink>
                </p>
            ))}
        </div>
    );
}