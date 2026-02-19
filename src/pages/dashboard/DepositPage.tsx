import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

const DepositPageContent: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");

  const depositMethods = [
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      processingTime: "1-3 business days",
      fee: "Free",
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "💳",
      processingTime: "Instant",
      fee: "2%",
    },
    {
      id: "crypto",
      name: "Cryptocurrency",
      icon: "₿",
      processingTime: "10-30 minutes",
      fee: "0.5%",
    },
    {
      id: "wallet",
      name: "Digital Wallet",
      icon: "📱",
      processingTime: "Instant",
      fee: "1%",
    },
  ];

  const selectedMethodData = depositMethods.find((m) => m.id === selectedMethod);
  const [recentDeposits, setRecentDeposits] = useState<Array<any>>([]);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch portfolio balance
    fetch('http://localhost:4000/api/dashboard/portfolio', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAvailableBalance(d.totalBalance || d.balanceUsd || null))
      .catch(() => setAvailableBalance(null));

    // Fetch transactions and filter deposits
    fetch('http://localhost:4000/api/dashboard/transactions?limit=20&offset=0', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setRecentDeposits((d.transactions || []).filter((t:any)=>t.type==='deposit')))
      .catch(() => setRecentDeposits([]));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deposit Funds</h1>
        <p className="text-gray-600 mt-2">Add funds to your trading account</p>
      </div>

      {/* Deposit Methods */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Select Deposit Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depositMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{method.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-600">
                      {method.processingTime}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Fee: {method.fee}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Deposit Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {selectedMethodData?.name}
        </h2>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Deposit
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fee Information */}
          {amount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-medium text-gray-900">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Fee:</span>
                  <span className="font-medium text-gray-900">
                    ${(parseFloat(amount) * 0.02).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="font-bold text-gray-900">
                    ${(parseFloat(amount) * 1.02).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {selectedMethod === "bank" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Bank Account Details
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <p className="text-xs text-gray-500">Account Number</p>
                  <p className="font-mono text-gray-900">8765 4321 0987</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Routing Number</p>
                  <p className="font-mono text-gray-900">121000248</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bank Name</p>
                  <p className="font-mono text-gray-900">
                    VertexPrime Financial Bank
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "crypto" && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
              <p className="text-sm font-medium text-gray-900">
                Wallet Address
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border border-gray-300 rounded font-mono text-xs text-gray-900">
                  1A1z7agoat2YLZW5QN8hgWFh5p0Y8eB7Sc
                </code>
                <button className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Continue Deposit
          </button>
        </div>
      </div>

      {/* Recent Deposits */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Recent Deposits
        </h2>
        <div className="space-y-3">
          {(recentDeposits.length ? recentDeposits : []).map((deposit) => (
            <div
              key={deposit.id || deposit._id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{deposit.method || deposit.paymentMethod || 'Deposit'}</p>
                <p className="text-sm text-gray-600">{deposit.date || deposit.createdAt || ''}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">+${deposit.amount || deposit.value || 0}</p>
                <p className="text-sm text-green-600">{deposit.status || 'Completed'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DepositPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:4000/api/dashboard/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setUser({
        name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
        email: d.email || '',
        isVerified: d.emailVerified || false
      }))
      .catch(() => setUser({ name: 'User', email: '', isVerified: false }));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <DashboardLayout user={user}>
      <DepositPageContent />
    </DashboardLayout>
  );
};

export default DepositPage;
