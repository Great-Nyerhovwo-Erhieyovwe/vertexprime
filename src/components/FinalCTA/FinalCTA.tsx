import { motion } from "framer-motion";

export const FinalCTA = () => (
    <section className="py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold text-white">
                Ready to Trade with Confidence?
            </h2>
            <p className="text-lg text-white/80">
                Join thousands of traders who trust VertexPrime for fast, secure, and
                profitable trading.
            </p>

            <motion.div
                className="flex gap-4"
                whileHover={{ scale: 1.02 }}
            >
                <motion.button
                    className="rounded-md bg-accent px-8 py-3 font-medium text-primary shadow-lg"
                    whileHover={{ scale: 1.05 }}
                >
                    Start Trading
                </motion.button>

                <motion.button
                    className="rounded-md border border-accent px-8 py-3 font-medium text-accent"
                    whileHover={{ scale: 1.05 }}
                >
                    Create Free Account
                </motion.button>
            </motion.div>
        </div>
    </section>
);