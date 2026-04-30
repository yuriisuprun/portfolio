import PropTypes from "prop-types";
import {useT} from "../i18n/i18n";
import HeartIcon from "./HeartIcon";

export default function Footer({language}) {
    const {t} = useT(language);
    const year = new Date().getFullYear();

    return (
        <footer role="contentinfo"
            className="border-t border-black/10 dark:border-white/15 py-7 text-sm text-[rgb(var(--app-muted))] text-center">
            {"\u00A9"} {year} | {t("footer.designedBy")}{" "}
            <span className="font-semibold text-[rgb(var(--app-fg))]">Yurii Suprun</span>{" "}
            {t("footer.with")}{" "}
            <HeartIcon className="inline-block align-[-0.12em] text-[rgb(var(--app-muted))]" size={14}/>
        </footer>
    );
}

Footer.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};
