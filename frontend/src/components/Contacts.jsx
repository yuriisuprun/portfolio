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
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 dark:text-gray-100 leading-tight">
                {t("contacts.title")}
            </h2>

            <ContactLinks links={contactLinks} directText={t("contacts.direct")}/>

            <p className="mb-2 text-gray-700 dark:text-gray-300 font-typewriter-condensed">
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
                    className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:opacity-50 transition-colors duration-200">
                    {loading ? t("contacts.sending") : t("contacts.send")}
                </button>

                {status === "success" && (
                    <p className="text-green-600 font-medium mt-2">{t("contacts.success")}</p>
                )}
                {status === "error" && (
                    <p className="text-red-600 font-medium mt-2">{errorMessage}</p>
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
            <p className="font-semibold mb-3 font-typewriter-condensed">{directText}</p>
            <ul className="flex flex-wrap gap-4">
                {links.map(({key, label, href, icon}) => (
                    <li key={key}>
                        {href ? (
                            <a href={href}
                                target={key !== "phone" && key !== "email" ? "_blank" : "_self"}
                                rel={key !== "phone" && key !== "email" ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors duration-200"
                                aria-label={label}>
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5 dark:invert"/>
                                {label}
                            </a>
                        ) : (
                            <span
                                className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded bg-gray-100 dark:bg-gray-800 cursor-default"
                                aria-label={label}>
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5 dark:invert"/>
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
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:outline-none transition font-typewriter-condensed"
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
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:outline-none transition resize-none font-typewriter-condensed"/>
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
