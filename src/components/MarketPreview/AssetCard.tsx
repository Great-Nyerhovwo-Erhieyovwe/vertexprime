import { useEffect, useRef } from "react";
import { createChart, LineStyle, ColorType, LineSeries } from "lightweight-charts";
import type { UTCTimestamp } from "lightweight-charts";

type AssetCardProps = {
  name: string;
  symbol: string;
  price: string;
  change: number; // percent
  data: number[]; // mock price series
};

export const AssetCard = ({
  name,
  symbol,
  price,
  change,
  data,
}: AssetCardProps) => {
  const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainer.current) return;

    const chart = createChart(chartContainer.current, {
      width: 150,
      height: 60,
      layout: { background: { type: ColorType.Solid, color: "transparent" } },
      grid: { vertLines: { visible: false }, horzLines: { visible: false } },
      timeScale: { visible: false },
      rightPriceScale: { visible: false },
    });

    const series = chart.addSeries(LineSeries, {
      color: "#00d8ff",
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
    });
    series.setData(data.map((v, i) => ({ time: i as UTCTimestamp, value: v })));

    return () => chart.remove();
  }, [data]);

  const changeColor = change >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="flex w-full max-w-xs sm:max-w-sm lg:w-64 flex-col items-start p-3 border border-white/20 shadow-lg">
      <div className="flex w-full justify-between text-sm text-white">
        <span>{name}</span>
        <span>{symbol}</span>
      </div>
      <div className="mt-1 text-lg font-medium text-accent">{price}</div>
      <div className={`mt-1 text-xs ${changeColor}`}>
        {change > 0 ? "+" : ""}
        {change.toFixed(2)}%
      </div>
      <div ref={chartContainer} className="mt-2 w-full" />
    </div>
  );
};