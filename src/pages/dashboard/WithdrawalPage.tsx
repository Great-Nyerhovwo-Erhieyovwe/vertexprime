import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

const WithdrawalPageContent: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [recentWithdrawals, setRecentWithdrawals] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  const withdrawalMethods = [
    {
      id: "bank",
      name: "Bank Transfer",
      icon: "🏦",
      processingTime: "1-3 business days",
      fee: "Free",
    },
    {
      id: "card",
      name: "Debit Card",
      icon: "💳",
      processingTime: "1-2 business days",
      fee: "1%",
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
      fee: "1.5%",
    },
  ];

  const selectedMethodData = withdrawalMethods.find((m) => m.id === selectedMethod);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch('http://localhost:4000/api/dashboard/portfolio', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:4000/api/dashboard/transactions?limit=20&offset=0', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ]).then(([portfolioData, transactionsData]) => {
      setAvailableBalance(portfolioData.totalBalance || portfolioData.balanceUsd || 0);
      setRecentWithdrawals((transactionsData.transactions || []).filter((t: any) => t.type === 'withdrawal'));
      setLoading(false);
    }).catch(() => {
      setAvailableBalance(0);
      setRecentWithdrawals([]);
      setLoading(false);
    });
  }, []);

  const formattedBalance = availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const balanceDisplay = loading ? "Loading..." : ("$" + formattedBalance);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-600 mt-2">
          Transfer funds from your trading account
        </p>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <p className="text-sm text-gray-600 mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-green-600">{balanceDisplay}</p>
      </div>

      {/* Withdrawal Methods */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Select Withdrawal Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {withdrawalMethods.map((method) => (
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

      {/* Withdrawal Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {selectedMethodData?.name}
        </h2>

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                max={availableBalance}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Max: ${availableBalance.toFixed(2)}
            </p>
          </div>

          {/* Fee Information */}
          {amount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Withdrawal Amount:</span>
                  <span className="font-medium text-gray-900">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Fee:</span>
                  <span className="font-medium text-gray-900">
                    ${(parseFloat(amount) * 0.01).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">
                    You'll Receive:
                  </span>
                  <span className="font-bold text-gray-900">
                    ${(parseFloat(amount) * 0.99).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Destination Address */}
          {selectedMethod !== "bank" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination Address
              </label>
              <input
                type="text"
                placeholder="Enter your wallet or account address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Terms Agreement */}
          <div className="flex items-start gap-3">
            <input type="checkbox" id="terms" className="mt-1" />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I understand the withdrawal will incur a fee and confirm the
              destination address is correct
            </label>
          </div>

          {/* Submit Button */}
          <button className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!amount || loading}
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* Recent Withdrawals */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Recent Withdrawals
        </h2>
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-600 text-center py-4">Loading...</p>
          ) : recentWithdrawals.length > 0 ? (
            recentWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id || withdrawal._id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-900">{withdrawal.method || withdrawal.paymentMethod || 'Withdrawal'}</p>
                  <p className="text-sm text-gray-600">{new Date(withdrawal.date || withdrawal.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">-${(withdrawal.amount || withdrawal.value || 0).toFixed(2)}</p>
                  <p className="text-sm text-green-600">{withdrawal.status || 'Completed'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-center py-4">No withdrawals yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const WithdrawalPage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:4000/api/dashboard/user', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ''} ${d.lastName || ''}`.trim() || 'User',
            email: d.email || '',
            isVerified: d.emailVerified || false
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: 'User', email: '' }}>
      <WithdrawalPageContent />
    </DashboardLayout>
  );
};

export default WithdrawalPage;
