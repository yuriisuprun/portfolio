import {useCallback, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {sendContact} from "../api/contactApi";
import {SITE_CONFIG} from "../config/siteConfig";
import {useT} from "../i18n/i18n";

const INITIAL_FORM_STATE = {
    name: "",
    email: "",
    message: "",
    website: "", // honeypot
};

export default function Contacts({language}) {
    const {t, tObject} = useT(language);
    const fields = tObject("contacts.fields");

    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const contactLinks = useMemo(
        () => [
            {key: "linkedin", label: "LinkedIn", href: SITE_CONFIG.linkedin, icon: "linkedin"},
            {key: "github", label: "GitHub", href: SITE_CONFIG.github, icon: "github"},
            {key: "email", label: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}`, icon: "email"},
            // {key: "phone", label: SITE_CONFIG.phone, icon: "phone"}, // unclickable
        ],
        []
    );

    const handleChange = useCallback((e) => {
        const {name, value} = e.target;
        setForm((prev) => ({...prev, [name]: value}));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (form.website) return;

        setLoading(true);
        setStatus(null);
        setErrorMessage("");

        try {
            await sendContact(form);
            setStatus("success");
            setForm(INITIAL_FORM_STATE);
        } catch (err) {
            setStatus("error");
            setErrorMessage(err?.message || t("contacts.error"));
        } finally {
            setLoading(false);
        }
    }, [form, t]);

    return (
        <section className="py-16 px-4 sm:px-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-[rgb(var(--app-fg))] leading-tight">
                {t("contacts.title")}
            </h2>

            <ContactLinks links={contactLinks} directText={t("contacts.direct")}/>

            <p className="mb-2 text-[rgb(var(--app-muted))]">
                {t("contacts.description")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <InputField id="name" name="name" value={form.name} onChange={handleChange}
                    placeholder={fields.name || ""}/>
                <InputField id="email" name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder={fields.email || ""}/>
                <TextAreaField id="message" name="message" value={form.message} onChange={handleChange}
                    placeholder={fields.message || ""}/>

                <input name="website" value={form.website} onChange={handleChange} className="hidden"
                    autoComplete="off"
                    tabIndex={-1}/>

                <button type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-3 rounded-lg font-semibold">
                    {loading ? t("contacts.sending") : t("contacts.send")}
                </button>

                {status === "success" && (
                    <p className="font-medium mt-2" role="status" aria-live="polite">{t("contacts.success")}</p>
                )}
                {status === "error" && (
                    <p className="font-medium mt-2" role="alert">{errorMessage}</p>
                )}
            </form>
        </section>
    );
}

Contacts.propTypes = {
    language: PropTypes.oneOf(["en", "it"]),
};

function ContactLinks({links, directText}) {
    return (
        <div className="mb-8">
            <p className="font-semibold mb-3 text-[rgb(var(--app-fg))]">{directText}</p>
            <ul className="flex flex-wrap gap-4">
                {links.map(({key, label, href, icon}) => (
                    <li key={key}>
                        {href ? (
                            <a href={href}
                                target={key !== "phone" && key !== "email" ? "_blank" : "_self"}
                                rel={key !== "phone" && key !== "email" ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/15 rounded-lg bg-[rgb(var(--app-card))] hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200 text-[rgb(var(--app-muted))] hover:text-[rgb(var(--app-fg))]"
                                aria-label={label}>
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5 grayscale brightness-0 dark:invert"/>
                                {label}
                            </a>
                        ) : (
                            <span
                                className="flex items-center gap-2 px-4 py-2 border border-black/10 dark:border-white/15 rounded-lg bg-black/5 dark:bg-white/10 cursor-default text-[rgb(var(--app-muted))]"
                                aria-label={label}>
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5 grayscale brightness-0 dark:invert"/>
                                {label}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

ContactLinks.propTypes = {
    links: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            href: PropTypes.string,
            icon: PropTypes.string.isRequired,
        })
    ).isRequired,
    directText: PropTypes.string.isRequired,
};

function InputField({id, name, type = "text", value, onChange, placeholder}) {
    return (
        <>
            <label htmlFor={id} className="sr-only">
                {placeholder}
            </label>
            <input id={id} name={name} type={type} required value={value} onChange={onChange} placeholder={placeholder}
                className="w-full p-3 border border-black/10 dark:border-white/15 rounded-lg bg-[rgb(var(--app-card))] text-[rgb(var(--app-fg))] placeholder-black/40 dark:placeholder-white/40 transition"
            />
        </>
    );
}

InputField.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
};

function TextAreaField({id, name, value, onChange, placeholder}) {
    return (
        <>
            <label htmlFor={id} className="sr-only">
                {placeholder}
            </label>
            <textarea id={id} name={name} rows={5} required value={value} onChange={onChange} placeholder={placeholder}
                className="w-full p-3 border border-black/10 dark:border-white/15 rounded-lg bg-[rgb(var(--app-card))] text-[rgb(var(--app-fg))] placeholder-black/40 dark:placeholder-white/40 transition resize-none"/>
        </>
    );
}

TextAreaField.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
};
