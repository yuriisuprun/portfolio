import { SITE_CONFIG } from "../config/siteConfig";

const HERO_COPY = {
  en: { role: "Software engineer passionate about solving real-world problems with code" },
  it: { role: "Ingegnere software appassionato di risolvere problemi del mondo reale con il codice" },
};

function HeroLink({ href, external = false, children }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
}

export default function Hero({ language = "en" }) {
  const t = HERO_COPY[language] ?? HERO_COPY.en;

  const links = [
    { label: "GitHub", href: SITE_CONFIG.github, external: true },
    { label: "LinkedIn", href: SITE_CONFIG.linkedin, external: true },
    { label: "Email", href: `mailto:${SITE_CONFIG.email}`, external: false },
  ];

  return (
    <section className="flex items-center min-h-[70vh]">
      <div className="flex items-center gap-10">
        <img
          src="/myphoto.jpg"
          alt={SITE_CONFIG.name}
          className="w-32 h-32 rounded-full object-cover border-2 border-gray-400 shadow-lg"
        />

        <div className="space-y-6">
          <h1 className="text-5xl font-bold">{SITE_CONFIG.name}</h1>

          <p className="text-lg text-gray-600 dark:text-gray-400">{t.role}</p>

          <div className="space-y-2">
            {links.map(({ label, href, external }) => (
              <p key={label} className="dark:text-green-400">
                &gt; <HeroLink href={href} external={external}>{label}</HeroLink>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
