// src/pages/admin/AdminHome.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaWallet,
  FaExchangeAlt,
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

interface User {
  id: number;
  email: string;
  role: string;
  balance: number;
  roi: number;
  pl: number;
  createdAt: string;
  verified?: boolean;
}

export default function AdminHome() {
  const [visibleFields, setVisibleFields] = useState<{
    [key: number]: { email: boolean; password: boolean };
  }>({});
  const [showForm, setShowForm] = useState(false);

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "all-users"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/users");
      return data;
    },
  });

  const toggleFieldVisibility = (userId: number, field: "email" | "password") => {
    setVisibleFields((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: !prev[userId]?.[field],
      },
    }));
  };

  const maskEmail = (email: string) => {
    const [name, domain] = email.split("@");
    const visibleChars = 3;
    const masked =
      name.substring(0, visibleChars) +
      "*".repeat(Math.max(0, name.length - visibleChars)) +
      "@" +
      domain;
    return masked;
  };

  const stats = [
    {
      label: "Total Users",
      value: users.length,
      icon: <FaUsers />,
      color: "from-blue-600 to-blue-400",
    },
    {
      label: "Total Balance",
      value: `$${users.reduce((sum: number, u: User) => sum + (u.balance || 0), 0).toFixed(2)}`,
      icon: <FaWallet />,
      color: "from-green-600 to-green-400",
    },
    {
      label: "Avg ROI",
      value:
        users.length > 0
          ? ((users.reduce((sum: number, u: User) => sum + (u.roi || 0), 0) / users.length) * 100).toFixed(2) + "%"
          : "0%",
      icon: <FaChartLine />,
      color: "from-purple-600 to-purple-400",
    },
    {
      label: "Pending Transactions",
      value: "12",
      icon: <FaExchangeAlt />,
      color: "from-orange-600 to-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-white/60">
            Manage users, transactions, and platform settings
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-primary hover:bg-accent/90"
        >
          <FaPlus /> Add User
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass rounded-lg bg-gradient-to-br ${stat.color} p-6 text-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="text-3xl opacity-60">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Users Management Table */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">User Management</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white/60">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white/60">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-white/80">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Balance</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">ROI</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">P/L</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white/80">{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {visibleFields[user.id]?.email ? (
                          <span className="text-white">{user.email}</span>
                        ) : (
                          <span className="text-white">{maskEmail(user.email)}</span>
                        )}
                        <button
                          onClick={() => toggleFieldVisibility(user.id, "email")}
                          className="rounded p-1 hover:bg-white/10"
                          title="Toggle email visibility"
                        >
                          {visibleFields[user.id]?.email ? (
                            <FaEyeSlash className="text-white/60" />
                          ) : (
                            <FaEye className="text-white/60" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={user.balance}
                        className="w-20 rounded bg-white/10 px-2 py-1 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        defaultValue={user.roi}
                        className="w-20 rounded bg-white/10 px-2 py-1 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          (user.pl || 0) >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        ${user.pl ? user.pl.toFixed(2) : "0.00"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select className="rounded bg-white/10 px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-accent">
                        <option value="trader">{user.role || "trader"}</option>
                        <option value="admin">admin</option>
                        <option value="viewer">viewer</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="rounded p-2 hover:bg-blue-600/30"
                          title="Edit user"
                        >
                          <FaEdit className="text-blue-400" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="rounded p-2 hover:bg-red-600/30"
                          title="Delete user"
                        >
                          <FaTrash className="text-red-400" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transactions Section */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Pending Transactions</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
            >
              <div className="flex-1">
                <p className="font-semibold text-white">User #{idx + 1}</p>
                <p className="text-sm text-white/60">
                  {idx % 2 === 0 ? "Deposit" : "Withdrawal"} - $1,000.00
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-500"
                >
                  Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-500"
                >
                  Decline
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
