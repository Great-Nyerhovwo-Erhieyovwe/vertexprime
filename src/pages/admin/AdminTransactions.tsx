// src/pages/admin/AdminTransactions.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTimesCircle, FaClock, FaFilter } from "react-icons/fa";

interface Transaction {
  id: number;
  userId: number;
  userEmail: string;
  type: "deposit" | "withdrawal";
  amount: number;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  method: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    userEmail: "user1@example.com",
    type: "deposit",
    amount: 5000,
    status: "pending",
    createdAt: "2025-01-29 10:30",
    method: "Bank Transfer",
  },
  {
    id: 2,
    userId: 2,
    userEmail: "user2@example.com",
    type: "withdrawal",
    amount: 2500,
    status: "pending",
    createdAt: "2025-01-29 09:15",
    method: "Wire",
  },
  {
    id: 3,
    userId: 3,
    userEmail: "user3@example.com",
    type: "deposit",
    amount: 10000,
    status: "approved",
    createdAt: "2025-01-28 15:45",
    method: "Card",
  },
  {
    id: 4,
    userId: 4,
    userEmail: "user4@example.com",
    type: "withdrawal",
    amount: 1000,
    status: "declined",
    createdAt: "2025-01-28 12:00",
    method: "Bank Transfer",
  },
];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "declined">("all");

  const filteredTransactions =
    filter === "all" ? transactions : transactions.filter((t) => t.status === filter);

  const handleApprove = (id: number) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, status: "approved" as const } : t))
    );
  };

  const handleDecline = (id: number) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, status: "declined" as const } : t))
    );
  };

  const statusStyles = {
    pending: "bg-yellow-600/20 text-yellow-400 border border-yellow-600/40",
    approved: "bg-green-600/20 text-green-400 border border-green-600/40",
    declined: "bg-red-600/20 text-red-400 border border-red-600/40",
  };

  const statusIcons = {
    pending: <FaClock className="inline mr-2" />,
    approved: <FaCheckCircle className="inline mr-2" />,
    declined: <FaTimesCircle className="inline mr-2" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Transaction Management</h1>
        <p className="mt-2 text-white/60">Approve or decline deposits and withdrawals</p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "approved", "declined"] as const).map((status) => (
          <motion.button
            key={status}
            whileHover={{ scale: 1.05 }}
            onClick={() => setFilter(status)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium capitalize transition-all ${
              filter === status
                ? "bg-accent text-primary shadow-lg shadow-accent/50"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <FaFilter /> {status}
          </motion.button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="glass rounded-lg border border-white/10 p-6">
        {filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-white/60">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left font-semibold text-white/80">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">User</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Amount</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Method</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-white/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-white/80">#{transaction.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white">User {transaction.userId}</p>
                        <p className="text-xs text-white/60">{transaction.userEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-3 py-1 font-semibold ${
                          transaction.type === "deposit"
                            ? "bg-green-600/20 text-green-400"
                            : "bg-blue-600/20 text-blue-400"
                        }`}
                      >
                        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-white/80">{transaction.method}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[transaction.status]}`}>
                        {statusIcons[transaction.status]}
                        {transaction.status.charAt(0).toUpperCase() +
                          transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-xs">{transaction.createdAt}</td>
                    <td className="px-4 py-3">
                      {transaction.status === "pending" ? (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleApprove(transaction.id)}
                            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-500"
                          >
                            Approve
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleDecline(transaction.id)}
                            className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-500"
                          >
                            Decline
                          </motion.button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/60 capitalize">
                          {transaction.status}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
