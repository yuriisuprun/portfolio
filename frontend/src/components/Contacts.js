export default function Contacts({ language }) {

    const text = {
        en: {
            title: "Contacts",
            description: "Feel free to reach out if you'd like to collaborate."
        },
        it: {
            title: "Contatti",
            description: "Sentiti libero di contattarmi se vuoi collaborare."
        }
    };

    const t = text[language];

    return (
        <section className="py-20">

            <h2 className="text-3xl mb-6">
                {t.title}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-10">
                {t.description}
            </p>

            <div className="space-y-3">

                <p>
                    &gt; <a href="mailto:iursuprun@gmail.com">iursuprun@gmail.com</a>
                </p>

                <p>
                    &gt; <a href="https://github.com/yuriisuprun" target="_blank" rel="noreferrer noopener">github.com/yuriisuprun</a>
                </p>

                <p>
                    &gt; <a href="https://linkedin.com/in/yurii-suprun" target="_blank" rel="noreferrer noopener">linkedin.com/in/yurii-suprun</a>
                </p>

            </div>

        </section>
    );
}
