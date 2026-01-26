import { motion } from "framer-motion";
// import { FaChartLine } from "react-icons/fa";
import { heroCounters } from "../../utils/mockData";

const Counter = ({ label, value }: { label: string; value: number }) => (
    <motion.div
        className="text-center text-white"
        whileHover={{ scale: 1.05 }}
    >
        <div className="text-3xl font-bold">{value.toLocaleString()}</div>
        <div className="text-sm opacity-80">{label}</div>
    </motion.div>
);

export const Hero = () => {
    return (
        <section className="relative flex h-screen w-full items-center justify-center bg-primary">
            {/* Background animated chart placeholder */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Replace with a real TradingView chart later */}
                <div className="h-full w-full bg-gradient-to-br from-primary via-[#001133] to-primary opacity-30" />
            </div>

            {/* Glass container */}
            <motion.div
                className="glass relative z-10 mx-4 max-w-4xl p-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="mb-4 text-4xl font-extrabold text-accent md:text-5xl">
                    Trade Smarter with VertexPrime Capital
                </h1>

                <p className="mb-8 text-lg text-white/80">
                    Fast execution • Secure funds • Professional trading tools
                </p>

                {/* CTA Buttons */}
                <div className="mb-10 flex justify-center gap-4">
                    <motion.button
                        className="rounded-md bg-accent px-6 py-3 font-medium text-primary shadow-lg"
                        whileHover={{ scale: 1.03 }}
                    >
                        Start Trading
                    </motion.button>

                    <motion.button
                        className="rounded-md border border-accent px-6 py-3 font-medium text-accent"
                        whileHover={{ scale: 1.03 }}
                    >
                        Create Free Account
                    </motion.button>
                </div>

                {/* Animated counters */}
                <div className="flex justify-center gap-8">
                    <Counter label="Users" value={heroCounters.users} />
                    <Counter label="Trades" value={heroCounters.trades} />
                    <Counter label="Payouts ($)" value={heroCounters.payouts} />
                </div>
            </motion.div>
        </section>
    );
};