import React from "react";

const TEXT = {
    en: {
        title: "About Me",
        description: [
            "My name is Yurii, and I'm a Software Engineer passionate about building scalable and reliable backend systems...",
            "I also have experience contributing to user interface development, which helps me better understand the full application stack...",
            "Over the years, I’ve contributed to designing and modernizing complex platforms across multiple domains (Travel, Insurance, etc.)...",
            "I enjoy learning new technologies, solving challenging problems, and collaborating with multicultural teams to deliver high-quality software.",
        ],
    },
    it: {
        title: "Chi Sono",
        description: [
            "Mi chiamo Yurii e sono un Software Engineer appassionato di costruire sistemi backend scalabili e affidabili...",
            "Ho anche esperienza nello sviluppo di interfacce utente, che mi consente di comprendere meglio l’intero stack applicativo...",
            "Nel corso degli anni ho contribuito alla progettazione e alla modernizzazione di piattaforme complesse in diversi settori (viaggi, assicurazioni, ecc.)...",
            "Mi piace imparare nuove tecnologie, risolvere problemi complessi e collaborare con team multiculturali per realizzare software di alta qualità.",
        ],
    },
};

export default function About({language}) {
    const t = TEXT[language] ?? TEXT.en;

    return (
        <section className="py-20 max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">{t.title}</h2>
            {t.description.map((paragraph, idx) => (
                <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                    {paragraph}
                </p>
            ))}
        </section>
    );
}