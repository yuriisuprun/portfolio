import React from "react";

const AUTHOR_NAME = "Yurii Suprun";
const COPYRIGHT_SYMBOL = "\u00A9";

const FOOTER_TEXT = {
    en: "Designed and made by",
    it: "Progettato e realizzato da",
};

const FOOTER_HEART = {
    en: "with",
    it: "con",
};

function getFooterText(language) {
    return FOOTER_TEXT[language] || FOOTER_TEXT.en;
}

function getFooterHeart(language) {
    return FOOTER_HEART[language] || FOOTER_HEART.en;
}

function Footer({ language = "en" }) {
    const year = new Date().getFullYear();
    const text = getFooterText(language);
    const heart = getFooterHeart(language);

    return (
        <footer
            role="contentinfo"
            className="border-t border-gray-300 dark:border-terminal py-6 text-sm text-gray-500 text-center"
        >
            {`${COPYRIGHT_SYMBOL} ${year} | ${text} ${AUTHOR_NAME} ${heart} ❤️`}
        </footer>
    );
}

export default Footer;