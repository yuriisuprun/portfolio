import PropTypes from "prop-types";
import {useT} from "../i18n/i18n";
import CircuitHeartIcon from "./CircuitHeartIcon";

const AUTHOR = {
    name: "Yurii Suprun",
    link: "https://yuriisuprun.vercel.app/",
};

export default function Footer({language}) {
    const {t} = useT(language);
    const year = new Date().getFullYear();

    return (
        <footer role="contentinfo" className="border-t border-black/20 dark:border-white/20 py-6 text-sm text-black/70 dark:text-white/70 text-center">
            {"\u00A9"} {year} |{" "}
            <span className="font-typewriter-condensed">
                {t("footer.designedBy")}{" "}
                <a href={AUTHOR.link} target="_blank" rel="noopener noreferrer" className="text-black dark:text-white hover:underline font-bold">
                    {AUTHOR.name}
                </a>{" "}
                {t("footer.with")}{" "}
                <CircuitHeartIcon className="inline-block align-[-0.12em] mx-1" size={14}/>
            </span>
        </footer>
    );
}

Footer.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};
