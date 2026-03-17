import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";
import { Modal } from "../../components/Modal/Modal";
import { Loading } from "../../components/Loading/Loading";

const backendUrl = import.meta.env.VITE_API_URL;

const WithdrawalPageContent: React.FC = () => {
  // STATE
  const [selectedMethod, setSelectedMethod] = useState<string>("bank");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [lastWithdrawalDate, setLastWithdrawalDate] = useState<Date | null>(null);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", type: "info" });

  const [recentWithdrawals, setRecentWithdrawals] = useState<Array<any>>([]);

  // WITHDRAWAL METHODS
  const withdrawalMethods = [
    { id: "bank", name: "Bank Transfer", icon: "🏦", processingTime: "1-3 business days", fee: "Free", enabled: true },
    { id: "card", name: "Debit Card", icon: "💳", processingTime: "1-2 business days", fee: "1%", enabled: false },
    { id: "crypto", name: "Cryptocurrency", icon: "₿", processingTime: "10-30 minutes", fee: "0.5%", enabled: true },
    { id: "wallet", name: "Digital Wallet", icon: "📱", processingTime: "Instant", fee: "1.5%", enabled: false },
  ];

  const selectedMethodData = withdrawalMethods.find((m) => m.id === selectedMethod);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        // return;
      }

      try {
        const [portfolioRes, withdrawalsRes] = await Promise.all([
          fetch(`${backendUrl}/api/dashboard/portfolio`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/requests/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const portfolio = await portfolioRes.json();
        const withdrawals = await withdrawalsRes.json();

        setAvailableBalance(portfolio.totalBalance || portfolio.balanceUsd || 0);

        if (withdrawals.success && withdrawals.withdrawals) {
          // Find last approved withdrawal
          const approved = withdrawals.withdrawals
            .filter((w: any) => w.status === "approved")
            .sort((a: any, b: any) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime());
          
          if (approved.length > 0) {
            setLastWithdrawalDate(new Date(approved[0].approvedAt));
          }

          const sorted = withdrawals.withdrawals.sort(
            (a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
          );
          setRecentWithdrawals(sorted.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // VALIDATION
  const canWithdraw = () => {
    // Check minimum amount
    if (parseFloat(amount || "0") < 500) return { can: false, reason: "Minimum withdrawal is $500" };
    
    // Check maximum daily
    if (parseFloat(amount || "0") > 5000) return { can: false, reason: "Maximum daily withdrawal is $5000" };
    
    // Check balance
    if (parseFloat(amount || "0") > availableBalance) return { can: false, reason: "Insufficient balance" };
    
    // Check weekly frequency
    if (lastWithdrawalDate) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      if (lastWithdrawalDate > oneWeekAgo) {
        const daysLeft = Math.ceil((7 - (Date.now() - lastWithdrawalDate.getTime()) / (24 * 60 * 60 * 1000)));
        return { can: false, reason: `You can withdraw again in ${daysLeft} days` };
      }
    }

    return { can: true };
  };

  // SUBMIT
  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = canWithdraw();
    if (!validation.can) {
      setModal({ isOpen: true, title: "Cannot Withdraw", message: validation.reason || "Cannot withdraw at this time", type: "error" });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const response = await fetch(`${backendUrl}/api/requests/withdrawal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          withdrawalMethod: selectedMethod,
          destinationAddress: selectedMethod === "crypto" ? prompt("Enter destination address:") : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setModal({
          isOpen: true,
          title: "Withdrawal Submitted",
          message: `Your withdrawal of $${amount} has been submitted. Admin approval usually takes 24-48 hours.`,
          type: "success",
        });
        setAmount("");

        setTimeout(() => {
          const token = localStorage.getItem("token");
          fetch(`${backendUrl}/api/requests/withdrawals`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                const sorted = d.withdrawals.sort(
                  (a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
                );
                setRecentWithdrawals(sorted.slice(0, 5));
              }
            });
        }, 1000);
      } else {
        setModal({
          isOpen: true,
          title: "Withdrawal Failed",
          message: data.message || "Failed to submit withdrawal request",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setModal({ isOpen: true, title: "Error", message: "Failed to submit withdrawal", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading isLoading={true} message="Loading withdrawal page..." />;

  return (
    <div className="space-y-6">
      <Loading isLoading={isSubmitting} message="Processing withdrawal request..." />
      <Modal isOpen={modal.isOpen} title={modal.title} message={modal.message} type={modal.type} onClose={() => setModal({ ...modal, isOpen: false })} />

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdraw Funds</h1>
        <p className="text-gray-600 mt-2">Withdraw funds from your trading account</p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
        <p className="text-sm text-gray-600 mb-2">Available Balance</p>
        <p className="text-4xl font-bold text-green-600">
          ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Withdrawal Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {withdrawalMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => method.enabled && setSelectedMethod(method.id)}
              disabled={!method.enabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                !method.enabled
                  ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                  : selectedMethod === method.id
                    ? "border-green-600 bg-green-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{method.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-600">{method.processingTime}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Fee: {method.fee}</p>
                {!method.enabled && (
                  <span className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{selectedMethodData?.name}</h2>

        <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="500"
                max="5000"
                step="0.01"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Min: $500 | Max: $5000 daily | Once per week</p>
          </div>

          {amount && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span className="font-medium">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>${(parseFloat(amount) * 0.01).toFixed(2)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold">
                  <span>You'll Receive:</span>
                  <span>${(parseFloat(amount) * 0.99).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!amount || isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Request Withdrawal"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Withdrawals</h2>
        <div className="space-y-3">
          {recentWithdrawals.length > 0 ? (
            recentWithdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">${withdrawal.amount} - {withdrawal.withdrawalMethod}</p>
                  <p className="text-sm text-gray-600">{new Date(withdrawal.requestedAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    withdrawal.status === "approved" ? "bg-green-100 text-green-800" : withdrawal.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
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
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    fetch(`${backendUrl}/api/dashboard/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d) {
          setUserProfile({
            name: `${d.firstName || ""} ${d.lastName || ""}`.trim() || "User",
            email: d.email || "",
            isVerified: d.emailVerified || false,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <DashboardLayout user={userProfile || { name: "User", email: "" }}>
      <WithdrawalPageContent />
    </DashboardLayout>
  );
};

export default WithdrawalPage;
