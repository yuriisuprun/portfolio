export default function Contacts({ language }) {

    const text = {
        en: {
            title: "Contact Me",
            description: "Feel free to reach out if you'd like to collaborate or have any questions.",
            email: "Email",
            linkedin: "LinkedIn",
            github: "GitHub"
        },
        it: {
            title: "Contattami",
            description: "Sentiti libero di contattarmi se vuoi collaborare o hai domande.",
            email: "Email",
            linkedin: "LinkedIn",
            github: "GitHub"
        }
    };

    const t = text[language];

    return (
        <section className="flex items-center justify-center py-24">
            <div className="text-center max-w-xl">

                <h2 className="text-4xl font-bold mb-8">
                    {t.title}
                </h2>

                <p className="mb-10 text-lg">
                    {t.description}
                </p>

                <div className="flex flex-col gap-6 text-lg">
                    <a href="mailto:iursuprun@gmail.com"
                        className="flex items-center justify-center gap-3 hover:underline">
                        <img src="/icons/email.png" alt="email" className="w-6 h-6 filter dark:invert"/>
                        iursuprun@gmail.com
                    </a>

                    <a href="https://www.linkedin.com/in/yurii-suprun/"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 hover:underline">
                        <img src="/icons/linkedin.png" alt="linkedin" className="w-6 h-6 filter dark:invert"/>
                        {t.linkedin}
                    </a>

                    <a href="https://github.com/yuriisuprun"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 hover:underline">
                        <img src="/icons/github.png" alt="github" className="w-6 h-6 filter dark:invert"/>
                        {t.github}
                    </a>

                </div>

            </div>
        </section>
    );
}