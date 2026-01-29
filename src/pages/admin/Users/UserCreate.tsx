// src/pages/Admin/Users/UserCreate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../../../hooks/useAdmin";
import { InputField } from "../../../components/Form/InputField";
import { motion } from "framer-motion";

export const UserCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<"admin" | "trader" | "viewer">("trader");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Email and password are required.");
            return;
        }
        createMutation.mutate(
            { email, password, role },
            {
                onSuccess: () => navigate("../", { replace: true }), // back to user list
            }
        );
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        if (selectedValue === "admin" || selectedValue === "trader" || selectedValue === "viewer") {
            setRole(selectedValue);
        }
    };

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Create New User</h2>

            <form onSubmit={handleSubmit} className="glass max-w-md p-6">
                <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <InputField
                    label="Temporary Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <label className="block mt-4 text-sm text-white">
                    Role
                    <select
                        value={role}
                        onChange={handleRoleChange}
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
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? "Creating…" : "Create User"}
                </motion.button>
            </form>
        </section>
    );
};

export default UserCreate;