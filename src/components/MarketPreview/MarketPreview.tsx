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
];

export const MarketPreview = () => (
  <section className="py-12">
    <h2 className="mb-6 text-center text-2xl font-semibold text-white">
      Market Overview
    </h2>
    <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6 px-4">
      {mockAssets.map((a, i) => (
        <AssetCard key={i} {...a} />
      ))}
    </div>
  </section>
);