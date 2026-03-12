const AUTHOR_NAME = "Yurii Suprun";
const COPYRIGHT_SYMBOL = "\u00A9";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-300 dark:border-terminal py-6 text-sm text-gray-500">
            {COPYRIGHT_SYMBOL} {year} {AUTHOR_NAME}
        </footer>
    );
}
