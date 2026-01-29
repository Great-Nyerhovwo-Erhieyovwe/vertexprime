// src/pages/admin/AdminReports.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaChartLine,
  FaChartBar,
  FaDollarSign,
  FaUsers,
  FaDownload,
} from "react-icons/fa";

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({ start: "2025-01-01", end: "2025-01-29" });

  const reportMetrics = [
    {
      label: "Total Revenue",
      value: "$125,450.00",
      change: "+12.5%",
      icon: <FaDollarSign />,
      color: "from-green-600 to-green-400",
    },
    {
      label: "Active Users",
      value: "1,234",
      change: "+8.2%",
      icon: <FaUsers />,
      color: "from-blue-600 to-blue-400",
    },
    {
      label: "Transactions",
      value: "5,678",
      change: "+23.1%",
      icon: <FaChartBar />,
      color: "from-purple-600 to-purple-400",
    },
    {
      label: "Avg Profit/User",
      value: "$101.75",
      change: "+5.3%",
      icon: <FaChartLine />,
      color: "from-orange-600 to-orange-400",
    },
  ];

  const downloadReport = (format: string) => {
    console.log(`Downloading report in ${format} format`);
    // Implement actual download logic
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">Reports & Analytics</h1>
        <p className="mt-2 text-white/60">View detailed platform analytics and performance</p>
      </div>

      {/* Date Range Filter */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Report Period</h2>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/80">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-white/80">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="mt-2 w-full rounded-lg bg-white/10 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex items-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => downloadReport("pdf")}
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2 font-semibold text-primary hover:bg-accent/90"
            >
              <FaDownload /> PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => downloadReport("csv")}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2 font-semibold text-white hover:bg-white/20"
            >
              <FaDownload /> CSV
            </motion.button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {reportMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`glass rounded-lg bg-gradient-to-br ${metric.color} p-6 text-white`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{metric.label}</p>
                <p className="mt-2 text-2xl font-bold">{metric.value}</p>
                <p className="mt-2 text-xs font-semibold text-green-300">{metric.change}</p>
              </div>
              <div className="text-3xl opacity-60">{metric.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Breakdown */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Revenue Breakdown</h2>
        <div className="space-y-4">
          {[
            { name: "Deposits", amount: 85000, percentage: 67.7 },
            { name: "Trading Commissions", amount: 28450, percentage: 22.7 },
            { name: "Upgrade Plans", amount: 12000, percentage: 9.6 },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-white">{item.name}</span>
                <span className="text-sm text-white/60">
                  ${item.amount.toFixed(0)} ({item.percentage}%)
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.percentage}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    idx === 0
                      ? "bg-green-500"
                      : idx === 1
                        ? "bg-blue-500"
                        : "bg-purple-500"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Statistics */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">User Statistics</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-white/60">New Users (This Month)</p>
            <p className="mt-2 text-3xl font-bold text-white">234</p>
            <p className="mt-1 text-xs text-green-400">+12% vs last month</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-white/60">Active Traders</p>
            <p className="mt-2 text-3xl font-bold text-white">856</p>
            <p className="mt-1 text-xs text-green-400">+8% vs last month</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm text-white/60">Churn Rate</p>
            <p className="mt-2 text-3xl font-bold text-white">2.3%</p>
            <p className="mt-1 text-xs text-red-400">-0.5% vs last month</p>
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <h2 className="mb-6 text-2xl font-bold text-white">Top Users by Volume</h2>
        <div className="space-y-3">
          {[
            { rank: 1, name: "User 1", volume: 125000, change: "+15%" },
            { rank: 2, name: "User 2", volume: 98500, change: "+8%" },
            { rank: 3, name: "User 3", volume: 76200, change: "+22%" },
            { rank: 4, name: "User 4", volume: 65800, change: "-5%" },
            { rank: 5, name: "User 5", volume: 54300, change: "+11%" },
          ].map((user) => (
            <div
              key={user.rank}
              className="flex items-center justify-between rounded-lg bg-white/5 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-accent">#{user.rank}</div>
                <div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <p className="text-xs text-white/60">Trading Volume</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">${user.volume.toLocaleString()}</p>
                <p className={`text-xs font-semibold ${user.change.startsWith("-") ? "text-red-400" : "text-green-400"}`}>
                  {user.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
