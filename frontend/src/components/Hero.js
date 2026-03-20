import React, {memo} from "react";
import PropTypes from "prop-types";
import {SITE_CONFIG} from "../config/siteConfig";

const HERO_COPY = {
    en: {
        role: (
            <>
                Hi, I’m Yurii, a <strong>software engineer</strong> who builds interactive, scalable, and engaging
                software solutions.
            </>
        ),
    },
    it: {
        role: (
            <>
                Ciao, sono Yurii, un <strong>ingegnere del software</strong> che crea soluzioni software interattive,
                scalabili e coinvolgenti.
            </>
        ),
    },
};

const HERO_LINKS = [
    {key: "github", label: "GitHub", href: SITE_CONFIG.github, external: true},
    {key: "linkedin", label: "LinkedIn", href: SITE_CONFIG.linkedin, external: true},
    {key: "email", label: "iursuprun@gmail.com", external: false},
];

const getRoleText = (language = "en") => HERO_COPY[language]?.role || HERO_COPY.en.role;

const HeroImage = memo(() => (
    <img
        src="/myphoto.jpg"
        alt="Yurii Suprun - Software Engineer"
        className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg mt-2 sm:mt-6"
        loading="lazy"
    />
));

HeroImage.displayName = "HeroImage";

const HeroLinkItem = memo(({label, href, external, iconKey}) => {
    const linkProps = external
        ? {target: "_blank", rel: "noopener noreferrer"}
        : {};

    return (
        <p className="flex items-center gap-2 text-sm sm:text-base dark:text-green-400">
            <img
                src={`/icons/${iconKey}.png`}
                alt={`${label} icon`}
                className="w-4 h-4"
            />
            <a
                href={href}
                {...linkProps}
                aria-label={label}
                className={iconKey === "email" ? "hover:no-underline" : "hover:underline"}
            >
                {label}
            </a>
        </p>
    );
});

HeroLinkItem.propTypes = {
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    external: PropTypes.bool.isRequired,
    iconKey: PropTypes.string.isRequired,
};

HeroLinkItem.displayName = "HeroLinkItem";

const HeroLinks = memo(({links}) => (
    <div className="space-y-1">
        {links.map(({key, label, href, external}) => (
            <HeroLinkItem
                key={key}
                label={label}
                href={href}
                external={external}
                iconKey={key}
            />
        ))}
    </div>
));

HeroLinks.propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            href: PropTypes.string.isRequired,
            external: PropTypes.bool.isRequired,
        })
    ).isRequired,
};

HeroLinks.displayName = "HeroLinks";

const Hero = ({language = "en"}) => {
    const roleText = getRoleText(language);

    return (
        <section
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
            <HeroImage/>
            <div className="flex-1 space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">{roleText}</p>
                <HeroLinks links={HERO_LINKS}/>
            </div>
        </section>
    );
};

Hero.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};

export default memo(Hero);