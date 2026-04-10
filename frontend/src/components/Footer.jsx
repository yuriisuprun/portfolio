import PropTypes from "prop-types";
import {useT} from "../i18n/i18n";

const AUTHOR = {
    name: "Yurii Suprun",
    link: "https://yuriisuprun.vercel.app/",
};

export default function Footer({language}) {
    const {t} = useT(language);
    const year = new Date().getFullYear();

    return (
        <footer
            role="contentinfo"
            className="border-t border-gray-300 dark:border-terminal py-6 text-sm text-gray-500 text-center">
            {"\u00A9"} {year} | {t("footer.designedBy")}{" "}
            <a href={AUTHOR.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:underline font-bold">
                {AUTHOR.name}</a>
            {" "}
            {t("footer.with")} {"\u2764\uFE0F"}
        </footer>
    );
}

Footer.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};

