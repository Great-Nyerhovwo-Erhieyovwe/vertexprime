import React, { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/Dashboard/DashboardLayout";

const TradePageContent: React.FC = () => {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [symbol, setSymbol] = useState<string>("BTC");
  const [amount, setAmount] = useState<string>("");

  const [cryptoAssets, setCryptoAssets] = useState<Array<any>>([]);
  const [openTrades, setOpenTrades] = useState<Array<any>>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Fetch market data
    fetch('http://localhost:4000/api/market')
      .then((r) => r.json())
      .then((d) => setCryptoAssets(d.markets || []))
      .catch(() => setCryptoAssets([]));

    // Fetch portfolio open positions as open trades
    if (token) {
      fetch('http://localhost:4000/api/dashboard/portfolio', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((d) => setOpenTrades(d.openPositions || []))
        .catch(() => setOpenTrades([]));
    }
  }, []);

  const selectedAsset = cryptoAssets.find((a) => a.symbol === symbol) || cryptoAssets.find((a:any)=>a.symbol?.startsWith(symbol)) || undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Trade</h1>
        <p className="text-gray-600 mt-2">Buy and sell cryptocurrency instantly</p>
      </div>

      {/* Trade Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {/* Trade Type Selector */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setTradeType("buy")}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                tradeType === "buy"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setTradeType("sell")}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                tradeType === "sell"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sell
            </button>
          </div>

          <div className="space-y-4">
            {/* Asset Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Asset
              </label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cryptoAssets.map((asset) => (
                  <option key={asset.symbol} value={asset.symbol}>
                    {asset.symbol} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Price */}
            {selectedAsset && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{selectedAsset.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedAsset.price.toFixed(2)}
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        selectedAsset.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedAsset.change >= 0 ? "+" : ""}
                      {selectedAsset.change}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({symbol})
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Estimated Value */}
            {amount && selectedAsset && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Amount:</span>
                  <span className="font-medium text-gray-900">
                    {amount} {symbol}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700">Price:</span>
                  <span className="font-medium text-gray-900">
                    ${selectedAsset.price.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex justify-between">
                  <span className="text-gray-700 font-medium">Total:</span>
                  <span className="font-bold text-gray-900">
                    ${(parseFloat(amount) * selectedAsset.price).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Trade Button */}
            <button
              disabled={!amount}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tradeType === "buy"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {tradeType === "buy" ? "Buy" : "Sell"} {symbol}
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Market Overview
          </h2>
          <div className="space-y-3">
            {cryptoAssets.map((asset: any) => (
              <button
                key={asset.symbol}
                onClick={() => setSymbol(asset.symbol)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                  symbol === asset.symbol
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{asset.symbol}</p>
                    <p className="text-xs text-gray-600">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${asset.price.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        asset.change >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {asset.change >= 0 ? "+" : ""}
                      {asset.change}%
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Open Trades */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Open Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Asset
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Entry Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  P&L
                </th>
              </tr>
            </thead>
            <tbody>
              { (openTrades.length ? openTrades : [
                    {
                      symbol: "BTC",
                      type: "Buy",
                      amount: 0.5,
                      entryPrice: 40000,
                      current: 42500,
                      pnl: 1250,
                    }
                  ])
                .map((trade, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {trade.symbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {trade.amount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    ${trade.entryPrice}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    ${trade.current}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">
                    +${trade.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TradePage: React.FC = () => {
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
      <TradePageContent />
    </DashboardLayout>
  );
};

export default TradePage;
