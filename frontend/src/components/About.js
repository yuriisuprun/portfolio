export default function About({ language }) {
    const text = {
        en: {
            title: "About Me",
            description: [
                "My name is Yurii, and I'm a Software Engineer passionate about building scalable and reliable systems. " +
                "My primary expertise lies in Java, Spring Boot, and microservices architectures, combined with cloud-native " +
                "technologies such as AWS, Docker, and Kubernetes.",
                "I also have experience contributing to user interface development, which helps me better understand the full " +
                "application stack and deliver cohesive solutions. I’m always open to adopting new technologies whenever they " +
                "best fit the problem or project requirements.",
                "Over the years, I’ve contributed to designing and modernizing complex platforms across multiple " +
                "domains (Insurance, Travel, Finance, etc.), with a strong focus on clean architecture, performance, and long-term " +
                "maintainability.",
                "I enjoy learning new technologies, solving challenging problems, and collaborating with multicultural teams to " +
                "deliver high-quality software."
            ]
        },
        it: {
            title: "Chi Sono",
            description: [
                "Mi chiamo Yurii e sono un Software Engineer appassionato di costruire sistemi scalabili e affidabili. La mia " +
                "principale area di competenza riguarda Java, Spring Boot e le architetture a microservizi, unite a tecnologie " +
                "cloud-native come AWS, Docker e Kubernetes.",
                "Ho anche esperienza nello sviluppo di interfacce utente, che mi consente di comprendere meglio l’intero stack " +
                "applicativo e di offrire soluzioni coerenti. Sono sempre aperto ad adottare nuove tecnologie quando " +
                "si dimostrano la scelta migliore per il problema o i requisiti del progetto.",
                "Nel corso degli anni ho contribuito alla progettazione e alla modernizzazione di piattaforme complesse in " +
                "diversi settori (Assicurazioni, Viaggi, Finanza, ecc.), con una forte attenzione alla clean architecture, alle " +
                "prestazioni e alla manutenibilità a lungo termine.",
                "Mi piace imparare nuove tecnologie, risolvere problemi complessi e collaborare con team multiculturali per " +
                "realizzare software di alta qualità."
            ]
        }
    };

    const t = text[language];

    return (
        <section className="py-20 max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">{t.title}</h2>
            {t.description.map((paragraph, idx) => (
                <p
                    key={idx}
                    className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6"
                >
                    {paragraph}
                </p>
            ))}
        </section>
    );
}