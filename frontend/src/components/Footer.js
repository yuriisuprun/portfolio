export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t py-8">
            {/* Center the text */}
            <div className="flex flex-col items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <p>© {year} Made by Yurii Suprun</p>

                {/*<div className="flex items-center gap-6">*/}
                {/*    <a href="https://github.com/yuriisuprun"*/}
                {/*       title="Github"*/}
                {/*       target="_blank"*/}
                {/*       rel="noreferrer"*/}
                {/*       className="hover:scale-110 transition">*/}
                {/*        <img src="/icons/github.png" alt="GitHub" className="w-6 h-6"/>*/}
                {/*    </a>*/}

                {/*    <a href="https://www.linkedin.com/in/yurii-suprun/"*/}
                {/*       title="Linkedin"*/}
                {/*       target="_blank"*/}
                {/*       rel="noreferrer"*/}
                {/*       className="hover:scale-110 transition">*/}
                {/*        <img src="/icons/linkedin.png" alt="LinkedIn" className="w-6 h-6"/>*/}
                {/*    </a>*/}

                {/*    <a href="mailto:iursuprun@gmail.com"*/}
                {/*       title="Email"*/}
                {/*       target="_blank"*/}
                {/*       rel="noreferrer"*/}
                {/*       className="hover:scale-110 transition">*/}
                {/*        <img src="/icons/email.png" alt="Email" className="w-6 h-6"/>*/}
                {/*    </a>*/}
                {/*</div>*/}
            </div>
        </footer>
    );
}