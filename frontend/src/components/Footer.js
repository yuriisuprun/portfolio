export default function Footer({ language }) {

    const year = new Date().getFullYear();

    const text = {
        en: `© ${year} Made by Yurii Suprun`,
        it: `© ${year} Creato da Yurii Suprun`
    };

    return (
        <footer className="border-t py-8">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p>{text[language]}</p>
            </div>
        </footer>
    );
}