import { StepCard } from "./StepCard";

const steps = [
    {
        number: 1,
        title: "Create an Account",
        description: "Sign up with email or Google and set a strong password.",
    },
    {
        number: 2,
        title: "Verify Your Identity",
        description: "Complete KYC by uploading ID and a selfie.",
    },
    {
        number: 3,
        title: "Fund Your Wallet",
        description: "Deposit fiat or crypto instantly via supported methods.",
    },
    {
        number: 4,
        title: "Start Trading",
        description: "Choose an asset, set leverage, and execute your trade.",
    },
    {
        number: 5,
        title: "Withdraw Profits",
        description: "Request a withdrawal; once approved, funds arrive within minutes.",
    },
];

export const HowItWorks = () => (
    <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold text-white">
            How It Works
        </h2>
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-4">
            {steps.map((s) => (
                <StepCard key={s.number} {...s} />
            ))}
        </div>
    </section>
);