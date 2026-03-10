export default function About({ language }) {

    const text = {
        en: {
            title: "About Me",
            description: `My name is Yurii, and I’m a Senior Java Software Engineer with more than 7 years of experience designing and building large-scale backend systems. My work focuses on Java, Spring Boot, and microservices architectures, often in cloud-native environments powered by AWS, Docker, and Kubernetes. I'm particularly interested in system modernization, performance optimization, and building platforms that enable teams to move faster and scale reliably.`
        },
        it: {
            title: "Chi Sono",
            description: `Mi chiamo Yurii e sono un Senior Java Software Engineer con oltre 7 anni di esperienza nello sviluppo di sistemi backend su larga scala. Il mio lavoro si concentra su Java, Spring Boot e architetture a microservizi, spesso in ambienti cloud-native con AWS, Docker e Kubernetes. Sono particolarmente interessato alla modernizzazione dei sistemi, all'ottimizzazione delle prestazioni e alla creazione di piattaforme che permettono ai team di lavorare più velocemente e scalare in modo affidabile.`
        }
    };

    const t = text[language];

    return (
        <section className="flex items-center justify-center gap-10 py-24 text-center">
            <div>

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