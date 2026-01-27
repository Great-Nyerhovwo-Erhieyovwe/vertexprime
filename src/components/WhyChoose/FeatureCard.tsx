import { motion } from "framer-motion";
import type { IconType } from "react-icons";

type FeatureCardProps = {
  Icon: IconType;
  title: string;
  description: string;
};

export const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => (
  <motion.div
    className="flex w-full max-w-xs sm:max-w-sm lg:w-80 flex-col items-center p-6 text-center border border-white/20 shadow-lg"
    whileHover={{ y: -5, scale: 1.02 }}
  >
    <Icon size={36} className="mb-4 text-accent" />
    <h3 className="mb-2 text-lg font-medium text-white">{title}</h3>
    <p className="text-sm text-white/80">{description}</p>
  </motion.div>
);