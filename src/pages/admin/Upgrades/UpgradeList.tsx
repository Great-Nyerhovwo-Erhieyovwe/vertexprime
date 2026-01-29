// src/pages/Admin/Upgrades/UpgradeList.tsx
import { Link } from "react-router-dom";
import { useUpgradePlans, useDeletePlan } from "../../../hooks/useAdmin";
import { ConfirmationModal } from "../../../components/Admin/ConfirmationModal";
import { motion } from "framer-motion";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Plan {
    id: number;
    name: string;
    priceMonthly: number;
    priceAnnual: number;
    features: string[];
}

export const UpgradeList = () => {
    const { data: plans = [], isPending, isError } = useUpgradePlans();
    const deleteMutation = useDeletePlan();

    const [delTarget, setDelTarget] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const confirmDelete = (id: number) => {
        setDelTarget(id);
        setShowConfirm(true);
    };

    const handleDelete = () => {
        if (delTarget !== null) {
            deleteMutation.mutate(
                { id: delTarget },
                {
                    onSuccess: () => {
                        setShowConfirm(false);
                        setDelTarget(null);
                        alert("Plan deleted successfully.");
                    },
                    onError: (error) => {
                        console.error("Error deleting plan:", error);
                        alert("Failed to delete plan.");
                        setShowConfirm(false);
                        setDelTarget(null);
                    },
                }
            );
        }
    };

    if (isPending) return <p className="text-white">Loading plans…</p>;
    if (isError) return <p className="text-red-400">Failed to load plans.</p>;

    return (
        <section className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Upgrade Plans</h2>
                <p className="text-white/60">Manage subscription tiers and pricing</p>
            </div>

            <Link
                to="create"
                className="inline-block rounded bg-accent px-4 py-2 font-medium text-primary hover:bg-accent/90 transition-colors"
            >
                + Create New Plan
            </Link>

            <div className="glass overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left">
                    <thead className="border-b border-white/20 bg-white/5">
                        <tr className="text-white text-sm font-semibold">
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Monthly</th>
                            <th className="px-6 py-3">Annual</th>
                            <th className="px-6 py-3">Features</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plans.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-white/60">
                                    No upgrade plans found.{" "}
                                    <Link to="create" className="text-accent hover:underline">
                                        Create one
                                    </Link>
                                </td>
                            </tr>
                        ) : (
                            plans.map((plan: Plan) => (
                                <motion.tr
                                    key={plan.id}
                                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <td className="px-6 py-4 text-white font-medium">{plan.id}</td>
                                    <td className="px-6 py-4 text-white font-medium">{plan.name}</td>
                                    <td className="px-6 py-4 text-white">${plan.priceMonthly}</td>
                                    <td className="px-6 py-4 text-white">${plan.priceAnnual}</td>
                                    <td className="px-6 py-4 text-white/80 text-sm">
                                        <ul className="space-y-1">
                                            {plan.features.slice(0, 3).map((f: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="w-1 h-1 rounded-full bg-accent"></span>
                                                    {f}
                                                </li>
                                            ))}
                                            {plan.features.length > 3 && (
                                                <li className="text-accent text-xs">
                                                    +{plan.features.length - 3} more
                                                </li>
                                            )}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4 space-x-2 flex">
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                            <Link
                                                to={`${plan.id}`}
                                                className="inline-flex items-center gap-2 rounded bg-primary/40 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/60 transition-colors"
                                            >
                                                <FaEdit /> Edit
                                            </Link>
                                        </motion.div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => confirmDelete(plan.id)}
                                            disabled={deleteMutation.isPending}
                                            className="inline-flex items-center gap-2 rounded bg-red-600/40 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-600/60 transition-colors disabled:opacity-50"
                                        >
                                            <FaTrash /> Delete
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Delete confirmation modal */}
            <ConfirmationModal
                isOpen={showConfirm}
                title="Delete Upgrade Plan"
                message="Are you sure you want to permanently delete this plan? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </section>
    );
};

export default UpgradeList;