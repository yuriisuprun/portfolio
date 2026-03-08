import {motion} from "framer-motion";

export default function Hero(){

    return(

        <section className="flex items-center justify-center gap-10 py-24">

            <motion.img
                src="/myphoto.jpg"
                className="w-40 h-40 rounded-full shadow-lg"
                initial={{opacity:0,scale:0.8}}
                animate={{opacity:1,scale:1}}
            />

            <div>

                <h1 className="text-5xl font-bold">
                    Hi 👋 I'm Yurii
                </h1>

                <p className="mt-4 text-xl">
                    Full Stack Developer
                </p>

            </div>

        </section>

    )

}