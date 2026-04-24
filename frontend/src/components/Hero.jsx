import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { SITE_CONFIG } from "../config/siteConfig";
import { useT } from "../i18n/i18n";

const ICON_CLASSNAME =
  "w-[16px] h-[16px] grayscale brightness-0 opacity-80 dark:invert";
const CHIP_CLASSNAME =
  "inline-flex items-center rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-[12px] text-[rgb(var(--app-muted))]";

function ArrowRightIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5 12h12M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

ArrowRightIcon.propTypes = { className: PropTypes.string };

function MailIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 7h16v10H4V7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M4 8l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

MailIcon.propTypes = { className: PropTypes.string };

function ExternalLinkIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M14 5h5v5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14L19 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 14v5H5V5h5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

ExternalLinkIcon.propTypes = { className: PropTypes.string };

function FeaturedCard({ title, description, tags, iconSrc, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative rounded-2xl border border-black/10 dark:border-white/15 bg-[rgb(var(--app-card))] p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-shadow"
    >
      <span className="absolute right-5 top-5 text-[rgb(var(--app-muted))] group-hover:text-[rgb(var(--app-fg))] transition-colors">
        <ExternalLinkIcon className="h-5 w-5" />
      </span>
      <div className="flex gap-5">
        <div className="shrink-0">
          <img
            src={iconSrc}
            alt=""
            className="h-[74px] w-[74px] rounded-xl bg-black/5 dark:bg-white/5 p-2"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-[16px] sm:text-[17px] leading-snug text-[rgb(var(--app-fg))]">
            {title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-[rgb(var(--app-muted))]">
            {description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className={CHIP_CLASSNAME}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}

FeaturedCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  iconSrc: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
};

export default function Hero({ language }) {
  const { t, tArray } = useT(language);
  const headlineLines = tArray("hero.headlineLines");

  const featured = [
    {
      title: t("featured.analytics.title"),
      description: t("featured.analytics.description"),
      tags: tArray("featured.analytics.tags"),
      iconSrc: "/projects/analytics.svg",
      href: `${SITE_CONFIG.github}/`,
    },
    {
      title: t("featured.task.title"),
      description: t("featured.task.description"),
      tags: tArray("featured.task.tags"),
      iconSrc: "/projects/task-manager.svg",
      href: `${SITE_CONFIG.github}/`,
    },
    {
      title: t("featured.ecommerce.title"),
      description: t("featured.ecommerce.description"),
      tags: tArray("featured.ecommerce.tags"),
      iconSrc: "/projects/ecommerce.svg",
      href: `${SITE_CONFIG.github}/`,
    },
  ];

  return (
    <section className="pt-10 sm:pt-14">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="max-w-xl">
          <p className="text-[rgb(var(--app-accent))] font-semibold">
            {t("hero.kicker")}
          </p>

          <h1 className="mt-4 text-[40px] sm:text-[54px] leading-[1.06] font-extrabold tracking-[-0.02em] text-[rgb(var(--app-fg))]">
            {Array.isArray(headlineLines) && headlineLines.length > 0 ? (
              headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            ) : (
              <span>{t("hero.headline")}</span>
            )}
          </h1>

          <p className="mt-5 text-[16px] sm:text-[17px] leading-relaxed text-[rgb(var(--app-muted))]">
            {t("hero.subtitle")}
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <Link
              to="/projects"
              className="btn-primary inline-flex items-center gap-3 rounded-lg px-5 py-3 font-semibold"
            >
              {t("hero.ctaProjects")}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>

            <Link
              to="/contacts"
              className="btn-outline inline-flex items-center gap-3 rounded-lg px-5 py-3 font-semibold"
            >
              {t("hero.ctaContact")}
              <MailIcon className="h-5 w-5" />
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-6 text-[14px] text-[rgb(var(--app-muted))]">
            <a
              href={SITE_CONFIG.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[rgb(var(--app-fg))]"
            >
              <img
                src="/icons/linkedin.png"
                alt=""
                className={ICON_CLASSNAME}
              />
              {t("hero.links.linkedin")}
            </a>
            <a
              href={SITE_CONFIG.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-[rgb(var(--app-fg))]"
            >
              <img src="/icons/github.png" alt="" className={ICON_CLASSNAME} />
              {t("hero.links.github")}
            </a>
            <a
              href={`mailto:${SITE_CONFIG.email}`}
              className="inline-flex items-center gap-2 hover:text-[rgb(var(--app-fg))]"
            >
              <img src="/icons/email.png" alt="" className={ICON_CLASSNAME} />
              {t("hero.links.email")}
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <img
            src="/hero-illustration.jpg"
            alt=""
            className="w-full max-w-[560px] h-auto"
          />
        </div>
      </div>

      <div className="mt-14 sm:mt-16 pb-6">
        <div className="text-center">
          <p className="text-[12px] font-semibold tracking-[0.12em] text-[rgb(var(--app-accent))]">
            {t("featured.kicker")}
          </p>
          <h2 className="mt-2 text-[24px] sm:text-[30px] font-extrabold text-[rgb(var(--app-fg))]">
            {t("featured.title")}
          </h2>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((card) => (
            <FeaturedCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

Hero.propTypes = {
  language: PropTypes.oneOf(["en", "it"]),
};
