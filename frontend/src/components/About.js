export default function About({ language }) {

    const text = {
        en: {
            title: "About Me",
            description:
                "My name is Yurii. I am a Senior Java Software Engineer with more than 7 years of experience designing backend systems and scalable applications."
        },
        it: {
            title: "Chi Sono",
            description:
                "Mi chiamo Yurii. Sono un Senior Java Software Engineer con oltre 7 anni di esperienza nello sviluppo di sistemi backend."
        }
    };

    const t = text[language];

    return (
        <section className="py-20 max-w-2xl">

            <h2 className="text-3xl mb-6">
                {t.title}
            </h2>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t.description}
            </p>

        </section>
    );
}