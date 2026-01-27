import { motion } from "framer-motion";

type LevelCardProps = {
    tier: string;
    minDeposit: string;
    withdrawLimit: string;
    bonus: string;
    perks: string[];
};

export const LevelCard = ({
    tier,
    minDeposit,
    withdrawLimit,
    bonus,
    perks,
}: LevelCardProps) => (
    <motion.div
        className="flex w-full max-w-xs sm:max-w-sm lg:w-72 flex-col p-5 border border-white/20 shadow-lg"
        whileHover={{ y: -5, scale: 1.02 }}
    >
        <h3 className="mb-2 text-center text-xl font-bold text-accent">{tier}</h3>
        <ul className="mb-3 space-y-1 text-sm text-white/80">
            <li>Min. Deposit: {minDeposit}</li>
            <li>Withdrawal Limit: {withdrawLimit}</li>
            <li>Bonus: {bonus}</li>
        </ul>
        <strong className="block mb-2 text-white">Perks:</strong>
        <ul className="list-disc pl-5 text-white/70">
            {perks.map((p, i) => (
                <li key={i}>{p}</li>
            ))}
        </ul>
    </motion.div>
);