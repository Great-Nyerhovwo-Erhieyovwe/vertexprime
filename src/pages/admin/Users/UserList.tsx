// src/pages/Admin/Users/UserList.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    useUsers,
    useDeleteUser,
} from "../../../hooks/useAdmin";
import { ConfirmationModal } from "../../../components/Admin/ConfirmationModal";
import { motion } from "framer-motion";

export const UserList = () => {
    const { data: users = [], isLoading, isError } = useUsers();
    const deleteMutation = useDeleteUser();

    const [delTarget, setDelTarget] = useState<number | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const confirmDelete = (id: number) => {
        setDelTarget(id);
        setShowConfirm(true);
    };

    const handleDelete = () => {
        if (delTarget !== null) {
            deleteMutation.mutate({ id: delTarget });
        }
        setShowConfirm(false);
        setDelTarget(null);
    };

    if (isLoading) return <p className="text-white">Loading users…</p>;
    if (isError) return <p className="text-red-400">Failed to load users.</p>;

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white">All Users</h2>

            <Link
                to="create"
                className="inline-block rounded bg-accent px-4 py-2 font-medium text-primary hover:bg-accent/90"
            >
                Create New User
            </Link>

            <div className="glass overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-white/20">
                        <tr className="text-white">
                            <th className="p-2">ID</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Created</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u: any) => (
                            <tr
                                key={u.id}
                                className="border-b border-white/10 odd:bg-primary/20 even:bg-primary/10"
                            >
                                <td className="p-2 text-white">{u.id}</td>
                                <td className="p-2 text-white">{u.email}</td>
                                <td className="p-2 capitalize text-white">{u.role}</td>
                                <td className="p-2 text-white/70">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2 space-x-2">
                                    <Link
                                        to={`${u.id}`}
                                        className="rounded bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary/80"
                                    >
                                        Edit
                                    </Link>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => confirmDelete(u.id)}
                                        className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                                    >
                                        Delete
                                    </motion.button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete confirmation modal */}
            <ConfirmationModal
                isOpen={showConfirm}
                title="Delete User"
                message="Are you sure you want to permanently delete this user? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </section>
    );
};

export default UserList;