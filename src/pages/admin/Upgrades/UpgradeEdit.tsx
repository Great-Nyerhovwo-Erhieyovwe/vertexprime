// src/pages/Admin/Upgrades/UpgradeEdit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useUpgradePlans,
    useCreatePlan,
    useUpdatePlan,
} from "../../../hooks/useAdmin";
import { InputField } from "../../../components/Form/InputField";
import { motion } from "framer-motion";

export const UpgradeEdit = () => {
    const { id } = useParams<{ id?: string }>(); // undefined for "create"
    const navigate = useNavigate();

    const { data } = useUpgradePlans();
    const plans = (data || []) as { id: number; name: string; priceMonthly: number; priceAnnual: number; features: string[] }[];
    const editingPlan = plans.find((p) => p.id === Number(id));

    const createMutation = useCreatePlan();
    const updateMutation = useUpdatePlan();

    const [name, setName] = useState("");
    const [priceMonthly, setPriceMonthly] = useState("");
    const [priceAnnual, setPriceAnnual] = useState("");
    const [features, setFeatures] = useState("");

    useEffect(() => {
        if (editingPlan) {
            setName(editingPlan.name);
            setPriceMonthly(editingPlan.priceMonthly.toString());
            setPriceAnnual(editingPlan.priceAnnual.toString());
            setFeatures(editingPlan.features.join("\n"));
        }
    }, [editingPlan]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            priceMonthly: Number(priceMonthly),
            priceAnnual: Number(priceAnnual),
            features: features.split("\n").filter((f) => f.trim() !== ""),
        };

        if (id) {
            // UPDATE
            updateMutation.mutate(
                { id: Number(id), updates: payload },
                {
                    onSuccess: () => navigate("../", { replace: true }),
                    onError: (error) => {
                        console.error("Error updating plan:", error);
                        alert("Failed to update plan.");
                    },
                }
            );
        } else {
            // CREATE
            createMutation.mutate(payload, {
                onSuccess: () => navigate("../", { replace: true }),
                onError: (error) => {
                    console.error("Error creating plan:", error);
                    alert("Failed to create plan.");
                },
            });
        }
    };

    const isEditing = Boolean(id);
    const isPending = isEditing ? updateMutation.isPending : createMutation.isPending;

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">
                {isEditing ? "Edit Upgrade Plan" : "Create New Upgrade Plan"}
            </h2>

            <form onSubmit={handleSubmit} className="glass max-w-lg p-6">
                <InputField
                    label="Plan Name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <InputField
                    label="Monthly Price (USD)"
                    name="priceMonthly"
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(e.target.value)}
                />

                <InputField
                    label="Annual Price (USD)"
                    name="priceAnnual"
                    type="number"
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(e.target.value)}
                />

                <label className="block mt-4 text-sm text-white">
                    Features (one per line)
                    <textarea
                        rows={5}
                        value={features}
                        onChange={(e) => setFeatures(e.target.value)}
                        className="mt-1 block w-full rounded bg-primary px-3 py-2 text-white focus:outline-none"
                        placeholder="e.g. Unlimited trades&#10;Priority support&#10;..."
                    />
                </label>

                <motion.button
                    type="submit"
                    className="mt-4 w-full rounded bg-accent py-2 font-medium text-primary hover:bg-accent/90"
                    whileHover={{ scale: 1.02 }}
                    disabled={isPending}
                >
                    {isPending
                        ? isEditing
                            ? "Saving…"
                            : "Creating…"
                        : isEditing
                            ? "Save Changes"
                            : "Create Plan"}
                </motion.button>
            </form>
        </section>
    );
};

export default UpgradeEdit;