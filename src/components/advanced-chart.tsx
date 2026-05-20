"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries, type Time } from "lightweight-charts";
import { Maximize2, PenLine, RefreshCw, Share2 } from "lucide-react";
import { allStockSymbols, stockUniverse } from "@/lib/market-utils";
import { candles as fallbackCandles } from "@/lib/mock-data";
import type { Candle } from "@/lib/types";
import { useMarketStore } from "@/store/market-store";

const timeframes = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"];

export function AdvancedChart({ fillViewport = false }: { fillViewport?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedTicker, setSelectedTicker, timeframe, setTimeframe, requestRefresh } = useMarketStore();
  const [chartData, setChartData] = useState<Candle[]>(fallbackCandles);
  const [provider, setProvider] = useState("mock");
  const [compare, setCompare] = useState("AMD");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const symbolOptions = useMemo(
    () =>
      stockUniverse
        .filter((stock) => `${stock.ticker} ${stock.name} ${stock.sector}`.toLowerCase().includes(symbolSearch.toLowerCase()))
        .slice(0, 300),
    [symbolSearch]
  );

  const ma20 = useMemo(
    () =>
      chartData.map((candle, index) => ({
        time: candle.time,
        value: Number((chartData.slice(Math.max(0, index - 19), index + 1).reduce((sum, row) => sum + row.close, 0) / Math.min(index + 1, 20)).toFixed(2))
      })),
    [chartData]
  );

  async function refreshCandles() {
    const response = await fetch(`/api/candles?symbol=${encodeURIComponent(selectedTicker)}&timeframe=${encodeURIComponent(timeframe)}`, {
      cache: "no-store"
    });
    const data = (await response.json()) as { provider: string; candles: Candle[] };
    setChartData(data.candles.length ? data.candles : fallbackCandles);
    setProvider(data.provider);
  }

  useEffect(() => {
    refreshCandles().catch(() => {
      setChartData(fallbackCandles);
      setProvider("mock");
    });
  }, [selectedTicker, timeframe]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chartElement = containerRef.current;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94a3b8"
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" }
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.16)" },
      timeScale: { borderColor: "rgba(148, 163, 184, 0.16)" },
      width: chartElement.clientWidth,
      height: chartElement.clientHeight
    });
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#f43f5e"
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "rgba(34, 211, 238, 0.35)",
      priceFormat: { type: "volume" },
      priceScaleId: ""
    });
    const maSeries = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 2 });
    const normalizedCandles = chartData.map((candle) => ({ ...candle, time: candle.time as Time }));
    candleSeries.setData(normalizedCandles);
    volumeSeries.setData(chartData.map((candle) => ({ time: candle.time as Time, value: candle.volume, color: candle.close >= candle.open ? "rgba(34,197,94,.28)" : "rgba(244,63,94,.28)" })));
    maSeries.setData(ma20.map((point) => ({ ...point, time: point.time as Time })));
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      chart.applyOptions({
        width: Math.floor(width),
        height: Math.floor(height)
      });
    });
    resizeObserver.observe(chartElement);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, isFullscreen, ma20]);

  return (
    <div className={`glass flex h-full ${fillViewport ? "min-h-[calc(100vh-190px)]" : "min-h-[560px]"} flex-col rounded-lg p-4 ${isFullscreen ? "fixed inset-3 z-50 min-h-0 overflow-hidden" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Advanced Chart · {provider.toUpperCase()}</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{selectedTicker} Candlestick</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={symbolSearch}
            onChange={(event) => setSymbolSearch(event.target.value)}
            className="h-8 w-36 rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-slate-100 outline-none"
            placeholder="Search 300"
          />
          <select
            value={selectedTicker}
            onChange={(event) => setSelectedTicker(event.target.value)}
            className="h-8 w-44 rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-slate-100 outline-none"
          >
            {symbolOptions.map((stock) => (
              <option key={stock.ticker} value={stock.ticker}>{stock.ticker} - {stock.name}</option>
            ))}
          </select>
          {timeframes.map((item) => (
            <button
              key={item}
              onClick={() => setTimeframe(item)}
              className={`h-8 rounded-md px-3 text-sm transition ${
                timeframe === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300 hover:border-cyan-300/40"
              }`}
            >
              {item}
            </button>
          ))}
          <button title="Refresh chart" onClick={() => { requestRefresh(); refreshCandles(); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><RefreshCw size={16} /></button>
          <button title="Drawing tools" onClick={() => setShowTools((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><PenLine size={16} /></button>
          <button title="Compare stocks" onClick={() => setCompare(allStockSymbols[(allStockSymbols.indexOf(compare) + 1) % allStockSymbols.length] ?? "AMD")} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Share2 size={16} /></button>
          <button title="Fullscreen chart" onClick={() => setIsFullscreen((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Maximize2 size={16} /></button>
        </div>
      </div>
      {showTools ? (
        <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
          {["Trendline ready", "Fibonacci ready", "Support/Resistance", `Compare: ${compare}`].map((item) => (
            <button key={item} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-left">{item}</button>
          ))}
        </div>
      ) : null}
      <div ref={containerRef} className={`mt-4 w-full flex-1 ${fillViewport && !isFullscreen ? "min-h-[calc(100vh-300px)]" : "min-h-[390px]"}`} />
      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-4">
        {["MA20", "MA50", "RSI", "MACD", "Bollinger", "VWAP", "Support", "Resistance"].map((item) => (
          <span key={item} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">{item}</span>
        ))}
      </div>
    </div>
  );
}
