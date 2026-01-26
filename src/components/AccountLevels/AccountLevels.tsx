import { LevelCard } from "./LevelCard";

const tiers = [
    {
        tier: "Basic",
        minDeposit: "$100",
        withdrawLimit: "$5,000/day",
        bonus: "5% welcome",
        perks: ["Standard spreads", "Basic support"],
    },
    {
        tier: "Silver",
        minDeposit: "$1,000",
        withdrawLimit: "$25,000/day",
        bonus: "10% welcome",
        perks: ["Tighter spreads", "Priority support", "Faster withdrawals"],
    },
    {
        tier: "Gold",
        minDeposit: "$5,000",
        withdrawLimit: "$100,000/day",
        bonus: "15% welcome",
        perks: ["Zero‑commission pairs", "Dedicated account manager"],
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
        ],
    },
];

export const AccountLevels = () => (
    <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
            Account Levels & Benefits
        </h2>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-4">
            {tiers.map((t, i) => (
                <LevelCard key={i} {...t} />
            ))}
        </div>
    </section>
);