export default function Footer() {

    const year = new Date().getFullYear();

    return (
        <footer className="border-t py-8">
            <div className="flex flex-col items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p>© {year} Made by Yurii Suprun</p>
            </div>
        </footer>
    );
}