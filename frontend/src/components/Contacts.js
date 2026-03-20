import { useState, useCallback } from "react";
import { sendContact } from "../api/contactApi";
import { SITE_CONFIG } from "../config/siteConfig";

const TEXT = {
    en: {
        title: "Contacts",
        description: "Feel free to reach out if you'd like to collaborate.",
        send: "Send Message",
        sending: "Sending...",
        success: "Message sent successfully.",
        error: "Failed to send message.",
        fields: { name: "Name", email: "Email", message: "Message" },
        direct: "Or reach me directly via:",
    },
    it: {
        title: "Contatti",
        description: "Sentiti libero di contattarmi se vuoi collaborare.",
        send: "Invia Messaggio",
        sending: "Invio...",
        success: "Messaggio inviato.",
        error: "Errore durante l'invio.",
        fields: { name: "Nome", email: "Email", message: "Messaggio" },
        direct: "Oppure contattami direttamente tramite:",
    },
};

const INITIAL_FORM_STATE = {
    name: "",
    email: "",
    message: "",
    website: "", // honeypot
};

const CONTACT_LINKS = [
    { key: "linkedin", label: "LinkedIn", href: SITE_CONFIG.linkedin, icon: "linkedin" },
    { key: "github", label: "GitHub", href: SITE_CONFIG.github, icon: "github" },
    { key: "email", label: SITE_CONFIG.email, href: `mailto:${SITE_CONFIG.email}`, icon: "email" },
    { key: "phone", label: SITE_CONFIG.phone, href: `tel:${SITE_CONFIG.phone}`, icon: "phone" },
];

export default function Contacts({ language = "en" }) {
    const t = TEXT[language] ?? TEXT.en;

    const [form, setForm] = useState(INITIAL_FORM_STATE);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const resetForm = () => setForm(INITIAL_FORM_STATE);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.website) return; // honeypot check

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
    };

    return (
        <section className="py-12 px-4 sm:px-6 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.title}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{t.description}</p>

            {/* Direct Contact Links */}
            <div className="mb-8">
                <p className="font-semibold mb-2">{t.direct}</p>
                <ul className="space-y-2">
                    {CONTACT_LINKS.map(({ key, label, href, icon }) => (
                        <li key={key}>
                            <a
                                href={href}
                                target={key !== "phone" && key !== "email" ? "_blank" : "_self"}
                                rel={key !== "phone" && key !== "email" ? "noopener noreferrer" : undefined}
                                className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:underline"
                                aria-label={label}
                            >
                                <img src={`/icons/${icon}.png`} alt={`${label} icon`} className="w-5 h-5" />
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <InputField
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder={t.fields.name}
                />
                <InputField
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t.fields.email}
                />
                <TextAreaField
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder={t.fields.message}
                />
                <input
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="hidden"
                    autoComplete="off"
                    tabIndex={-1}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="border border-green-500 px-6 py-2 rounded flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? t.sending : t.send}
                </button>
                {status === "success" && <p className="text-green-500">{t.success}</p>}
                {status === "error" && <p className="text-red-500">{errorMessage}</p>}
            </form>
        </section>
    );
}

function InputField({ id, name, type = "text", value, onChange, placeholder }) {
    return (
        <>
            <label htmlFor={id} className="sr-only">{placeholder}</label>
            <input
                id={id}
                name={name}
                type={type}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 border rounded"
            />
        </>
    );
}

function TextAreaField({ id, name, value, onChange, placeholder }) {
    return (
        <>
            <label htmlFor={id} className="sr-only">{placeholder}</label>
            <textarea
                id={id}
                name={name}
                rows={5}
                required
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full p-3 border rounded"
            />
        </>
    );
}