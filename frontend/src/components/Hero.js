export default function Hero({ language }) {

    const text = {
        en: {
            role: "Software Engineer"
        },
        it: {
            role: "Ingegnere Software"
        }
    };

    const t = text[language];

    return (
        <section className="flex items-center justify-center py-24 text-center">

            <div className="flex flex-col items-center gap-6">

                <h1 className="text-5xl font-bold mb-6 mt-8">
                    Yurii Suprun
                </h1>

                <p className="text-xl">{t.role}</p>

                <div className="flex items-center gap-6 mt-4">

                    <a href="https://github.com/yuriisuprun" target="_blank" rel="noreferrer">
                        <img src="/icons/github.png" alt="github" className="w-6 h-6 filter dark:invert"/>
                    </a>

                    <a href="https://www.linkedin.com/in/yurii-suprun/" target="_blank" rel="noreferrer">
                        <img src="/icons/linkedin.png" alt="linkedin" className="w-6 h-6 filter dark:invert"/>
                    </a>

                    <a href="mailto:iursuprun@gmail.com">
                        <img src="/icons/email.png" alt="email" className="w-6 h-6 filter dark:invert"/>
                    </a>

                </div>

            </div>

        </section>
    );
}