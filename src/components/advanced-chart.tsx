"use client";

import { useEffect, useMemo, useRef } from "react";
import { CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries } from "lightweight-charts";
import { Maximize2, PenLine, Share2 } from "lucide-react";
import { candles } from "@/lib/mock-data";
import { useMarketStore } from "@/store/market-store";

const timeframes = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"];

export function AdvancedChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedTicker, timeframe, setTimeframe } = useMarketStore();
  const ma20 = useMemo(() => candles.map((candle, index) => ({ time: candle.time, value: Number((candles.slice(Math.max(0, index - 19), index + 1).reduce((sum, row) => sum + row.close, 0) / Math.min(index + 1, 20)).toFixed(2)) })), []);

  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, { layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#94a3b8" }, grid: { vertLines: { color: "rgba(148,163,184,.08)" }, horzLines: { color: "rgba(148,163,184,.08)" } }, width: containerRef.current.clientWidth, height: 390 });
    const candleSeries = chart.addSeries(CandlestickSeries, { upColor: "#22c55e", downColor: "#f43f5e", borderVisible: false, wickUpColor: "#22c55e", wickDownColor: "#f43f5e" });
    const volumeSeries = chart.addSeries(HistogramSeries, { color: "rgba(34,211,238,.35)", priceFormat: { type: "volume" }, priceScaleId: "" });
    const maSeries = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 2 });
    candleSeries.setData(candles);
    volumeSeries.setData(candles.map((candle) => ({ time: candle.time, value: candle.volume, color: candle.close >= candle.open ? "rgba(34,197,94,.28)" : "rgba(244,63,94,.28)" })));
    maSeries.setData(ma20);
    chart.timeScale().fitContent();
    const resize = () => { if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth }); };
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); chart.remove(); };
  }, [ma20, selectedTicker]);

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-slate-500">Advanced Chart</p><h2 className="mt-1 text-xl font-semibold text-white">{selectedTicker} Candlestick</h2></div><div className="flex flex-wrap items-center gap-2">{timeframes.map((item) => <button key={item} onClick={() => setTimeframe(item)} className={`h-8 rounded-md px-3 text-sm transition ${timeframe === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300 hover:border-cyan-300/40"}`}>{item}</button>)}<button title="Drawing tools" className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><PenLine size={16} /></button><button title="Compare stocks" className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Share2 size={16} /></button><button title="Fullscreen chart" className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Maximize2 size={16} /></button></div></div>
      <div ref={containerRef} className="mt-4 h-[390px] w-full" />
      <div className="mt-3 grid gap-2 text-xs text-slate-400 sm:grid-cols-4">{["MA20", "MA50", "RSI 64", "MACD +1.8", "Bollinger", "VWAP", "Support 136.4", "Resistance 151.2"].map((item) => <span key={item} className="rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">{item}</span>)}</div>
    </div>
  );
}
