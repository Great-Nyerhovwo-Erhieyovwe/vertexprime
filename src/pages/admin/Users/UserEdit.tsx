// src/pages/Admin/Users/UserEdit.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    useUsers,
    useUpdateUser,
    useChangeUserPassword,
} from "../../../hooks/useAdmin";
import { InputField } from "../../../components/Form/InputField";
import { motion } from "framer-motion";

/**
 * Admin "Edit User" page.
 *
 * Allows an admin to:
 *   • Change the user's e‑mail address
 *   • Change the user's role (admin / trader / viewer)
 *   • Set a new password for the user
 *
 * All mutations are performed via the admin‑specific hooks in `useAdmin.ts`.
 * The component is wrapped in the `AdminRoute` guard, so only admins can reach it.
 */
export const UserEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // --------------------------------------------------------------
    // 1️⃣ Load all users (the hook caches the list globally)
    // --------------------------------------------------------------
    const { data: users = [], isPending: usersLoading, isError: usersError } =
        useUsers() as { data: { id: number; email: string; role: string }[]; isPending: boolean; isError: boolean }; // Ensure users is typed correctly

    // Find the user we want to edit
    const user = users.find((u) => u.id === Number(id));

    // --------------------------------------------------------------
    // 2️⃣ Mutations
    // --------------------------------------------------------------
    const updateMutation = useUpdateUser();
    const passwordMutation = useChangeUserPassword();

    // --------------------------------------------------------------
    // 3️⃣ Local form state
    // --------------------------------------------------------------
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"admin" | "trader" | "viewer">("trader");
    const [newPassword, setNewPassword] = useState("");

    // Populate the form once the user data is available
    useEffect(() => {
        if (user) {
            setEmail(user.email);
            setRole(user.role as "admin" | "trader" | "viewer");
        }
    }, [user]);

    // -----------------------------------------------------------------
    // Loading / error handling for the initial user fetch
    // -----------------------------------------------------------------
    if (usersLoading) return <p className="text-white">Loading user…</p>;
    if (usersError) return <p className="text-red-400">Failed to load users.</p>;
    if (!user) return <p className="text-white">User not found.</p>;

    // -----------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------
    const handleDetailsSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(
            {
                id: user.id,
                updates: { email, role },
            },
            {
                onSuccess: () => {
                    alert("User details updated.");
                    navigate("../", { replace: true }); // back to the list
                },
                onError: (error) => {
                    console.error("Error updating user:", error);
                    alert("Failed to update user details.");
                },
            }
        );
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }
        passwordMutation.mutate(
            { id: user.id, newPassword },
            {
                onSuccess: () => {
                    alert("Password changed successfully.");
                    setNewPassword("");
                },
                onError: (error) => {
                    console.error("Error changing password:", error);
                    alert("Failed to change password.");
                },
            }
        );
    };

    // -----------------------------------------------------------------
    // UI
    // -----------------------------------------------------------------
    return (
        <section className="space-y-8">
            <h2 className="text-2xl font-bold text-white">
                Edit User #{user.id}
            </h2>

            {/* --------- Edit Email & Role --------- */}
            <form onSubmit={handleDetailsSave} className="glass max-w-md p-6">
                <h3 className="mb-4 text-lg font-medium text-white">
                    Account Details
                </h3>

                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="block mt-4 text-sm text-white">
                    Role
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as "admin" | "trader" | "viewer")}
                        className="mt-1 block w-full rounded bg-primary px-3 py-2 text-white focus:outline-none"
                    >
                        <option value="admin">Admin</option>
                        <option value="trader">Trader</option>
                        <option value="viewer">Viewer (read‑only)</option>
                    </select>
                </label>

                <motion.button
                    type="submit"
                    className="mt-4 w-full rounded bg-accent py-2 font-medium text-primary hover:bg-accent/90"
                    whileHover={{ scale: 1.02 }}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? "Saving…" : "Save Changes"}
                </motion.button>
            </form>

            {/* --------- Change Password --------- */}
            <form onSubmit={handlePasswordSave} className="glass max-w-md p-6">
                <h3 className="mb-4 text-lg font-medium text-white">
                    Change Password
                </h3>

                <InputField
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <motion.button
                    type="submit"
                    className="mt-4 w-full rounded bg-accent py-2 font-medium text-primary hover:bg-accent/90"
                    whileHover={{ scale: 1.02 }}
                    disabled={passwordMutation.isPending}
                >
                    {passwordMutation.isPending ? "Updating…" : "Update Password"}
                </motion.button>
            </form>
        </section>
    );
};

export default UserEdit;