import { motion } from "framer-motion";

type StepCardProps = {
    number: number;
    title: string;
    description: string;
};

export const StepCard = ({ number, title, description }: StepCardProps) => (
    <motion.div
        className="glass flex w-72 flex-col items-center p-5 text-center"
        whileHover={{ scale: 1.03 }}
    >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            {number}
        </div>
        <h4 className="mb-2 text-lg font-medium text-white">{title}</h4>
        <p className="text-sm text-white/80">{description}</p>
    </motion.div>
);