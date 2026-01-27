import { motion } from "framer-motion";
import { createChart, ColorType, LineSeries, type UTCTimestamp } from "lightweight-charts";
import React from "react";

export const DashboardMock = () => {
    // Simple chart mount
    const chartRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!chartRef.current) return;
        const chart = createChart(chartRef.current, {
            width: 400,
            height: 200,
            layout: { background: { type: ColorType.Solid, color: "#0a0f33" } },
            grid: { vertLines: { visible: false }, horzLines: { visible: false } },
            timeScale: { visible: false },
            rightPriceScale: { visible: false },
        });
        const line = chart.addSeries(LineSeries, { color: "#00d8ff", lineWidth: 2 });
        line.setData(
            Array.from({ length: 30 }, (_, i) => ({
                time: i as UTCTimestamp,
                value: Math.sin(i / 5) * 10 + 50,
            }))
        );
        return () => chart.remove();
    }, []);

    return (
        <section className="py-16">
            <div className="mx-auto max-w-7xl px-4">
                <h2 className="mb-4 text-center text-3xl font-semibold text-white">
                    Platform Preview
                </h2>
                <p className="mb-12 text-center text-white/70 max-w-3xl mx-auto">
                    Experience our intuitive trading dashboard with real-time data, advanced charting tools, and seamless trade execution.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <motion.div
                        className="flex w-full flex-col p-8 border border-white/20 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <h3 className="text-xl font-semibold text-white mb-6">Portfolio Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-white/80">
                                <span>Wallet Balance</span>
                                <span className="text-accent font-medium">$12,450.00</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/80">
                                <span>Open Trades</span>
                                <span className="text-accent font-medium">3</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/80">
                                <span>Today's P&L</span>
                                <span className="text-green-400 font-medium">+$245.67</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/80">
                                <span>Available Margin</span>
                                <span className="text-accent font-medium">$8,320.50</span>
                            </div>
                        </div>
                        <div ref={chartRef} className="w-full mt-6" />
                    </motion.div>
                    <div className="space-y-6">
                        <div className="p-6 border border-white/20 shadow-lg">
                            <h4 className="text-lg font-semibold text-white mb-4">Recent Trades</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">EUR/USD</span>
                                    <span className="text-green-400">+2.45%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">BTC/USD</span>
                                    <span className="text-red-400">-1.20%</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/80">AAPL</span>
                                    <span className="text-green-400">+0.85%</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border border-white/20 shadow-lg">
                            <h4 className="text-lg font-semibold text-white mb-4">Market Alerts</h4>
                            <div className="space-y-3 text-sm text-white/80">
                                <p>🚀 BTC/USD breaking resistance at $28,000</p>
                                <p>📈 EUR/USD showing bullish momentum</p>
                                <p>⚠️ Gold prices volatile due to economic data</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 text-center">
                    <p className="text-white/70 mb-6">
                        Ready to experience the full power of our platform? Sign up now and get started with a demo account.
                    </p>
                    <button className="bg-accent text-primary px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
                        Try Demo Account
                    </button>
                </div>
            </div>
        </section>
    );
};