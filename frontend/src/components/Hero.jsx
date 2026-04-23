import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { SITE_CONFIG } from "../config/siteConfig";
import { useT } from "../i18n/i18n";

const ICON_CLASSNAME = "w-4 h-4 dark:invert";
const LINK_ROW_CLASSNAME = "flex items-center gap-2 dark:text-green-400";

function getExternalLinkProps(external) {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

function sanitizeWordList(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((w) => typeof w === "string" && w.trim().length > 0);
}

function formatWordList(words, locale) {
  if (words.length === 0) return "";

  // Prefer a locale-aware conjunction ("a, b, and c") but keep a safe fallback.
  try {
    const intl = globalThis.Intl;
    if (intl && typeof intl.ListFormat === "function") {
      return new intl.ListFormat(locale, {
        style: "long",
        type: "conjunction",
      }).format(words);
    }
  } catch {
    // Ignore and fall back to a simple join.
  }

  return words.join(", ");
}

function getGreeting(language) {
  if (language === "it") {
    return (
      <>
        Ciao, sono <span className="font-bold">Yurii</span>, un ingegnere del
        software
      </>
    );
  }

  return (
    <>
      Hi, I'm <span className="font-bold">Yurii</span>, a software engineer
    </>
  );
}

function buildLinks(t) {
  return [
    {
      key: "linkedin",
      label: t("hero.links.linkedin"),
      href: SITE_CONFIG.linkedin,
      external: true,
    },
    {
      key: "github",
      label: t("hero.links.github"),
      href: SITE_CONFIG.github,
      external: true,
    },
    {
      key: "email",
      label: t("hero.links.email"),
      href: `mailto:${SITE_CONFIG.email}`,
      external: false,
    },
  ];
}

const HeroLinkItem = memo(function HeroLinkItem({
  label,
  href,
  external,
  iconKey,
}) {
  const linkProps = getExternalLinkProps(external);

  return (
    <p className={LINK_ROW_CLASSNAME}>
      <img
        src={`/icons/${iconKey}.png`}
        alt={`${label} icon`}
        className={ICON_CLASSNAME}
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

const HeroLinks = memo(function HeroLinks({ links }) {
  return (
    <div className="space-y-1">
      {links.map(({ key, label, href, external }) => (
        <HeroLinkItem
          key={key}
          label={label}
          href={href}
          external={external}
          iconKey={key}
        />
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

function Hero({ language }) {
  const { t, tArray } = useT(language);

  const links = useMemo(() => buildLinks(t), [t]);

  const typewriterWords = useMemo(() => tArray("hero.typewriterWords"), [tArray]);

  const descriptorText = useMemo(() => {
    const words = sanitizeWordList(typewriterWords);
    const locale = language || "en";
    return formatWordList(words, locale);
  }, [typewriterWords, language]);

  const hasDescriptor = descriptorText.length > 0;

  return (
    <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 min-h-[70vh] pt-32 sm:pt-40 px-4 sm:px-6">
      <div className="flex-1 space-y-4 sm:space-y-6">
        <p className="text-[1.05em] sm:text-[1.2em] text-gray-600 dark:text-gray-400 leading-relaxed">
          {getGreeting(language)}
          {t("hero.roleSuffix")}

          <span className="text-gray-700 dark:text-gray-300 font-semibold">
            {descriptorText}
          </span>
          {hasDescriptor ? " " : ""}
          {t("hero.roleSuffixEnd")}
        </p>

        <HeroLinks links={links} />
      </div>
    </section>
  );
}

Hero.propTypes = {
  language: PropTypes.oneOf(["en", "it"]),
};

export default memo(Hero);
