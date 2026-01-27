import { StepCard } from "./StepCard";

const steps = [
    {
        number: 1,
        title: "Create an Account",
        description: "Sign up with email or Google and set a strong password. Our registration process takes less than 2 minutes.",
    },
    {
        number: 2,
        title: "Verify Your Identity",
        description: "Complete KYC by uploading ID and a selfie. We use advanced AI verification for quick approval.",
    },
    {
        number: 3,
        title: "Fund Your Wallet",
        description: "Deposit fiat or crypto instantly via supported methods. We accept credit cards, bank transfers, and crypto wallets.",
    },
    {
        number: 4,
        title: "Start Trading",
        description: "Choose an asset, set leverage, and execute your trade. Use our advanced platform with real-time data.",
    },
    {
        number: 5,
        title: "Withdraw Profits",
        description: "Request a withdrawal; once approved, funds arrive within minutes. Multiple withdrawal options available.",
    },
    {
        number: 6,
        title: "Grow Your Portfolio",
        description: "Monitor performance, use analytics tools, and scale your trading strategy with our expert resources.",
    },
];

export const HowItWorks = () => (
    <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-4 text-center text-3xl font-semibold text-white">
                How It Works
            </h2>
            <p className="mb-12 text-center text-white/70 max-w-2xl mx-auto">
                Getting started with VertexPrime Capital is simple and secure. Follow these steps to begin your trading journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {steps.map((s) => (
                    <StepCard key={s.number} {...s} />
                ))}
            </div>
        </div>
    </section>
);