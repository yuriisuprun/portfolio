import {useState, useCallback, useMemo} from "react";
import {sendContact} from "../api/contactApi";
import {SITE_CONFIG} from "../config/siteConfig";

const TEXT = {
    en: {
        title: "Contact Me",
        description: "I'm always open to collaborating. Send me a message or reach out directly.",
        send: "Send Message",
        sending: "Sending...",
        success: "Message sent successfully!",
        error: "Oops! Something went wrong. Please try again.",
        fields: {name: "Your Name", email: "Your Email", message: "Your Message"},
        direct: "Reach me directly via:",
    },
    it: {
        title: "Contattami",
        description: "Sono sempre disponibile per collaborazioni. Inviami un messaggio o contattami direttamente.",
        send: "Invia Messaggio",
        sending: "Invio...",
        success: "Messaggio inviato con successo!",
        error: "Ops! Qualcosa è andato storto. Riprova.",
        fields: {name: "Il tuo nome", email: "La tua email", message: "Il tuo messaggio"},
        direct: "Contattami direttamente tramite:",
    },
};

const INITIAL_FORM_STATE = {
    name: "",
    email: "",
    message: "",
    website: "", // honeypot
};

export default function Contacts({language = "en"}) {
    const t = TEXT[language] || TEXT.en;

    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const CONTACT_LINKS = useMemo(
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

    const resetForm = useCallback(() => setForm(INITIAL_FORM_STATE), []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (form.website) return; // honeypot

            setLoading(true);
            setStatus(null);
            setErrorMessage("");

            try {
                await sendContact(form);
                setStatus("success");
                resetForm();
            } catch (error) {
                setStatus("error");
                setErrorMessage(error?.message || t.error);
            } finally {
                setLoading(false);
            }
        },
        [form, resetForm, t.error]
    );

    return (
        <section className="py-16 px-4 sm:px-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">{t.title}</h2>
            <p className="mb-8 text-gray-700 dark:text-gray-300">{t.description}</p>

            {/* Direct Contact Links */}
            <ContactLinks links={CONTACT_LINKS} directText={t.direct}/>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <InputField id="name" name="name" value={form.name} onChange={handleChange}
                            placeholder={t.fields.name}/>
                <InputField id="email" name="email" type="email" value={form.email} onChange={handleChange}
                            placeholder={t.fields.email}/>
                <TextAreaField id="message" name="message" value={form.message} onChange={handleChange}
                               placeholder={t.fields.message}/>

                {/* Honeypot */}
                <input name="website" value={form.website} onChange={handleChange} className="hidden" autoComplete="off"
                       tabIndex={-1}/>

                <button type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 disabled:opacity-50 transition-colors duration-200">
                    {loading ? t.sending : t.send}
                </button>

                {status === "success" && <p className="text-green-600 font-medium mt-2">{t.success}</p>}
                {status === "error" && <p className="text-red-600 font-medium mt-2">{errorMessage}</p>}
            </form>
        </section>
    );
}

function ContactLinks({links, directText}) {
    return (
        <div className="mb-10">
            <p className="font-semibold mb-3">{directText}</p>
            <ul className="flex flex-wrap gap-4">
                {links.map(({key, label, href, icon}) => (
                    <li key={key}>
                        {href ? (
                            <a href={href}
                               target={key !== "phone" && key !== "email" ? "_blank" : "_self"}
                               rel={key !== "phone" && key !== "email" ? "noopener noreferrer" : undefined}
                               className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded hover:bg-green-50 dark:hover:bg-green-900 transition-colors duration-200"
                               aria-label={label}>
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5"/>
                                {label}
                            </a>
                        ) : (
                            <span
                                className="flex items-center gap-2 px-4 py-2 border border-green-500 rounded bg-gray-100 dark:bg-gray-800 cursor-default"
                                aria-label={label}>
                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5"/>
                                {label}
              </span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function InputField({id, name, type = "text", value, onChange, placeholder}) {
    return (
        <>
            <label htmlFor={id} className="sr-only">
                {placeholder}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 focus:outline-none transition"
            />
        </>
    );
}

function TextAreaField({id, name, value, onChange, placeholder}) {
    return (
        <>
            <label htmlFor={id} className="sr-only">
                {placeholder}
            </label>
            <textarea
                id={id}
                name={name}
                rows={5}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 focus:outline-none transition resize-none"
            />
        </>
    );
}