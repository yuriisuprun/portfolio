import React, {memo, useMemo} from "react";
import PropTypes from "prop-types";
import {SITE_CONFIG} from "../config/siteConfig";
import {useT} from "../i18n/i18n";

const HeroImage = memo(function HeroImage({alt}) {
    return (
        <img src="/myphoto.jpg"
            alt={alt}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg mt-2 sm:mt-6"
            loading="lazy"/>
    );
});

HeroImage.propTypes = {
    alt: PropTypes.string.isRequired,
};

const HeroLinkItem = memo(function HeroLinkItem({label, href, external, iconKey}) {
    const linkProps = external ? {target: "_blank", rel: "noopener noreferrer"} : {};

    return (
        <p className="flex items-center gap-2 text-sm sm:text-base dark:text-green-400">
            <img src={`/icons/${iconKey}.png`}
                alt={`${label} icon`}
                className="w-4 h-4"/>
            <a href={href}
                {...linkProps}
                aria-label={label}
                className={iconKey === "email" ? "hover:no-underline" : "hover:underline"}>
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

const HeroLinks = memo(function HeroLinks({links}) {
    return (
        <div className="space-y-1">
            {links.map(({key, label, href, external}) => (
                <HeroLinkItem key={key}
                    label={label}
                    href={href}
                    external={external}
                    iconKey={key}/>
            ))}
        </div>
    );
});

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

function Hero({language}) {
    const {t} = useT(language);

    const links = useMemo(
        () => [
            {key: "linkedin", label: t("hero.links.linkedin"), href: SITE_CONFIG.linkedin, external: true},
            {key: "github", label: t("hero.links.github"), href: SITE_CONFIG.github, external: true},
            {key: "email", label: t("hero.links.email"), href: `mailto:${SITE_CONFIG.email}`, external: false},
        ],
        [t]
    );

    return (
        <section
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
            <HeroImage alt={t("hero.imageAlt")}/>
            <div className="flex-1 space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400">
                    {t("hero.rolePrefix")}
                    <strong>{t("hero.roleStrong")}</strong>
                    {t("hero.roleSuffix")}
                </p>
                <HeroLinks links={links}/>
            </div>
        </section>
    );
}

Hero.propTypes = {
    // Optional override for tests/isolated rendering; otherwise locale comes from context.
    language: PropTypes.oneOf(["en", "it"]),
};

export default memo(Hero);

