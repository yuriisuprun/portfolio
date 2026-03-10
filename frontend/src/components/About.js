export default function About({ language }) {

    const text = {
        en: {
            title: "About Me",
            description:
                "My name is Yurii, and I’m a Senior Java Software Engineer with more than 7 years of experience designing backend systems."
        },
        it: {
            title: "Chi Sono",
            description:
                "Mi chiamo Yurii e sono un Senior Java Software Engineer con oltre 7 anni di esperienza nello sviluppo di sistemi backend."
        }
    };

    const t = text[language];

    return (
        <section className="flex items-center justify-center py-24 text-center">

            <div className="max-w-2xl">

                <h2 className="text-4xl font-bold mb-8">
                    {t.title}
                </h2>

                <p className="text-lg">
                    {t.description}
                </p>

            </div>

        </section>
    );
}