import { FaLock, FaShieldAlt, FaUserCheck, FaHeadset } from "react-icons/fa";
import { motion } from "framer-motion";

const items = [
    { icon: <FaLock size={28} />, label: "SSL Security" },
    { icon: <FaShieldAlt size={28} />, label: "Encrypted Transactions" },
    { icon: <FaUserCheck size={28} />, label: "KYC‑Verified Accounts" },
    { icon: <FaHeadset size={28} />, label: "24/7 Support" },
];

export const TrustStrip = () => (
    <section className="bg-primary py-6">
        <div className="mx-auto flex max-w-6xl justify-between px-4">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    className="flex flex-col items-center text-center text-white"
                    whileHover={{ scale: 1.07 }}
                >
                    {item.icon}
                    <span className="mt-2 text-sm">{item.label}</span>
                </motion.div>
            ))}
        </div>
    </section>
);