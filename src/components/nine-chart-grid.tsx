"use client";

import { useState } from "react";
import type { StockQuote } from "@/lib/types";
import { useMarketStore } from "@/store/market-store";
import { Panel, StatusPill } from "./ui";

const chartModes = ["Candles", "Bars", "Line", "Area", "Heikin", "Volume", "Range"] as const;
type ChartMode = (typeof chartModes)[number];

function tradePlan(quote: StockQuote, strategy: string) {
  const volatility = Math.max(1.8, Math.min(7.5, Math.abs(quote.changePercent) * 1.4 + quote.rsi / 28));
  const support = quote.price * (1 - volatility / 100);
  const resistance = quote.price * (1 + (volatility + 1.1) / 100);
  const entry = strategy === "Pullback" ? support * 1.012 : strategy === "Swing" ? quote.price * 1.002 : resistance * 1.004;
  const cut = support * 0.982;
  const target = strategy === "Pullback" ? quote.price * (1 + (volatility + 2.4) / 100) : resistance * 1.018;
  const rr = Math.max(0.1, (target - entry) / Math.max(0.01, entry - cut));
  return { support, resistance, entry, cut, target, rr };
}

function MiniChart({ quote, mode }: { quote: StockQuote; mode: ChartMode }) {
  const seed = quote.ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const bars = Array.from({ length: 34 }, (_, index) => 20 + Math.abs(Math.sin(index / 2 + seed)) * 72);
  return <div className="relative mt-3 flex h-32 items-end gap-1 overflow-hidden rounded-md border border-white/10 bg-black/30 p-3">{mode === "Line" || mode === "Area" ? <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><polyline points={bars.map((bar, index) => `${(index / 33) * 100},${95 - bar}`).join(" ")} fill="none" stroke={quote.changePercent >= 0 ? "#34d399" : "#fb7185"} strokeWidth="2.2" vectorEffect="non-scaling-stroke" /></svg> : bars.map((bar, index) => <span key={index} className={`flex-1 rounded-t ${quote.changePercent >= 0 ? "bg-emerald-300/55" : "bg-rose-300/55"}`} style={{ height: mode === "Range" ? `${30 + (index % 3) * 22}%` : `${bar}%` }} />)}</div>;
}

export function NineChartGridPage() {
  const { quotes, setSelectedTicker, timeframe, setTimeframe, requestRefresh } = useMarketStore();
  const [start, setStart] = useState(0);
  const [mode, setMode] = useState<ChartMode>("Candles");
  const [strategy, setStrategy] = useState("Breakout");
  const rows = quotes.slice(start, start + 9);
  return <Panel className="p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Multi monitor</p><h2 className="mt-1 text-xl font-semibold text-white">9 Chart Grid</h2><p className="mt-1 text-sm text-slate-400">เปลี่ยนแท่งได้ 7 แบบ พร้อมแนวรับ แนวต้าน จุดเข้า จุดคัต จุดทำกำไร และ R/R ต่อหุ้น</p></div><div className="flex flex-wrap gap-2"><select value={start} onChange={(event) => setStart(Number(event.target.value))} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((quote, index) => <option key={quote.ticker} value={index}>Start {quote.ticker}</option>)}</select><button onClick={requestRefresh} className="h-10 rounded-md border border-white/10 px-3 text-sm text-slate-300">Refresh</button></div></div><div className="mt-4 flex flex-wrap gap-2">{["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"].map((item) => <button key={item} onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-2 text-sm ${timeframe === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}{["Breakout", "Pullback", "Swing"].map((item) => <button key={item} onClick={() => setStrategy(item)} className={`rounded-md px-3 py-2 text-sm ${strategy === item ? "bg-purple-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}</div><div className="mt-3 flex flex-wrap gap-2">{chartModes.map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-2 text-sm ${mode === item ? "bg-emerald-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-3">{rows.map((quote) => { const plan = tradePlan(quote, strategy); return <button key={quote.ticker} onClick={() => setSelectedTicker(quote.ticker)} className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-left"><div className="flex items-center justify-between gap-3"><div><span className="font-mono text-white">{quote.ticker}</span><p className="mt-0.5 truncate text-xs text-slate-500">{quote.name}</p></div><div className="text-right font-mono"><p className="text-sm text-white">${quote.price.toFixed(2)}</p><StatusPill tone={quote.changePercent >= 0 ? "up" : "down"}>{quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%</StatusPill></div></div><MiniChart quote={quote} mode={mode} /><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span className="rounded border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-emerald-200">Support ${plan.support.toFixed(2)}</span><span className="rounded border border-rose-300/20 bg-rose-300/10 px-2 py-1 text-rose-200">Resistance ${plan.resistance.toFixed(2)}</span><span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-cyan-100">Entry ${plan.entry.toFixed(2)}</span><span className="rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-amber-100">Cut ${plan.cut.toFixed(2)}</span><span className="rounded border border-purple-300/20 bg-purple-300/10 px-2 py-1 text-purple-100">Target ${plan.target.toFixed(2)}</span><span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-slate-300">R/R {plan.rr.toFixed(2)}</span></div></button>; })}</div></Panel>;
}
