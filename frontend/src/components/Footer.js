export default function Footer() {

    const year = new Date().getFullYear();

    return (

        <footer className="border-t mt-20 py-8">

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">

                <p>© {year} Yurii Suprun.</p>

                <div className="flex gap-6">

                    <a href="https://github.com/yuriisuprun"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline">GitHub</a>

                    <a href="https://www.linkedin.com/in/yurii-suprun/"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline">LinkedIn</a>

                </div>

            </div>

        </footer>

    );

}