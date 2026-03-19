import { useState } from "react";
import { sendContact } from "../api/contactApi";

const TEXT = {
    en: {
        title: "Contacts",
        description: "Feel free to reach out if you'd like to collaborate.",
        send: "Send Message",
        success: "Message sent successfully.",
        error: "Failed to send message.",
        fields: { name: "Name", email: "Email", message: "Message" },
    },
    it: {
        title: "Contatti",
        description: "Sentiti libero di contattarmi se vuoi collaborare.",
        send: "Invia Messaggio",
        success: "Messaggio inviato.",
        error: "Errore durante l'invio.",
        fields: { name: "Nome", email: "Email", message: "Messaggio" },
    },
};

export default function Contacts({ language }) {
    const t = TEXT[language] ?? TEXT.en;

    const [form, setForm] = useState({ name: "", email: "", message: "", website: "" });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        setErrorMessage("");

        try {
            await sendContact(form);
            setStatus("success");
            setForm({ name: "", email: "", message: "", website: "" });
        } catch (err) {
            setStatus("error");
            setErrorMessage(err.message || t.error);
        }

        setLoading(false);
    };

    return (
        <section className="py-12 px-4 sm:px-6 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t.title}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">{t.description}</p>

            <form onSubmit={submit} className="space-y-4">
                <label htmlFor="name" className="sr-only">
                    {t.fields.name}
                </label>
                <input
                    id="name"
                    name="name"
                    required
                    placeholder={t.fields.name}
                    value={form.name}
                    onChange={update}
                    className="w-full p-3 border rounded"
                />

                <label htmlFor="email" className="sr-only">
                    {t.fields.email}
                </label>
                <input
                    id="email"
                    name="email"
                    required
                    type="email"
                    placeholder={t.fields.email}
                    value={form.email}
                    onChange={update}
                    className="w-full p-3 border rounded"
                />

                <label htmlFor="message" className="sr-only">
                    {t.fields.message}
                </label>
                <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    placeholder={t.fields.message}
                    value={form.message}
                    onChange={update}
                    className="w-full p-3 border rounded"
                />

                {/* Honeypot */}
                <input
                    name="website"
                    value={form.website}
                    onChange={update}
                    style={{ display: "none" }}
                    autoComplete="off"
                />

                <button
                    disabled={loading}
                    className="border border-green-500 px-6 py-2 rounded flex items-center justify-center"
                >
                    {loading ? "Sending..." : t.send}
                </button>

                {status === "success" && <p className="text-green-500">{t.success}</p>}
                {status === "error" && <p className="text-red-500">{errorMessage || t.error}</p>}
            </form>
        </section>
    );
}