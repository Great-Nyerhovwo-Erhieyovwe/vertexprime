import { motion } from "framer-motion";
import { createChart, ColorType, LineSeries, type UTCTimestamp } from "lightweight-charts";
import React from "react";

export const DashboardMock = () => {
    // Simple chart mount
    const chartRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        if (!chartRef.current) return;
        const chart = createChart(chartRef.current, {
            width: 300,
            height: 180,
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
        <section className="py-12">
            <h2 className="mb-8 text-center text-2xl font-semibold text-white">
                Platform Preview
            </h2>
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
                <motion.div
                    className="glass flex w-full flex-col p-6"
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="mb-4 flex justify-between text-sm text-white/80">
                        <span>Wallet Balance</span>
                        <span className="text-accent">$12,450.00</span>
                    </div>
                    <div className="mb-4 flex justify-between text-sm text-white/80">
                        <span>Open Trades</span>
                        <span className="text-accent">3</span>
                    </div>
                    <div ref={chartRef} className="w-full" />
                </motion.div>
                <p className="max-w-2xl text-center text-white/70">
                    This mockup illustrates the clean, glass‑styled dashboard where users can
                    monitor balances, view live charts, and manage trades.
                </p>
            </div>
        </section>
    );
};