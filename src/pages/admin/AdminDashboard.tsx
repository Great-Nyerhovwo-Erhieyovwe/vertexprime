// @ts-nocheck
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUsers, FiCreditCard, FiTrendingUp, FiCheckCircle, FiMail, FiMessageSquare, FiSettings, FiCheck, FiX, FiDollarSign } from "react-icons/fi";

/**
 * AdminDashboard - Complete Admin Control Panel
 *
 * Main admin interface with 9 tabs for complete platform management:
 * 1. Overview - Summary cards with key metrics (users, deposits, withdrawals, active, verified)
 * 2. Users - Full CRUD for user accounts (view, edit, ban, freeze, delete)
 * 3. Transactions - Approve/reject deposits and withdrawals with admin notes
 * 4. Trades - Manage active trades, close manually with profit/loss calculation
 * 5. Verifications - Approve/reject KYC verifications
 * 6. Upgrades - Manage upgrade plans (coming soon)
 * 7. Messages - Send direct messages and warnings to users (coming soon)
 * 8. Email - Send emails to individual or bulk users (coming soon)
 * 9. Support - Respond to user support tickets (coming soon)
 *
 * All sections are fully commented and responsive for mobile/desktop.
 * Backend API endpoints are protected by admin middleware.
 */
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "transactions" | "trades" | "verifications" | "upgrades" | "messages" | "email" | "support">("overview");
  const qc = useQueryClient();

  // Fetch summary metrics (total users, deposits, withdrawals, active, verified)
//   const { data: summary = {} } = useQuery(["admin", "summary"], async () => {
//     const { data } = await api.get("/api/admin/summary");
//     return data;
//   });


  const { data: summary = {} } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
        const { data } = await api.get("/api/admin/summary");
        return data;
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 p-4 md:p-8">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Control Panel</h1>
        <p className="text-white/70">Manage users, transactions, verifications, and platform operations</p>
      </div>

      {/* OVERVIEW TAB - Display summary cards */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <SummaryCard icon={<FiUsers />} title="Registered Users" value={summary.totalUsers || 0} />
            <SummaryCard icon={<FiCreditCard />} title="Total Deposits" value={`$${(summary.totalDeposits || 0).toLocaleString()}`} />
            <SummaryCard icon={<FiCreditCard />} title="Total Withdrawals" value={`$${(summary.totalWithdrawals || 0).toLocaleString()}`} />
            <SummaryCard icon={<FiTrendingUp />} title="Active Users" value={summary.activeUsers || 0} />
            <SummaryCard icon={<FiCheckCircle />} title="Verified Users" value={summary.verifiedUsers || 0} />
          </div>
        </div>
      )}

      {/* TAB CONTENT SECTIONS */}
      {activeTab === "users" && <UsersSection qc={qc} />}
      {activeTab === "transactions" && <TransactionsSection qc={qc} />}
      {activeTab === "trades" && <TradesSection qc={qc} />}
      {activeTab === "verifications" && <VerificationsSection qc={qc} />}
      {activeTab === "upgrades" && <UpgradesSection qc={qc} />}
      {activeTab === "messages" && <MessagesSection qc={qc} />}
      {activeTab === "email" && <EmailSection qc={qc} />}
      {activeTab === "support" && <SupportSection qc={qc} />}

      {/* TAB NAVIGATION - Fixed bottom on mobile, top on desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary border-t border-white/20 p-4 md:static md:mt-8 md:border-t-0 overflow-x-auto">
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {(["overview", "users", "transactions", "trades", "verifications", "upgrades", "messages", "email", "support"] as const).map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                activeTab === tab
                  ? "bg-accent text-primary"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab === "overview" ? "📊 Overview" : tab === "users" ? "👥 Users" : tab === "transactions" ? "💳 Trans" : tab === "trades" ? "📈 Trades" : tab === "verifications" ? "✓ Verify" : tab === "upgrades" ? "⬆️ Plans" : tab === "messages" ? "💬 Msg" : tab === "email" ? "📧 Email" : "🎫 Support"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Add padding to prevent tab nav from covering content on mobile */}
      <div className="h-24 md:h-0" />
    </div>
  );
}

/**
 * SummaryCard Component
 * 
 * Displays a single metric with icon and value
 * Used in the overview tab to show KPIs
 */
function SummaryCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: any }) {
  return (
    <motion.div
      className="p-6 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all"
      whileHover={{ y: -5 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl text-accent">{icon}</div>
        <div className="text-sm text-white/70">{title}</div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

/**
 * USERS SECTION
 * 
 * Admin capabilities:
 * - View all users with status badges (banned, frozen, verified)
 * - Edit user details: email, name, country
 * - Manage balance (USD) and ROI percentage
 * - Ban/unban user accounts
 * - Freeze/unfreeze accounts (restrict trading)
 * - View password with eye toggle (shows hashed password)
 * - Delete user account completely
 * - Save changes or discard
 * 
 * UI Layout:
 * - Left: User list (2 cols on large screens)
 * - Right: Detail sidebar with edit form (1 col on large screens)
 */
function UsersSection({ qc }: { qc: any }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  // Fetch all users from backend
//   const { data: users = [] } = useQuery(["admin", "users"], async () => {
//     const { data } = await api.get("/api/admin/users");
//     return data;
//   });

    const { data: users = [] } = useQuery({
        queryKey: ["admin", "users"],
        queryFn: async () => {
            const { data } = await api.get("/api/admin/users");
            return data;
        },
    });

        
  // Mutation to update user (calls PATCH /api/admin/users/:id)
  const updateUserMutation = useMutation(
    async ({ id, updates }: { id: string; updates: any }) => api.patch(`/api/admin/users/${id}`, updates),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "users"] });
        qc.invalidateQueries({ queryKey: ["admin", "summary"] });
        alert("User updated successfully");
      },
      onError: () => alert("Error updating user"),
    }
  );

  // Mutation to delete user (calls DELETE /api/admin/users/:id)
  const deleteUserMutation = useMutation(
    async (id: string) => api.delete(`/api/admin/users/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "users"] });
        qc.invalidateQueries({ queryKey: ["admin", "summary"] });
        setSelectedUser(null);
        alert("User deleted successfully");
      },
      onError: () => alert("Error deleting user"),
    }
  );

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setEditForm({ ...user });
    setShowPassword(false);
  };

  const handleSaveUser = () => {
    if (!selectedUser || !editForm) return;
    const updates = {
      firstName: editForm.firstName || "",
      lastName: editForm.lastName || "",
      email: editForm.email,
      balanceUsd: Number(editForm.balanceUsd) || 0,
      roi: Number(editForm.roi) || 0,
      country: editForm.country || "",
      banned: editForm.banned || false,
      frozen: editForm.frozen || false,
      // Bank account fields
      bankAccountHolder: editForm.bankAccountHolder || "",
      bankName: editForm.bankName || "",
      bankAccountNumber: editForm.bankAccountNumber || "",
      bankRoutingNumber: editForm.bankRoutingNumber || "",
      // Crypto wallet addresses
      bitcoinAddress: editForm.bitcoinAddress || "",
      ethereumAddress: editForm.ethereumAddress || "",
      otherCryptoAddresses: editForm.otherCryptoAddresses || "",
    };
    updateUserMutation.mutate({ id: selectedUser._id || selectedUser.id, updates });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: USERS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FiUsers /> Users ({users.length})
        </h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {users.length === 0 && <p className="text-white/70 text-center py-8">No users found</p>}
          {users.map((user: any) => (
            <motion.div
              key={user._id || user.id}
              onClick={() => handleSelectUser(user)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedUser?.id === user.id || selectedUser?._id === user._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-white">{user.email}</div>
                  <div className="text-sm text-white/70">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-white/50 mt-1">Balance: ${(user.balanceUsd || 0).toLocaleString()} | ROI: {user.roi || 0}%</div>
                </div>
                {/* Status badges */}
                <div className="flex flex-col gap-1 text-xs">
                  {user.banned && <span className="px-2 py-1 bg-red-600 rounded text-white font-bold">BAN</span>}
                  {user.frozen && <span className="px-2 py-1 bg-yellow-600 rounded text-white">FROZEN</span>}
                  {user.emailVerified && <span className="px-2 py-1 bg-green-600 rounded text-white">✓</span>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: USER DETAIL SIDEBAR */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">User Details</h3>
        {!selectedUser && <p className="text-white/70 text-center py-8">Select a user to edit details</p>}

        {selectedUser && editForm && (
          <div className="space-y-3 text-sm">
            {/* Email input */}
            <div>
              <label className="block text-white/70 mb-1">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* First Name input */}
            <div>
              <label className="block text-white/70 mb-1">First Name</label>
              <input
                type="text"
                value={editForm.firstName || ""}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* Last Name input */}
            <div>
              <label className="block text-white/70 mb-1">Last Name</label>
              <input
                type="text"
                value={editForm.lastName || ""}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* Country input */}
            <div>
              <label className="block text-white/70 mb-1">Country</label>
              <input
                type="text"
                value={editForm.country || ""}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* Password with toggle visibility (shows hashed password) */}
            <div>
              <label className="block text-white/70 mb-1">Password (Hashed)</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={editForm.password || ""}
                  readOnly
                  className="flex-1 px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-xs"
                />
                {/* Eye icon toggle */}
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white transition-all"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <p className="text-xs text-white/50 mt-1">Note: Showing hashed password if bcrypt encrypted</p>
            </div>

            {/* Balance input (USD) */}
            <div>
              <label className="block text-white/70 mb-1">Balance (USD)</label>
              <input
                type="number"
                value={editForm.balanceUsd || 0}
                onChange={(e) => setEditForm({ ...editForm, balanceUsd: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
              />
            </div>

            {/* ROI input (percentage) */}
            <div>
              <label className="block text-white/70 mb-1">ROI (%)</label>
              <input
                type="number"
                value={editForm.roi || 0}
                onChange={(e) => setEditForm({ ...editForm, roi: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
              />
            </div>

            {/* Ban User checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="banned"
                checked={editForm.banned || false}
                onChange={(e) => setEditForm({ ...editForm, banned: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="banned" className="text-white/70 cursor-pointer">Ban User (disable login)</label>
            </div>

            {/* Freeze Account checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="frozen"
                checked={editForm.frozen || false}
                onChange={(e) => setEditForm({ ...editForm, frozen: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="frozen" className="text-white/70 cursor-pointer">Freeze Account (restrict trading)</label>
            </div>

            {/* BANK ACCOUNT SECTION */}
            <div className="pt-4 border-t border-white/20">
              <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                <FiCreditCard size={16} /> Bank Account Details
              </h4>
              
              <div className="space-y-3">
                {/* Account Holder Name */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Account Holder Name</label>
                  <input
                    type="text"
                    value={editForm.bankAccountHolder || ""}
                    onChange={(e) => setEditForm({ ...editForm, bankAccountHolder: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Bank Name</label>
                  <input
                    type="text"
                    value={editForm.bankName || ""}
                    onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })}
                    placeholder="Chase Bank"
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Account Number</label>
                  <input
                    type="text"
                    value={editForm.bankAccountNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, bankAccountNumber: e.target.value })}
                    placeholder="1234567890"
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>

                {/* Routing Number */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Routing Number</label>
                  <input
                    type="text"
                    value={editForm.bankRoutingNumber || ""}
                    onChange={(e) => setEditForm({ ...editForm, bankRoutingNumber: e.target.value })}
                    placeholder="123456789"
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* WALLET ADDRESSES SECTION */}
            <div className="pt-4 border-t border-white/20">
              <h4 className="text-white font-semibold mb-3 text-sm flex items-center gap-2">
                <FiDollarSign size={16} /> Crypto Wallet Addresses
              </h4>
              
              <div className="space-y-3">
                {/* Bitcoin Address */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Bitcoin Address</label>
                  <input
                    type="text"
                    value={editForm.bitcoinAddress || ""}
                    onChange={(e) => setEditForm({ ...editForm, bitcoinAddress: e.target.value })}
                    placeholder="1A1z7agoat2..."
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>

                {/* Ethereum Address */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Ethereum Address</label>
                  <input
                    type="text"
                    value={editForm.ethereumAddress || ""}
                    onChange={(e) => setEditForm({ ...editForm, ethereumAddress: e.target.value })}
                    placeholder="0x742d35..."
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>

                {/* Other Crypto */}
                <div>
                  <label className="block text-white/70 mb-1 text-xs">Other Crypto Addresses (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.otherCryptoAddresses || ""}
                    onChange={(e) => setEditForm({ ...editForm, otherCryptoAddresses: e.target.value })}
                    placeholder="USDT Address, XRP Address, ..."
                    className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-white/20">
              <button
                onClick={handleSaveUser}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-all"
                disabled={updateUserMutation.isLoading}
              >
                {updateUserMutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(selectedUser._id || selectedUser.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-all"
                disabled={deleteUserMutation.isLoading}
              >
                {deleteUserMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TRANSACTIONS SECTION
 * 
 * Admin capabilities:
 * - View all pending deposits and withdrawals
 * - Approve transactions (credits user balance if deposit)
 * - Reject transactions with optional notes
 * - Add admin notes/reason for each action
 * - Auto-credit user balance when deposit approved
 * - Auto-debit user balance when withdrawal approved
 * 
 * Transaction workflow:
 * 1. User submits deposit/withdrawal request
 * 2. Transaction created with status='pending'
 * 3. Admin reviews and approves/rejects
 * 4. If approved, user balance is updated
 */
function TransactionsSection({ qc }: { qc: any }) {
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch all transactions from backend
  const { data: transactions = [] } = useQuery(["admin", "transactions"], async () => {
    const { data } = await api.get("/api/admin/transactions");
    return data;
  });

    // const { data: transactions = [] } useQuery({
    //     queryKey: ["admin", "transactions"],
    //     queryFn: async () => {
    //         const { data } = await api.get("/api/admin/transactions");
    //         return data;
    //     },
    // });



  // Mutation to update transaction
  //  status (calls PATCH /api/admin/transactions/:id)
  // When creditUser=true and transaction is approved deposit, credits user balance
  const updateTxMutation = useMutation(
    async ({ id, status, creditUser }: any) =>
      api.patch(`/api/admin/transactions/${id}`, { status, adminNotes, creditUser }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "transactions"] });
        qc.invalidateQueries({ queryKey: ["admin", "summary"] });
        setSelectedTx(null);
        setAdminNotes("");
        alert("Transaction updated successfully");
      },
      onError: () => alert("Error updating transaction"),
    }
  );

  // Filter only pending transactions
  const pendingTxs = transactions.filter((t: any) => t.status === "pending");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: TRANSACTIONS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Pending Transactions ({pendingTxs.length})</h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {pendingTxs.length === 0 && <p className="text-white/70 text-center py-8">No pending transactions</p>}
          {pendingTxs.map((tx: any) => (
            <motion.div
              key={tx._id || tx.id}
              onClick={() => {
                setSelectedTx(tx);
                setAdminNotes(tx.adminNotes || "");
              }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedTx?.id === tx.id || selectedTx?._id === tx._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-lg">{tx.type?.toUpperCase()} - ${tx.amount}</div>
                  <div className="text-sm text-white/70">User: {tx.userId}</div>
                  <div className="text-xs text-white/50">Method: {tx.method || "Unknown"}</div>
                </div>
                <span className="text-xs bg-yellow-600 text-white px-3 py-1 rounded font-bold">PENDING</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: APPROVAL FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Approve / Reject</h3>
        {!selectedTx && <p className="text-white/70 text-center py-8">Select a transaction to review</p>}

        {selectedTx && (
          <div className="space-y-3">
            {/* Transaction details */}
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <div className="text-sm"><strong className="text-white/70">Type:</strong> <span className="text-white">{selectedTx.type}</span></div>
              <div className="text-sm"><strong className="text-white/70">Amount:</strong> <span className="text-white">${selectedTx.amount}</span></div>
              <div className="text-sm"><strong className="text-white/70">User ID:</strong> <span className="text-white">{selectedTx.userId}</span></div>
              <div className="text-sm"><strong className="text-white/70">Method:</strong> <span className="text-white">{selectedTx.method || "N/A"}</span></div>
            </div>

            {/* Admin notes textarea */}
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes or reason for rejection..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={3}
            />

            {/* Approve/Reject buttons */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateTxMutation.mutate({
                    id: selectedTx._id || selectedTx.id,
                    status: "approved",
                    creditUser: true,
                  })
                }
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-all flex items-center justify-center gap-2"
                disabled={updateTxMutation.isLoading}
              >
                <FiCheck /> Approve
              </button>
              <button
                onClick={() =>
                  updateTxMutation.mutate({
                    id: selectedTx._id || selectedTx.id,
                    status: "rejected",
                    creditUser: false,
                  })
                }
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-all flex items-center justify-center gap-2"
                disabled={updateTxMutation.isLoading}
              >
                <FiX /> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * TRADES SECTION
 * 
 * Admin capabilities:
 * - View all active trades (can be filtered by status)
 * - Manually close trades
 * - Set result: Win, Loss, or Cancelled
 * - Specify exit price for profit/loss calculation
 * - Add admin notes for manual interventions
 * - System calculates P/L = (exitPrice - entryPrice) * quantity
 * 
 * Use cases:
 * - Close trades that are stuck/not auto-closing
 * - Manually override trade results
 * - Cancel fraudulent or erroneous trades
 */
function TradesSection({ qc }: { qc: any }) {
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [exitPrice, setExitPrice] = useState("");
  const [result, setResult] = useState("win");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch all trades from backend
  const { data: trades = [] } = useQuery(["admin", "trades"], async () => {
    const { data } = await api.get("/api/admin/trades");
    return data;
  });

  // Mutation to close a trade (calls PATCH /api/admin/trades/:id)
  const updateTradeMutation = useMutation(
    async ({ id }: any) =>
      api.patch(`/api/admin/trades/${id}`, {
        status: "closed",
        result,
        exitPrice: Number(exitPrice),
        adminNotes,
      }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "trades"] });
        setSelectedTrade(null);
        setExitPrice("");
        setResult("win");
        setAdminNotes("");
        alert("Trade closed successfully");
      },
      onError: () => alert("Error closing trade"),
    }
  );

  // Filter active trades only
  const activeTrades = trades.filter((t: any) => t.status === "active");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: ACTIVE TRADES LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Active Trades ({activeTrades.length})</h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {activeTrades.length === 0 && <p className="text-white/70 text-center py-8">No active trades</p>}
          {activeTrades.map((trade: any) => (
            <motion.div
              key={trade._id || trade.id}
              onClick={() => {
                setSelectedTrade(trade);
                setExitPrice(trade.exitPrice || "");
              }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedTrade?.id === trade.id || selectedTrade?._id === trade._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-lg">{trade.symbol || "TRADE"} - Entry: ${trade.entryPrice}</div>
                  <div className="text-sm text-white/70">Qty: {trade.quantity} | User: {trade.userId}</div>
                </div>
                <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-bold">ACTIVE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: CLOSE TRADE FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Close Trade</h3>
        {!selectedTrade && <p className="text-white/70 text-center py-8">Select a trade to close</p>}

        {selectedTrade && (
          <div className="space-y-3">
            {/* Trade info */}
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <div className="text-sm"><strong className="text-white/70">Symbol:</strong> <span className="text-white">{selectedTrade.symbol}</span></div>
              <div className="text-sm"><strong className="text-white/70">Entry Price:</strong> <span className="text-white">${selectedTrade.entryPrice}</span></div>
              <div className="text-sm"><strong className="text-white/70">Quantity:</strong> <span className="text-white">{selectedTrade.quantity}</span></div>
            </div>

            {/* Exit Price input */}
            <div>
              <label className="block text-white/70 mb-1 text-sm">Exit Price</label>
              <input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="Enter exit price"
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
              />
            </div>

            {/* Result dropdown */}
            <div>
              <label className="block text-white/70 mb-1 text-sm">Trade Result</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
              >
                <option value="win">Win (Profitable)</option>
                <option value="loss">Loss (Unprofitable)</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Admin notes */}
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Reason for manual closure..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={2}
            />

            {/* Close button */}
            <button
              onClick={() => updateTradeMutation.mutate({ id: selectedTrade._id || selectedTrade.id })}
              className="w-full px-4 py-2 bg-accent hover:bg-accent/80 rounded text-primary font-medium transition-all"
              disabled={updateTradeMutation.isLoading}
            >
              {updateTradeMutation.isLoading ? "Closing..." : "Close Trade"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * VERIFICATIONS SECTION
 * 
 * Admin capabilities:
 * - Review pending KYC and identity verifications
 * - Approve verifications (marks user as emailVerified)
 * - Reject with optional reason
 * - View submission timestamps
 * - Track who reviewed and when
 * 
 * Verification types:
 * - KYC (Know Your Customer): ID, address proof, etc.
 * - Identity verification: Selfie, document scan
 * - Bank verification: Account proof
 */
function VerificationsSection({ qc }: { qc: any }) {
  const [selectedVer, setSelectedVer] = useState<any>(null);
  const [reason, setReason] = useState("");

  // Fetch all verifications
  const { data: verifications = [] } = useQuery(["admin", "verifications"], async () => {
    const { data } = await api.get("/api/admin/verifications");
    return data;
  });

  // Mutation to update verification status (calls PATCH /api/admin/verifications/:id)
  const updateVerMutation = useMutation(
    async ({ id, status }: any) =>
      api.patch(`/api/admin/verifications/${id}`, { status, reason }),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "verifications"] });
        qc.invalidateQueries({ queryKey: ["admin", "summary"] });
        setSelectedVer(null);
        setReason("");
        alert("Verification status updated");
      },
      onError: () => alert("Error updating verification"),
    }
  );

  // Filter pending verifications
  const pendingVers = verifications.filter((v: any) => v.status === "pending");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: VERIFICATIONS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">Pending Verifications ({pendingVers.length})</h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {pendingVers.length === 0 && <p className="text-white/70 text-center py-8">No pending verifications</p>}
          {pendingVers.map((ver: any) => (
            <motion.div
              key={ver._id || ver.id}
              onClick={() => {
                setSelectedVer(ver);
                setReason("");
              }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedVer?._id === ver._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">User: {ver.userId}</div>
                  <div className="text-sm text-white/70">Type: {ver.type || "KYC"}</div>
                  <div className="text-xs text-white/50">Submitted: {new Date(ver.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xs bg-yellow-600 text-white px-3 py-1 rounded font-bold">PENDING</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: REVIEW FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Review Verification</h3>
        {!selectedVer && <p className="text-white/70 text-center py-8">Select a verification to review</p>}

        {selectedVer && (
          <div className="space-y-3">
            {/* Verification details */}
            <div className="bg-white/5 p-3 rounded border border-white/10">
              <div className="text-sm"><strong className="text-white/70">User:</strong> <span className="text-white">{selectedVer.userId}</span></div>
              <div className="text-sm"><strong className="text-white/70">Type:</strong> <span className="text-white">{selectedVer.type || "KYC"}</span></div>
              <div className="text-xs text-white/50 mt-2">Submitted: {new Date(selectedVer.createdAt).toLocaleString()}</div>
            </div>

            {/* Reason textarea (for rejection) */}
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for rejection (if applicable)..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={3}
            />

            {/* Approve/Reject buttons */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  updateVerMutation.mutate({
                    id: selectedVer._id || selectedVer.id,
                    status: "approved",
                  })
                }
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-all flex items-center justify-center gap-2"
                disabled={updateVerMutation.isLoading}
              >
                <FiCheck /> Approve
              </button>
              <button
                onClick={() =>
                  updateVerMutation.mutate({
                    id: selectedVer._id || selectedVer.id,
                    status: "rejected",
                  })
                }
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-all flex items-center justify-center gap-2"
                disabled={updateVerMutation.isLoading}
              >
                <FiX /> Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * UPGRADES SECTION
 * 
 * Admin capabilities:
 * - View all upgrade plans with pricing (monthly, annual)
 * - Create new plans with name, prices, features list
 * - Edit existing plan details
 * - Delete plans
 * - Features field is a comma-separated list
 * 
 * Plan structure:
 * {
 *   name: "Premium",
 *   priceMonthly: 99,
 *   priceAnnual: 999,
 *   features: ["Advanced Analytics", "Priority Support", "Custom Indicators"]
 * }
 */
function UpgradesSection({ qc }: { qc: any }) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({ name: "", priceMonthly: 0, priceAnnual: 0, features: "" });
  const [isCreating, setIsCreating] = useState(false);

  // Fetch all upgrade plans
  const { data: plans = [] } = useQuery(["admin", "plans"], async () => {
    const { data } = await api.get("/api/admin/plans");
    return data;
  });

  // Mutation to create or update plan
  const savePlanMutation = useMutation(
    async (planData: any) => {
      if (selectedPlan?._id || selectedPlan?.id) {
        // Update existing plan
        return api.patch(`/api/admin/plans/${selectedPlan._id || selectedPlan.id}`, planData);
      } else {
        // Create new plan
        return api.post("/api/admin/plans", planData);
      }
    },
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "plans"] });
        setSelectedPlan(null);
        setPlanForm({ name: "", priceMonthly: 0, priceAnnual: 0, features: "" });
        setIsCreating(false);
        alert("Plan saved successfully");
      },
      onError: () => alert("Error saving plan"),
    }
  );

  // Mutation to delete plan
  const deletePlanMutation = useMutation(
    async (id: string) => api.delete(`/api/admin/plans/${id}`),
    {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", "plans"] });
        setSelectedPlan(null);
        alert("Plan deleted successfully");
      },
      onError: () => alert("Error deleting plan"),
    }
  );

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPlanForm({
      name: plan.name,
      priceMonthly: plan.priceMonthly || 0,
      priceAnnual: plan.priceAnnual || 0,
      features: Array.isArray(plan.features) ? plan.features.join(", ") : plan.features || "",
    });
    setIsCreating(false);
  };

  const handleNewPlan = () => {
    setSelectedPlan(null);
    setPlanForm({ name: "", priceMonthly: 0, priceAnnual: 0, features: "" });
    setIsCreating(true);
  };

  const handleSavePlan = () => {
    if (!planForm.name) {
      alert("Plan name is required");
      return;
    }
    const saveData = {
      name: planForm.name,
      priceMonthly: Number(planForm.priceMonthly) || 0,
      priceAnnual: Number(planForm.priceAnnual) || 0,
      features: planForm.features.split(",").map((f: string) => f.trim()).filter((f: string) => f),
    };
    savePlanMutation.mutate(saveData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: PLANS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiSettings /> Upgrade Plans ({plans.length})
          </h2>
          <button
            onClick={handleNewPlan}
            className="px-4 py-2 bg-accent rounded text-primary font-medium hover:bg-accent/80"
          >
            + New Plan
          </button>
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {plans.length === 0 && <p className="text-white/70 text-center py-8">No plans found. Create one!</p>}
          {plans.map((plan: any) => (
            <motion.div
              key={plan._id || plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedPlan?._id === plan._id || selectedPlan?.id === plan.id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-lg">{plan.name}</div>
                  <div className="text-sm text-white/70">${plan.priceMonthly}/mo | ${plan.priceAnnual}/yr</div>
                  <div className="text-xs text-white/50 mt-1">{(plan.features || []).length} features</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: PLAN FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">{isCreating ? "New Plan" : selectedPlan ? "Edit Plan" : "Select a Plan"}</h3>
        {!isCreating && !selectedPlan && <p className="text-white/70 text-center py-8">Click a plan to edit or create new</p>}

        {(isCreating || selectedPlan) && (
          <div className="space-y-3">
            <input
              type="text"
              value={planForm.name}
              onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              placeholder="Plan Name (e.g., Premium)"
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
            <input
              type="number"
              value={planForm.priceMonthly}
              onChange={(e) => setPlanForm({ ...planForm, priceMonthly: e.target.value })}
              placeholder="Monthly Price"
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
            <input
              type="number"
              value={planForm.priceAnnual}
              onChange={(e) => setPlanForm({ ...planForm, priceAnnual: e.target.value })}
              placeholder="Annual Price"
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
            <textarea
              value={planForm.features}
              onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
              placeholder="Features (comma-separated, e.g., Advanced Analytics, Priority Support)"
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePlan}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-medium"
                disabled={savePlanMutation.isLoading}
              >
                Save Plan
              </button>
              {selectedPlan && (
                <button
                  onClick={() => deletePlanMutation.mutate(selectedPlan._id || selectedPlan.id)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
                  disabled={deletePlanMutation.isLoading}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MESSAGES SECTION
 * 
 * Admin capabilities:
 * - Send direct messages to selected users
 * - Send warning messages (flagged for escalation)
 * - Send system notices (broadcast-like messages)
 * - View message history for auditing
 * 
 * Message types:
 * - "direct": Private message from admin
 * - "warning": Warning message (user may face account restrictions)
 * - "notice": System notice (informational)
 */
function MessagesSection({ qc }: { qc: any }) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<"direct" | "warning" | "notice">("direct");

  // Fetch all users for sending messages
  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/users");
      return data;
    },
  }) as any;

  // Mutation to send message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => api.post("/api/admin/messages", messageData),
    onSuccess: () => {
      setMessageText("");
      setSelectedUser(null);
      alert(`${messageType.charAt(0).toUpperCase() + messageType.slice(1)} sent successfully`);
    },
    onError: () => alert("Error sending message"),
  });

  const handleSendMessage = () => {
    if (!selectedUser && messageType === "direct") {
      alert("Please select a user for direct messages");
      return;
    }
    if (!messageText.trim()) {
      alert("Message cannot be empty");
      return;
    }

    const messageData = {
      userId: selectedUser?.id || selectedUser?._id,
      message: messageText,
      type: messageType,
      fromEmail: localStorage.getItem("adminEmail") || "admin@vertexprime.com",
    };

    sendMessageMutation.mutate(messageData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: USERS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FiUsers /> Select User
        </h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {users.length === 0 && <p className="text-white/70 text-center py-8">No users found</p>}
          {users.map((user: any) => (
            <motion.div
              key={user.id || user._id}
              onClick={() => setSelectedUser(user)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedUser?.id === user.id || selectedUser?._id === user._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">{user.firstName || user.name} {user.lastName || ""}</div>
                  <div className="text-sm text-white/70">{user.email}</div>
                </div>
                {user.banned && <span className="text-xs px-2 py-1 bg-red-900/50 text-red-200 rounded">BANNED</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: MESSAGE FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Send Message</h3>

        <div className="space-y-4">
          {/* MESSAGE TYPE SELECTOR */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Message Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(["direct", "warning", "notice"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMessageType(type)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                    messageType === type
                      ? "bg-accent text-primary"
                      : "bg-white/5 border border-white/20 text-white hover:bg-white/10"
                  }`}
                >
                  {type === "direct" ? "📧" : type === "warning" ? "⚠️" : "ℹ️"} {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-white/50 mt-2">
              {messageType === "direct" && "Private message to user"}
              {messageType === "warning" && "Warning for user account"}
              {messageType === "notice" && "System broadcast notice"}
            </p>
          </div>

          {/* USER SELECTION FOR DIRECT MESSAGES */}
          {messageType === "direct" && (
            <div>
              <label className="text-white/80 text-sm font-medium block mb-2">Selected User</label>
              <div className="p-3 rounded bg-white/5 border border-white/20">
                <p className="text-white">{selectedUser ? `${selectedUser.firstName || selectedUser.name} (${selectedUser.email})` : "No user selected"}</p>
              </div>
            </div>
          )}

          {/* MESSAGE INPUT */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter message..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={6}
            />
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={handleSendMessage}
            disabled={(sendMessageMutation as any).isPending || (messageType === "direct" && !selectedUser)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white font-medium"
          >
            {(sendMessageMutation as any).isPending ? "Sending..." : "Send Message"}
          </button>

          {/* INFO BOX */}
          <div className="p-3 bg-blue-900/30 border border-blue-700/50 rounded text-xs text-white/80">
            <div className="font-semibold mb-1">Message Info:</div>
            <ul className="space-y-1 text-white/70">
              <li>• Direct: Private message to user</li>
              <li>• Warning: Account action warning</li>
              <li>• Notice: System information</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * EMAIL SECTION
 * 
 * Admin capabilities:
 * - Send emails to individual users or bulk recipients
 * - Pre-built email templates for common scenarios
 * - Email subject and body customization
 * - Delivery tracking and email logs
 * - HTML email content support
 * 
 * Common templates:
 * - Welcome email (account activation)
 * - Verification reminder
 * - Transaction confirmation
 * - Account upgrade notification
 */
function EmailSection({ qc }: { qc: any }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("custom");
  const [bulkEmailInput, setBulkEmailInput] = useState("");

  // Fetch all users for email selection
  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/users");
      return data;
    },
  }) as any;

  // Pre-built email templates
  const templates: Record<string, { subject: string; body: string }> = {
    custom: { subject: "", body: "" },
    welcome: {
      subject: "Welcome to Vertex Prime Capital",
      body: "Thank you for joining Vertex Prime Capital. Your account is now ready to use. Please complete your profile and verify your identity to start trading.",
    },
    verification: {
      subject: "Verify Your Identity",
      body: "To complete your account setup, please verify your identity. This helps us ensure the security of your account and comply with regulations.",
    },
    upgrade: {
      subject: "Account Upgrade Available",
      body: "Congratulations! You're eligible for an account upgrade. Explore our premium plans to unlock advanced trading features and increased limits.",
    },
    depositConfirm: {
      subject: "Deposit Confirmation",
      body: "Your deposit has been received and is being processed. You'll receive a confirmation once the funds are credited to your account.",
    },
  };

  // Mutation to send email
  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => api.post("/api/admin/email", emailData),
    onSuccess: () => {
      setSelectedUsers([]);
      setBulkEmailInput("");
      setEmailSubject("");
      setEmailBody("");
      setEmailTemplate("custom");
      alert("Email(s) sent successfully");
    },
    onError: () => alert("Error sending email"),
  });

  const handleTemplateChange = (template: string) => {
    setEmailTemplate(template);
    if (template !== "custom" && templates[template]) {
      setEmailSubject(templates[template].subject);
      setEmailBody(templates[template].body);
    }
  };

  const handleSendEmail = () => {
    if (selectedUsers.length === 0 && !bulkEmailInput.trim()) {
      alert("Please select users or enter email addresses");
      return;
    }
    if (!emailSubject.trim()) {
      alert("Email subject is required");
      return;
    }
    if (!emailBody.trim()) {
      alert("Email body is required");
      return;
    }

    // Combine selected user emails with bulk email input
    const userEmails = selectedUsers.map((userId) => {
      const user = users.find((u: any) => (u.id || u._id) === userId);
      return user?.email;
    });
    const bulkEmails = bulkEmailInput.split("\n").map((e) => e.trim()).filter((e) => e);
    const allEmails = [...new Set([...userEmails, ...bulkEmails])];

    const emailData = {
      recipients: allEmails,
      subject: emailSubject,
      body: emailBody,
      template: emailTemplate !== "custom" ? emailTemplate : undefined,
      sentBy: localStorage.getItem("adminEmail") || "admin@vertexprime.com",
    };

    sendEmailMutation.mutate(emailData);
  };

  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: USERS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FiMail /> Select Recipients
          </h2>
          <span className="text-sm text-accent">{selectedUsers.length} selected</span>
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {users.length === 0 && <p className="text-white/70 text-center py-8">No users found</p>}
          {users.map((user: any) => (
            <div
              key={user.id || user._id}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id || user._id)}
                  onChange={() => toggleUserSelection(user.id || user._id)}
                  className="w-4 h-4 rounded"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white">{user.firstName || user.name} {user.lastName || ""}</div>
                  <div className="text-sm text-white/70">{user.email}</div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: EMAIL FORM */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Compose Email</h3>

        <div className="space-y-4">
          {/* TEMPLATE SELECTOR */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Template</label>
            <select
              value={emailTemplate}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
            >
              <option value="custom">Custom Email</option>
              <option value="welcome">Welcome Email</option>
              <option value="verification">Verification Reminder</option>
              <option value="upgrade">Upgrade Notification</option>
              <option value="depositConfirm">Deposit Confirmation</option>
            </select>
          </div>

          {/* BULK EMAIL INPUT */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Or Enter Emails (one per line)</label>
            <textarea
              value={bulkEmailInput}
              onChange={(e) => setBulkEmailInput(e.target.value)}
              placeholder="user1@email.com&#10;user2@email.com&#10;..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={3}
            />
          </div>

          {/* EMAIL SUBJECT */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
          </div>

          {/* EMAIL BODY */}
          <div>
            <label className="text-white/80 text-sm font-medium block mb-2">Message</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Email body..."
              className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
              rows={5}
            />
          </div>

          {/* SEND BUTTON */}
          <button
            onClick={handleSendEmail}
            disabled={(sendEmailMutation as any).isPending}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-white font-medium"
          >
            {(sendEmailMutation as any).isPending ? "Sending..." : "Send Email(s)"}
          </button>

          {/* INFO */}
          <div className="p-3 bg-green-900/30 border border-green-700/50 rounded text-xs text-white/80">
            <div className="font-semibold mb-1">Email Info:</div>
            <p className="text-white/70">You can select users from the left panel or enter emails directly. Templates can save time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SUPPORT SECTION
 * 
 * Admin capabilities:
 * - View all user support tickets
 * - Reply to tickets with admin response
 * - Change ticket status (open→in-progress→resolved→closed)
 * - Ticket categorization (technical, billing, account, general)
 * - Priority levels (low, medium, high, critical)
 * - SLA tracking (response time, resolution time)
 * 
 * Ticket status flow:
 * - open: New ticket awaiting admin response
 * - in-progress: Admin is working on the issue
 * - resolved: Issue resolved, awaiting user confirmation
 * - closed: Ticket closed (either resolved or user confirmed)
 */
function SupportSection({ qc }: { qc: any }) {
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState("");
  const [ticketStatus, setTicketStatus] = useState<"open" | "in-progress" | "resolved" | "closed">("open");

  // Fetch all support tickets
  const { data: tickets = [] } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: async () => {
      const { data } = await api.get("/api/admin/tickets");
      return data;
    },
  }) as any;

  // Mutation to update ticket
  const updateTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => api.patch(`/api/admin/tickets/${selectedTicket.id || selectedTicket._id}`, ticketData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
      setReplyText("");
      alert("Ticket updated successfully");
    },
    onError: () => alert("Error updating ticket"),
  });

  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyText("");
    setTicketStatus(ticket.status || "open");
  };

  const handleReply = () => {
    if (!replyText.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    const updateData = {
      reply: replyText,
      status: ticketStatus,
      repliedAt: new Date().toISOString(),
      repliedBy: localStorage.getItem("adminEmail") || "admin@vertexprime.com",
    };

    updateTicketMutation.mutate(updateData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-900/50 text-red-200";
      case "in-progress":
        return "bg-yellow-900/50 text-yellow-200";
      case "resolved":
        return "bg-blue-900/50 text-blue-200";
      case "closed":
        return "bg-green-900/50 text-green-200";
      default:
        return "bg-gray-900/50 text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-white/70";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT: TICKETS LIST */}
      <div className="lg:col-span-2 bg-white/5 rounded-lg p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FiMessageSquare /> Support Tickets ({tickets.length})
        </h2>
        <div className="space-y-2 max-h-[70vh] overflow-auto">
          {tickets.length === 0 && <p className="text-white/70 text-center py-8">No tickets found</p>}
          {tickets.map((ticket: any) => (
            <motion.div
              key={ticket.id || ticket._id}
              onClick={() => handleSelectTicket(ticket)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedTicket?.id === ticket.id || selectedTicket?._id === ticket._id
                  ? "bg-accent/20 border border-accent"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              whileHover={{ x: 5 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">#{ticket.ticketId || ticket.id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(ticket.status)}`}>{ticket.status || "open"}</span>
                    <span className={`text-xs px-2 py-1 rounded bg-white/10 ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority || "Medium"}
                    </span>
                  </div>
                  <div className="font-medium text-white text-sm">{ticket.subject}</div>
                  <div className="text-xs text-white/70 mt-1">{ticket.userEmail || ticket.userName}</div>
                  <div className="text-xs text-white/50 mt-1">Opened: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT: TICKET DETAIL & REPLY */}
      <div className="bg-white/5 rounded-lg p-6 border border-white/20 h-fit sticky top-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ticket Details</h3>

        {!selectedTicket && <p className="text-white/70 text-center py-8">Select a ticket to view details</p>}

        {selectedTicket && (
          <div className="space-y-4">
            {/* TICKET INFO */}
            <div className="p-4 rounded bg-white/5 border border-white/20 space-y-2">
              <div>
                <label className="text-white/80 text-xs font-medium">TICKET ID</label>
                <p className="text-white">{selectedTicket.ticketId || selectedTicket.id}</p>
              </div>
              <div>
                <label className="text-white/80 text-xs font-medium">SUBJECT</label>
                <p className="text-white text-sm">{selectedTicket.subject}</p>
              </div>
              <div>
                <label className="text-white/80 text-xs font-medium">USER</label>
                <p className="text-white text-sm">{selectedTicket.userEmail || selectedTicket.userName}</p>
              </div>
              <div>
                <label className="text-white/80 text-xs font-medium">MESSAGE</label>
                <p className="text-white text-sm mt-1 max-h-32 overflow-auto">{selectedTicket.message}</p>
              </div>
            </div>

            {/* STATUS & PRIORITY */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-white/80 text-xs font-medium block mb-1">Status</label>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-white/80 text-xs font-medium block mb-1">Priority</label>
                <div className="px-3 py-2 rounded bg-white/5 border border-white/20 text-white text-sm">
                  {selectedTicket.priority || "Medium"}
                </div>
              </div>
            </div>

            {/* REPLY FORM */}
            <div>
              <label className="text-white/80 text-sm font-medium block mb-2">Your Reply</label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response..."
                className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm"
                rows={4}
              />
            </div>

            {/* SEND REPLY BUTTON */}
            <button
              onClick={handleReply}
              disabled={(updateTicketMutation as any).isPending}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-white font-medium"
            >
              {(updateTicketMutation as any).isPending ? "Sending..." : "Send Reply & Update Status"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
