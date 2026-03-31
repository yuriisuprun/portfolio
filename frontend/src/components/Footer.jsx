const FOOTER_TEXT = {
    en: "Designed and made by",
    it: "Progettato e realizzato da",
};

const FOOTER_HEART = {
    en: "with",
    it: "con",
};

const AUTHOR = {
    name: "Yurii Suprun",
    link: "https://yuriisuprun.vercel.app/",
};

export default function Footer({language = "en"}) {
    const year = new Date().getFullYear();

    const text = FOOTER_TEXT[language] ?? FOOTER_TEXT.en;
    const heart = FOOTER_HEART[language] ?? FOOTER_HEART.en;

    return (
        <footer
            role="contentinfo"
            className="border-t border-gray-300 dark:border-terminal py-6 text-sm text-gray-500 text-center">
            © {year} | {text}{" "}
            <a href={AUTHOR.link}
               target="_blank"
               rel="noopener noreferrer"
               className="text-blue-500 hover:underline">
                {AUTHOR.name}
            </a>{" "}
            {heart} ❤️
        </footer>
    );
}