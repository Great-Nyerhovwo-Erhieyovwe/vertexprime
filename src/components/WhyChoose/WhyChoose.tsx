import {
  FaBolt,
  FaChartLine,
  FaRobot,
  FaMoneyBillWave,
  FaGlobeAmericas,
} from "react-icons/fa";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    Icon: FaBolt,
    title: "Instant Trade Execution",
    description: "Sub‑millisecond order routing for razor‑sharp pricing.",
  },
  {
    Icon: FaChartLine,
    title: "Advanced Trading Charts",
    description: "Customizable indicators, multi‑timeframe views, and drawing tools.",
  },
  {
    Icon: FaRobot,
    title: "AI‑Powered Signals",
    description: "Machine‑learning models suggest optimal entry/exit points.",
  },
  {
    Icon: FaMoneyBillWave,
    title: "Fast Deposits & Withdrawals",
    description: "Support for fiat, crypto, and major e‑wallets.",
  },
  {
    Icon: FaGlobeAmericas,
    title: "Multi‑Asset Trading",
    description: "Forex, crypto, stocks, indices – all in one platform.",
  },
];

export const WhyChoose = () => (
  <section className="py-12">
    <h2 className="mb-8 text-center text-2xl font-semibold text-white">
      Why Choose VertexPrime Capital?
    </h2>
    <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-4">
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} />
      ))}
    </div>
  </section>
);