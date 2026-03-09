export default function Hero() {

    return (
        <section className="flex items-center justify-center py-24 text-center">
            <div className="flex flex-col items-center gap-6">
                <h1 className="text-5xl font-bold mb-6 mt-8">Yurii Suprun</h1>

                <p className="text-xl">Software engineer</p>

                <div className="flex items-center gap-6 mt-4">
                    <a href="https://github.com/yuriisuprun"
                        title="Github"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:scale-110 transition">
                        <img src="/icons/github.png" alt="GitHub" className="w-6 h-6" /></a>

                    <a href="https://www.linkedin.com/in/yurii-suprun/"
                        title="Linkedin"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:scale-110 transition">
                        <img src="/icons/linkedin.png" alt="LinkedIn" className="w-6 h-6" /></a>

                    <a href="mailto:iursuprun@gmail.com"
                        title="Email"
                        target="_blank"
                        rel="noreferrer"
                        className="hover:scale-110 transition">
                        <img src="/icons/email.png" alt="Email" className="w-6 h-6" /></a>
                </div>
            </div>
        </section>
    );
}