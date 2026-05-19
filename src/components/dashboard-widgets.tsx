"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, Bookmark, Bot, Filter, Gauge, Layers3, Newspaper, Radio, RefreshCw, Search, Sparkles, Volume2 } from "lucide-react";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { economicEvents, indices, news, portfolio } from "@/lib/mock-data";
import { useMarketStore } from "@/store/market-store";
import { Metric, Panel, StatusPill } from "./ui";

const growth = [
  { month: "Jan", value: 42000 },
  { month: "Feb", value: 46200 },
  { month: "Mar", value: 45100 },
  { month: "Apr", value: 51800 },
  { month: "May", value: 57320 }
];

const allocation = portfolio.map((holding) => ({ name: holding.ticker, value: holding.quantity * holding.currentPrice }));

export function MarketOverview() {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{indices.map((index) => <Metric key={index.label} label={index.label} value={index.value} delta={`${index.change > 0 ? "+" : ""}${index.change}%`} tone={index.change >= 0 ? "up" : "down"} />)}</div>;
}

export function AIBriefing() {
  return <Panel className="relative overflow-hidden p-4"><div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" /><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300/12 text-cyan-100"><Bot size={20} /></div><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Market Summary</p><h3 className="font-semibold text-white">สรุปตลาดวันนี้</h3></div></div><StatusPill tone="up">Bullish bias</StatusPill></div><p className="mt-4 text-sm leading-6 text-slate-300">ตลาดยังให้น้ำหนักหุ้น AI, semiconductor และ space infrastructure หลัง volume กลับเข้ากลุ่ม growth แต่ควรระวัง CPI/FED minutes และ valuation ที่ตึงใน megacap AI.</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><Metric label="Fear & Greed" value="72" delta="Greed" tone="up" /><Metric label="AI Impact" value="8.6/10" delta="+0.4" tone="up" /><Metric label="Risk Level" value="Med" delta="Hedge 18%" tone="neutral" /></div></Panel>;
}

export function WatchlistPanel() {
  const { quotes, setSelectedTicker, selectedTicker, requestRefresh } = useMarketStore();
  const [query, setQuery] = useState("");
  const rows = quotes.filter((quote) => `${quote.ticker} ${quote.name} ${quote.sector}`.toLowerCase().includes(query.toLowerCase())).slice(0, 24);
  return <Panel className="p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold text-white">Watchlist</h3><button onClick={requestRefresh} className="rounded-md border border-white/10 px-2 py-1 text-xs text-slate-300">Refresh</button></div><div className="mb-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3"><Search size={15} className="text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full bg-transparent text-sm text-slate-100 outline-none" placeholder="Search ticker..." /></div><div className="space-y-2">{rows.map((quote) => { const up = quote.changePercent >= 0; return <button key={quote.ticker} onClick={() => setSelectedTicker(quote.ticker)} className={`w-full rounded-md border p-3 text-left transition ${selectedTicker === quote.ticker ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}><div className="flex items-center justify-between gap-3"><div><strong className="font-mono text-white">{quote.ticker}</strong><p className="text-xs text-slate-500">{quote.name}</p></div><div className="text-right font-mono"><p className="text-white">${quote.price.toFixed(2)}</p><p className={up ? "text-emerald-300" : "text-rose-300"}>{up ? "+" : ""}{quote.changePercent.toFixed(2)}%</p></div></div><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{quote.sector}</span><span>RSI {quote.rsi}</span></div></button>; })}</div></Panel>;
}

export function MoversPanel() {
  const quotes = useMarketStore((state) => state.quotes);
  const topGainers = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const topLosers = [...quotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
  return <Panel className="p-4"><h3 className="font-semibold text-white">Top Gainers / Losers</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="space-y-2">{topGainers.map((item) => <div key={item.ticker} className="flex items-center justify-between rounded-md bg-emerald-400/10 px-3 py-2"><span className="font-mono text-white">{item.ticker}</span><span className="flex items-center gap-1 text-emerald-300"><ArrowUpRight size={14} />+{item.changePercent.toFixed(2)}%</span></div>)}</div><div className="space-y-2">{topLosers.map((item) => <div key={item.ticker} className="flex items-center justify-between rounded-md bg-rose-400/10 px-3 py-2"><span className="font-mono text-white">{item.ticker}</span><span className="flex items-center gap-1 text-rose-300"><ArrowDownRight size={14} />{item.changePercent.toFixed(2)}%</span></div>)}</div></div></Panel>;
}

export function NewsFeed() {
  return <Panel className="p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Newspaper size={18} className="text-cyan-300" /><h3 className="font-semibold text-white">Stock News AI</h3></div><button className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"><Filter size={15} />Filter</button></div><div className="mt-4 space-y-3">{news.slice(0, 8).map((article) => <article key={article.id} className="rounded-md border border-white/10 bg-white/[0.035] p-3"><div className="flex flex-wrap items-center gap-2"><StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill><StatusPill tone="info">{article.category}</StatusPill><span className="font-mono text-xs text-slate-500">{article.ticker} · {article.source} · {article.time}</span><button title="Bookmark article" className="ml-auto text-slate-400"><Bookmark size={16} fill={article.saved ? "currentColor" : "none"} /></button></div><h4 className="mt-3 text-sm font-semibold text-white">{article.title}</h4><p className="mt-2 text-sm leading-6 text-slate-400">{article.summaryTh}</p><div className="mt-3 h-1.5 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} /></div></article>)}</div></Panel>;
}

export function PortfolioPanel() {
  const total = portfolio.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);
  const cost = portfolio.reduce((sum, item) => sum + item.quantity * item.buyPrice, 0);
  const pnl = total - cost;
  return <Panel className="p-4"><h3 className="font-semibold text-white">Portfolio Tracker</h3><div className="mt-4 grid gap-2 sm:grid-cols-3"><Metric label="Value" value={`$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} delta="+Today" tone="up" /><Metric label="P/L" value={`$${pnl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} delta={`${((pnl / cost) * 100).toFixed(1)}%`} tone="up" /><Metric label="Positions" value={`${portfolio.length}`} delta="2 alerts" tone="neutral" /></div><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={growth}><defs><linearGradient id="growth" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" stroke="#64748b" /><YAxis stroke="#64748b" hide /><Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} /><Area dataKey="value" stroke="#22d3ee" fill="url(#growth)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div></Panel>;
}

export function ScreenerPanel() {
  const { quotes, requestRefresh } = useMarketStore();
  return <Panel className="p-4"><div className="flex items-center justify-between"><h3 className="font-semibold text-white">AI Stock Screener</h3><button onClick={requestRefresh} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300"><RefreshCw size={14} />Refresh</button></div><div className="mt-3 flex flex-wrap gap-2">{["Market Cap", "P/E", "Revenue Growth", "RSI", "Breakout", "AI Stocks", "Dividend", "Momentum"].map((filter) => <button key={filter} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-300/40">{filter}</button>)}</div><div className="mt-4 overflow-x-auto scrollbar-thin"><table className="w-full min-w-[540px] text-sm"><thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="py-2">Ticker</th><th>Sector</th><th>Price</th><th>RSI</th><th>Volume</th><th>Signal</th></tr></thead><tbody>{quotes.slice(0, 80).map((quote) => <tr key={quote.ticker} className="border-t border-white/10"><td className="py-3 font-mono text-white">{quote.ticker}</td><td className="text-slate-400">{quote.sector}</td><td className="font-mono text-slate-200">${quote.price.toFixed(2)}</td><td className="font-mono text-slate-200">{quote.rsi}</td><td className="font-mono text-slate-400">{quote.volume}</td><td><StatusPill tone={quote.rsi > 65 ? "up" : "neutral"}>{quote.rsi > 65 ? "Breakout" : "Watch"}</StatusPill></td></tr>)}</tbody></table></div></Panel>;
}

export function AllocationDonut() {
  return <Panel className="p-4"><h3 className="font-semibold text-white">Asset Allocation</h3><div className="mt-3 h-[220px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={allocation} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>{allocation.map((entry, index) => <Cell key={entry.name} fill={["#22d3ee", "#a78bfa", "#34d399", "#fbbf24"][index % 4]} />)}</Pie><Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} /></PieChart></ResponsiveContainer></div></Panel>;
}

export function CalendarAndFlows() {
  return <Panel className="p-4"><div className="flex items-center gap-2"><Gauge size={18} className="text-purple-300" /><h3 className="font-semibold text-white">Macro · Insider · Social</h3></div><div className="mt-4 space-y-3">{economicEvents.map((event) => <div key={event.event} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3"><div><p className="text-sm font-medium text-white">{event.event}</p><p className="text-xs text-slate-500">{event.date} · Forecast {event.forecast}</p></div><StatusPill tone={event.impact === "High" ? "down" : "neutral"}>{event.impact}</StatusPill></div>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-md border border-white/10 p-3"><Radio size={16} className="text-cyan-300" /><p className="mt-2 text-xs text-slate-500">Reddit/X Mentions</p><strong className="font-mono text-white">+38%</strong></div><div className="rounded-md border border-white/10 p-3"><Layers3 size={16} className="text-purple-300" /><p className="mt-2 text-xs text-slate-500">Institutional Flow</p><strong className="font-mono text-emerald-300">Net Buy</strong></div><div className="rounded-md border border-white/10 p-3"><Volume2 size={16} className="text-amber-300" /><p className="mt-2 text-xs text-slate-500">Volume Spike</p><strong className="font-mono text-white">2.4x</strong></div></div></Panel>;
}

export function HeatmapPanel() { return null; }
export function MultiChartPanel() { return null; }
export function CopilotWidget() { const prompts = ["วิเคราะห์ NVDA ตอนนี้", "พอร์ตเสี่ยงไหม", "หุ้นไหน breakout", "สรุปข่าว RKLB ภาษาไทย"]; return <Panel className="fixed bottom-4 right-4 z-50 hidden w-[360px] p-4 xl:block"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-400/15 text-purple-200"><Sparkles size={18} /></div><div><h3 className="text-sm font-semibold text-white">AI Stock Copilot</h3><p className="text-xs text-slate-500">Thai explanation · trader memory</p></div></div><div className="mt-3 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-purple-300/40">{prompt}</button>)}</div></Panel>; }
