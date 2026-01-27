import { AssetCard } from "./AssetCard";

const mockAssets = [
  {
    name: "EUR/USD",
    symbol: "Forex",
    price: "1.0834",
    change: 0.12,
    data: [1.08, 1.081, 1.082, 1.083, 1.084, 1.0834],
  },
  {
    name: "BTC/USD",
    symbol: "Crypto",
    price: "$27,540",
    change: -1.04,
    data: [27600, 27750, 27800, 27500, 27400, 27540],
  },
  {
    name: "Apple Inc.",
    symbol: "Stocks",
    price: "$185.22",
    change: 0.45,
    data: [184, 184.5, 185, 185.2, 185.1, 185.22],
  },
  {
    name: "S&P 500",
    symbol: "Indices",
    price: "4,210.5",
    change: 0.09,
    data: [4190, 4195, 4200, 4210, 4215, 4210.5],
  },
  {
    name: "Gold",
    symbol: "Commodities",
    price: "$1,950.30",
    change: 0.8,
    data: [1940, 1945, 1950, 1955, 1950, 1950.3],
  },
  {
    name: "ETH/USD",
    symbol: "Crypto",
    price: "$1,650",
    change: 2.1,
    data: [1620, 1630, 1640, 1650, 1645, 1650],
  },
];

export const MarketPreview = () => (
  <section className="py-16">
    <div className="mx-auto max-w-7xl px-4">
      <h2 className="mb-4 text-center text-3xl font-semibold text-white">
        Live Market Overview
      </h2>
      <p className="mb-12 text-center text-white/70 max-w-2xl mx-auto">
        Stay ahead of the market with real-time data across multiple asset classes. Our platform provides instant updates and advanced analytics.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockAssets.map((a, i) => (
          <AssetCard key={i} {...a} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <p className="text-white/60 mb-4">Want to see more markets?</p>
        <button className="bg-accent text-primary px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
          View All Markets
        </button>
      </div>
    </div>
  </section>
);