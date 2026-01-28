import { LevelCard } from "./LevelCard";

const tiers = [
    {
        tier: "Basic",
        minDeposit: "$200",
        withdrawLimit: "$5,000/day",
        bonus: "5% welcome",
        perks: ["Standard spreads", "Basic support", "Mobile app access"],
    },
    {
        tier: "Silver",
        minDeposit: "$1,000",
        withdrawLimit: "$25,000/day",
        bonus: "10% welcome",
        perks: ["Tighter spreads", "Priority support", "Faster withdrawals", "Educational resources"],
    },
    {
        tier: "Gold",
        minDeposit: "$5,000",
        withdrawLimit: "$100,000/day",
        bonus: "15% welcome",
        perks: ["Zero‑commission pairs", "Dedicated account manager", "Advanced analytics", "VIP webinars"],
    },
    {
        tier: "VIP",
        minDeposit: "$20,000",
        withdrawLimit: "Unlimited",
        bonus: "20% welcome",
        perks: [
            "Personalized trading desk",
            "Exclusive market insights",
            "24/7 VIP concierge",
            "Custom strategy development",
            "Private events access",
        ],
    },
];

export const AccountLevels = () => (
    <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-4 text-center text-3xl font-semibold text-white">
                Account Levels & Benefits
            </h2>
            <p className="mb-12 text-center text-white/70 max-w-3xl mx-auto">
                Choose the account level that best fits your trading needs. Higher tiers offer enhanced features, better spreads, and personalized support.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {tiers.map((t, i) => (
                    <LevelCard key={i} {...t} />
                ))}
            </div>
        </div>
    </section>
);