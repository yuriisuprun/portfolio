import React from "react";
import PropTypes from "prop-types";
import {useT} from "../i18n/i18n";

export default function About({language}) {
    const {t, tArray} = useT(language);
    const paragraphs = tArray("about.description");

    return (
        <section className="py-20 max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold mb-6 leading-tight text-[rgb(var(--app-fg))]">{t("about.title")}</h2>
            {paragraphs.map((paragraph, idx) => (
                <p key={idx} className="text-[rgb(var(--app-muted))] leading-relaxed mb-6">{paragraph}</p>
            ))}
        </section>
    );
}

About.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};
