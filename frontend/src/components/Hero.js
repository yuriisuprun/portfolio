export default function Hero({ language }) {

    const text = {
        en: { role: "Software Engineer" },
        it: { role: "Ingegnere Software" }
    };

    const t = text[language];

    return (
        <section className="flex items-center min-h-[70vh]">

            <div className="space-y-6">

                {/*<p className="text-gray-500 dark:text-green-400">*/}
                {/*    $ whoami*/}
                {/*</p>*/}

                <h1 className="text-5xl font-bold">
                    Yurii Suprun
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-400">
                    {t.role}
                </p>

                <div className="space-y-2">

                    <p className="dark:text-green-400">
                        &gt; <a href="https://github.com/yuriisuprun" target="_blank" rel="noreferrer">GitHub</a>
                    </p>

                    <p className="dark:text-green-400">
                        &gt; <a href="https://linkedin.com/in/yurii-suprun" target="_blank" rel="noreferrer">LinkedIn</a>
                    </p>

                    <p className="dark:text-green-400">
                        &gt; <a href="mailto:iursuprun@gmail.com">Email</a>
                    </p>

                </div>

            </div>

        </section>
    );
}