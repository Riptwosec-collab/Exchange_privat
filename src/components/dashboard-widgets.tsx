"use client";

import { useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Bookmark, Bot, ChevronLeft, ChevronRight, Filter, Gauge, Layers3, Newspaper, Radio, RefreshCw, Search, SlidersHorizontal, Sparkles, Volume2 } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { economicEvents, gainers, generatedNews, indices, losers, news, portfolio } from "@/lib/mock-data";
import { useMarketStore } from "@/store/market-store";
import { StockLogo } from "./stock-logo";
import { Metric, Panel, StatusPill } from "./ui";

const growth = [
  { month: "Jan", value: 42000 },
  { month: "Feb", value: 46200 },
  { month: "Mar", value: 45100 },
  { month: "Apr", value: 51800 },
  { month: "May", value: 57320 }
];

const allocation = portfolio.map((holding) => ({
  name: holding.ticker,
  value: holding.quantity * holding.currentPrice
}));

const aiSummaryTitle = "\u0e2a\u0e23\u0e38\u0e1b\u0e15\u0e25\u0e32\u0e14\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49";
const aiSummaryBody =
  "\u0e15\u0e25\u0e32\u0e14\u0e22\u0e31\u0e07\u0e43\u0e2b\u0e49\u0e19\u0e49\u0e33\u0e2b\u0e19\u0e31\u0e01\u0e2b\u0e38\u0e49\u0e19 AI, semiconductor \u0e41\u0e25\u0e30 space infrastructure \u0e2b\u0e25\u0e31\u0e07 volume \u0e01\u0e25\u0e31\u0e1a\u0e40\u0e02\u0e49\u0e32\u0e01\u0e25\u0e38\u0e48\u0e21 growth. \u0e04\u0e27\u0e32\u0e21\u0e40\u0e2a\u0e35\u0e48\u0e22\u0e07\u0e2b\u0e25\u0e31\u0e01\u0e04\u0e37\u0e2d CPI/FED minutes \u0e41\u0e25\u0e30 valuation \u0e17\u0e35\u0e48\u0e15\u0e36\u0e07\u0e43\u0e19 megacap AI.";
const sectorLabels: Record<string, string> = {
  All: "All",
  AI: "AI",
  Semiconductor: "Chip",
  Space: "Space",
  Energy: "Energy",
  Crypto: "Crypto",
  "Thai Stocks": "Thai",
  "US Stocks": "US",
  Finance: "Finance",
  Healthcare: "Health",
  ETF: "ETF"
};
const copilotPrompts = ["วิเคราะห์ NVDA ตอนนี้", "พอร์ตเสี่ยงไหม", "หุ้นไหนกำลัง breakout", "สรุปข่าว RKLB ภาษาไทย"];
const copilotInsight =
  "NVDA ยังเป็น leader กลุ่ม AI แต่ควรจับตา RSI และ earnings guidance. แนวรับใกล้ 136-138, แนวต้าน 151-154.";

export function MarketOverview() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {indices.map((index) => (
        <Metric
          key={index.label}
          label={index.label}
          value={index.value}
          delta={`${index.change > 0 ? "+" : ""}${index.change}%`}
          tone={index.change >= 0 ? "up" : "down"}
        />
      ))}
    </div>
  );
}

export function AIBriefing() {
  return (
    <Panel className="relative overflow-hidden p-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300/12 text-cyan-100">
            <Bot size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Market Summary</p>
            <h3 className="font-semibold text-white">{aiSummaryTitle}</h3>
          </div>
        </div>
        <StatusPill tone="up">Bullish bias</StatusPill>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-300">{aiSummaryBody}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="Fear & Greed" value="72" delta="Greed" tone="up" />
        <Metric label="AI Impact" value="8.6/10" delta="+0.4" tone="up" />
        <Metric label="Risk Level" value="Med" delta="Hedge 18%" tone="neutral" />
      </div>
    </Panel>
  );
}

function buildMiniSeries(ticker: string, up: boolean, points = 76) {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let value = 50 + (seed % 13);
  const values = Array.from({ length: points }, (_, index) => {
    const drift = up ? 0.08 : -0.07;
    const wave = Math.sin(index / 4.2 + seed) * 1.6 + Math.cos(index / 7.1 + seed / 3) * 1.1;
    const noise = Math.sin(index * 1.9 + seed) * 1.8 + Math.cos(index * 0.73 + seed) * 0.9;
    const pulse = index % 17 === 0 ? Math.sin(seed + index) * 5.2 : 0;
    value = value * 0.985 + (50 + drift * index + wave + noise + pulse) * 0.015 + drift + noise * 0.08;
    return value;
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalized = values.map((row, index) => {
    const x = (index / (points - 1)) * 132;
    const y = 54 - ((row - min) / Math.max(1, max - min)) * 46;
    return { x, y };
  });

  return normalized
    .map((point, index) => {
      if (index === 0) return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
      const previous = normalized[index - 1];
      const cx = (previous.x + point.x) / 2;
      return `Q ${previous.x.toFixed(2)} ${previous.y.toFixed(2)} ${cx.toFixed(2)} ${((previous.y + point.y) / 2).toFixed(2)} T ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
    })
    .join(" ");
}

function afterMarketSnapshot(quote: { ticker: string; price: number; changePercent: number }) {
  const seed = quote.ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const direction = seed % 3 === 0 ? -1 : 1;
  const percent = Number((direction * (0.12 + (seed % 9) * 0.17)).toFixed(2));
  const price = Number((quote.price * (1 + percent / 100)).toFixed(2));
  const previousPercent = Number((quote.changePercent - percent).toFixed(2));
  return { price, percent, previousPercent };
}

function MiniMarketChart({ ticker, up }: { ticker: string; up: boolean }) {
  const points = buildMiniSeries(ticker, up);
  const afterPoints = buildMiniSeries(`${ticker}-after`, !up, 34);
  const areaPath = `${points} L 132 58 L 0 58 Z`;
  const stroke = up ? "#80e59a" : "#f28caf";
  const glow = up ? "#5fe27e" : "#ff78a6";
  const fill = up ? "rgba(101,216,120,.34)" : "rgba(240,138,170,.34)";

  return (
    <svg viewBox="0 0 132 60" className="h-[70px] w-full min-w-[118px]" aria-label={`${ticker} intraday chart`}>
      <defs>
        <linearGradient id={`spark-${ticker}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="55%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(16,16,16,0)" />
        </linearGradient>
        <filter id={`spark-glow-${ticker}`} x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={areaPath} fill={`url(#spark-${ticker})`} stroke="none" opacity="0.95" />
      <path d={points} fill="none" stroke={glow} strokeOpacity="0.2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#spark-glow-${ticker})`} />
      <path d={points} fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={afterPoints} fill="none" stroke={stroke} strokeDasharray="2 3" strokeOpacity="0.38" strokeWidth="1.2" transform="translate(82 0) scale(.38 1)" />
    </svg>
  );
}

export function WatchlistPanel() {
  const { quotes, setSelectedTicker, selectedTicker, requestRefresh } = useMarketStore();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const sectors = ["All", ...Array.from(new Set(quotes.map((quote) => quote.sector)))];
  const filteredRows = quotes.filter((quote) => {
    const matchesQuery = `${quote.ticker} ${quote.name} ${quote.sector}`.toLowerCase().includes(query.toLowerCase());
    const matchesSector = sector === "All" || quote.sector === sector;
    return matchesQuery && matchesSector;
  });
  const rows = filteredRows;

  return (
    <Panel className="flex max-h-[1420px] flex-col overflow-hidden p-0">
      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Watchlist</h3>
            <p className="text-xs text-slate-500">{quotes.length} tracked symbols</p>
          </div>
          <button onClick={requestRefresh} className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-300/30">Refresh</button>
        </div>
      </div>
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-3">
        <Search size={15} className="text-slate-500" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 w-full bg-transparent text-sm text-slate-100 outline-none" placeholder="Search ticker..." />
      </div>
      <div className="mx-4 mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {sectors.map((item) => (
          <button
            key={item}
            onClick={() => setSector(item)}
            className={`shrink-0 rounded-md border px-2.5 py-1.5 text-xs transition ${
              sector === item ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-slate-400 hover:border-cyan-300/30"
            }`}
          >
            {sectorLabels[item] ?? item}
          </button>
        ))}
      </div>
      <div className="mx-4 mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>{filteredRows.length} stocks</span>
        <span className="font-mono text-slate-400">ราคา · เมื่อวาน · หลังตลาดปิด</span>
      </div>
      <div className="mt-2 min-h-0 max-h-[1160px] divide-y divide-white/[0.06] overflow-y-auto scrollbar-thin">
        {rows.length === 0 ? (
          <div className="m-4 rounded-md border border-dashed border-white/10 bg-white/[0.025] p-4 text-center text-sm text-slate-400">
            ไม่พบหุ้นตามตัวกรองนี้
          </div>
        ) : rows.map((quote) => {
          const up = quote.changePercent >= 0;
          const afterMarket = afterMarketSnapshot(quote);
          const afterUp = afterMarket.percent >= 0;
          return (
            <button
              key={quote.ticker}
              onClick={() => setSelectedTicker(quote.ticker)}
              className={`w-full px-4 py-3.5 text-left transition ${
                selectedTicker === quote.ticker ? "bg-cyan-300/10" : "hover:bg-white/[0.045]"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-400/20 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
                  🇺🇸 หุ้นสหรัฐฯ
                </span>
                <span className="text-[11px] text-slate-400">เทียบเมื่อวาน {quote.previousClose.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-[minmax(96px,1fr)_minmax(96px,1.05fr)_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <StockLogo quote={quote} size="lg" />
                  <div className="min-w-0">
                    <strong className="block truncate text-lg font-semibold text-slate-100">{quote.ticker}</strong>
                    <p className="truncate text-xs text-slate-400">{quote.name}</p>
                  </div>
                </div>
                <MiniMarketChart ticker={quote.ticker} up={up} />
                <div className="shrink-0 text-right font-mono">
                  <p className="text-[11px] font-semibold text-slate-400">
                    หลังตลาดปิด <span className="text-slate-100">{afterMarket.price.toFixed(2)}</span>
                    <span className={afterUp ? "ml-1 text-emerald-300" : "ml-1 text-rose-300"}>{afterUp ? "↗" : "↘"} {Math.abs(afterMarket.percent).toFixed(2)}%</span>
                  </p>
                  <p className="mt-1 text-xl font-semibold text-slate-100">{quote.price.toLocaleString("en-US", { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-300">USD</span></p>
                  <span className={`mt-1 inline-flex rounded-md px-2.5 py-1 text-sm font-semibold ${up ? "bg-emerald-400/16 text-emerald-200" : "bg-rose-400/16 text-rose-200"}`}>
                    {up ? "↗" : "↘"} {Math.abs(quote.changePercent).toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <span className="truncate">{quote.sector}</span>
                <span className="truncate">วันนี้ {up ? "+" : ""}{quote.change.toFixed(2)}</span>
                <span className="truncate text-right">RSI {quote.rsi} · AH {afterUp ? "+" : ""}{afterMarket.percent.toFixed(2)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

export function MoversPanel() {
  const quotes = useMarketStore((state) => state.quotes);
  const topGainers = [...quotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const topLosers = [...quotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
  return (
    <Panel className="p-4">
      <h3 className="font-semibold text-white">Top Gainers / Losers</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          {topGainers.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between rounded-md bg-emerald-400/10 px-3 py-2">
              <span className="font-mono text-white">{item.ticker}</span>
              <span className="flex items-center gap-1 text-emerald-300"><ArrowUpRight size={14} />+{item.changePercent.toFixed(2)}%</span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {topLosers.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between rounded-md bg-rose-400/10 px-3 py-2">
              <span className="font-mono text-white">{item.ticker}</span>
              <span className="flex items-center gap-1 text-rose-300"><ArrowDownRight size={14} />{item.changePercent.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function NewsFeed() {
  const quotes = useMarketStore((state) => state.quotes);
  const dashboardNews = [...news, ...generatedNews];
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Newspaper size={18} className="text-cyan-300" />
          <h3 className="font-semibold text-white">AI Market Summary</h3>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">
          <Filter size={15} />
          Filter
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{dashboardNews.length} ข่าวที่เกี่ยวกับหุ้นใน watchlist</span>
        <span className="font-mono text-slate-400">แสดง 10 · เลื่อนดูต่อ</span>
      </div>
      <div className="mt-4 max-h-[1260px] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {dashboardNews.map((article) => {
          const quote = quotes.find((item) => item.ticker === article.ticker);
          return (
          <article key={article.id} className="rounded-md border border-white/10 bg-white/[0.035] p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {quote ? <StockLogo quote={quote} size="sm" /> : null}
              <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
              <StatusPill tone="info">{article.category}</StatusPill>
              <span className="font-mono text-xs text-slate-500">{article.ticker} · {article.source} · {article.time}</span>
              <button title="Bookmark article" className="ml-auto text-slate-400"><Bookmark size={16} fill={article.saved ? "currentColor" : "none"} /></button>
            </div>
            <h4 className="mt-2 text-sm font-semibold leading-5 text-white">{article.title}</h4>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{article.summaryTh}</p>
            <div className="mt-2 h-1 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} />
            </div>
          </article>
        );})}
      </div>
    </Panel>
  );
}

export function PortfolioPanel() {
  const total = portfolio.reduce((sum, item) => sum + item.quantity * item.currentPrice, 0);
  const cost = portfolio.reduce((sum, item) => sum + item.quantity * item.buyPrice, 0);
  const pnl = total - cost;

  return (
    <Panel className="p-4">
      <h3 className="font-semibold text-white">Portfolio Tracker</h3>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric label="Value" value={`$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} delta="+Today" tone="up" />
        <Metric label="P/L" value={`$${pnl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} delta={`${((pnl / cost) * 100).toFixed(1)}%`} tone="up" />
        <Metric label="Positions" value={`${portfolio.length}`} delta="2 alerts" tone="neutral" />
      </div>
      <div className="mt-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={growth}>
            <defs>
              <linearGradient id="growth" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" hide />
            <Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
            <Area dataKey="value" stroke="#22d3ee" fill="url(#growth)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function HeatmapPanel() {
  const { quotes, requestRefresh, setSelectedTicker } = useMarketStore();
  const [sector, setSector] = useState("All");
  const sectors = ["All", ...Array.from(new Set(quotes.map((quote) => quote.sector)))];
  const rows = quotes.filter((quote) => sector === "All" || quote.sector === sector).slice(0, 36);

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Market Heatmap</h3>
          <p className="mt-1 text-xs text-slate-500">Live price, previous close and daily percent by sector</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={sector} onChange={(event) => setSector(event.target.value)} className="h-9 rounded-md border border-white/10 bg-slate-950 px-2 text-xs text-slate-100">
            {sectors.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={requestRefresh} className="flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs text-slate-300 hover:border-cyan-300/40">
            <RefreshCw size={14} />Refresh
          </button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-4">
        {rows.map((stock, index) => {
          const up = stock.changePercent >= 0;
          return (
            <motion.button
              key={stock.ticker}
              onClick={() => setSelectedTicker(stock.ticker)}
              whileHover={{ scale: 1.03 }}
              className={`rounded-md border p-3 text-left ${up ? "border-emerald-300/15 bg-emerald-400/15 hover:bg-emerald-400/25" : "border-rose-300/15 bg-rose-400/15 hover:bg-rose-400/25"}`}
              style={{ minHeight: `${92 + (index % 4) * 10}px` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-sm text-white">{stock.ticker}</div>
                  <div className="mt-1 max-w-28 truncate text-xs text-slate-500">{stock.sector}</div>
                </div>
                <div className={up ? "text-emerald-300" : "text-rose-300"}>{up ? "+" : ""}{stock.changePercent.toFixed(2)}%</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]">
                <span className="rounded bg-black/25 px-2 py-1 text-slate-300">Now ${stock.price.toFixed(2)}</span>
                <span className="rounded bg-black/25 px-2 py-1 text-slate-400">Prev ${stock.previousClose.toFixed(2)}</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </Panel>
  );
}

function formatPe(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function ScreenerPanel() {
  const { quotes, requestRefresh } = useMarketStore();
  const aiCount = quotes.filter((quote) => quote.isAiStock).length;
  const dividendCount = quotes.filter((quote) => quote.dividendYield > 0).length;

  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">AI Stock Screener</h3>
        <button onClick={requestRefresh} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs text-slate-300"><RefreshCw size={14} />Refresh</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ["Market Cap", `${quotes.length} หุ้น`],
          ["P/E", "ใส่ครบ"],
          ["Revenue Growth", "YoY"],
          ["RSI", "สดจากราคา"],
          ["Breakout", "0-100"],
          ["AI Stocks", `${aiCount} ตัว`],
          ["Dividend", `${dividendCount} ตัว`],
          ["Momentum", "0-100"]
        ].map(([filter, value]) => (
          <button key={filter} className="rounded-md border border-white/10 px-3 py-1.5 text-left text-xs text-slate-300 hover:border-cyan-300/40">
            <span className="block text-slate-500">{filter}</span>
            <strong className="font-mono text-slate-100">{value}</strong>
          </button>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="py-2">หุ้น</th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th>Revenue Growth</th>
              <th>RSI</th>
              <th>Breakout</th>
              <th>AI Stocks</th>
              <th>Dividend</th>
              <th>Momentum</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.ticker} className="border-t border-white/10">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <StockLogo quote={quote} size="sm" />
                    <div>
                      <p className="font-mono text-white">{quote.ticker}</p>
                      <p className="text-xs text-slate-500">{quote.sector}</p>
                    </div>
                  </div>
                </td>
                <td className="font-mono text-slate-200">{quote.marketCap}</td>
                <td className="font-mono text-slate-200">{formatPe(quote.peRatio)}</td>
                <td className={quote.revenueGrowth >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>{formatSignedPercent(quote.revenueGrowth)}</td>
                <td className="font-mono text-slate-200">{quote.rsi}</td>
                <td><StatusPill tone={quote.breakoutScore >= 70 ? "up" : quote.breakoutScore <= 35 ? "down" : "neutral"}>{quote.breakoutScore}/100</StatusPill></td>
                <td className="text-slate-300">{quote.isAiStock ? "ใช่" : "ไม่ใช่"}</td>
                <td className="font-mono text-slate-300">{quote.dividendYield.toFixed(2)}%</td>
                <td><StatusPill tone={quote.momentumScore >= 70 ? "up" : quote.momentumScore <= 35 ? "down" : "neutral"}>{quote.momentumScore}/100</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function MultiChartPanel() {
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Multi Chart Monitor</h3>
        <StatusPill tone="info">Sync timeframe</StatusPill>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {["NVDA", "TSLA", "RKLB", "AMD"].map((ticker, index) => (
          <div key={ticker} className="rounded-md border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-white">{ticker}</span>
              <span className={index === 1 ? "text-rose-300" : "text-emerald-300"}>{index === 1 ? "-1.67%" : "+2.1%"}</span>
            </div>
            <div className="flex h-24 items-end gap-1">
              {Array.from({ length: 34 }, (_, i) => (
                <span key={i} className="flex-1 rounded-t bg-cyan-300/40" style={{ height: `${(24 + Math.abs(Math.sin(i + index)) * 70).toFixed(2)}%` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function CalendarAndFlows() {
  return (
    <Panel className="p-4">
      <div className="flex items-center gap-2">
        <Gauge size={18} className="text-purple-300" />
        <h3 className="font-semibold text-white">Macro · Insider · Social</h3>
      </div>
      <div className="mt-4 space-y-3">
        {economicEvents.map((event) => (
          <div key={event.event} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3">
            <div>
              <p className="text-sm font-medium text-white">{event.event}</p>
              <p className="text-xs text-slate-500">{event.date} · Forecast {event.forecast}</p>
            </div>
            <StatusPill tone={event.impact === "High" ? "down" : "neutral"}>{event.impact}</StatusPill>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-white/10 p-3">
          <Radio size={16} className="text-cyan-300" />
          <p className="mt-2 text-xs text-slate-500">Reddit/X Mentions</p>
          <strong className="font-mono text-white">+38%</strong>
        </div>
        <div className="rounded-md border border-white/10 p-3">
          <Layers3 size={16} className="text-purple-300" />
          <p className="mt-2 text-xs text-slate-500">Institutional Flow</p>
          <strong className="font-mono text-emerald-300">Net Buy</strong>
        </div>
        <div className="rounded-md border border-white/10 p-3">
          <Volume2 size={16} className="text-amber-300" />
          <p className="mt-2 text-xs text-slate-500">Volume Spike</p>
          <strong className="font-mono text-white">2.4x</strong>
        </div>
      </div>
    </Panel>
  );
}

export function AllocationDonut() {
  return (
    <Panel className="p-4">
      <h3 className="font-semibold text-white">Asset Allocation</h3>
      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>
              {allocation.map((entry, index) => (
                <Cell key={entry.name} fill={["#22d3ee", "#a78bfa", "#34d399", "#fbbf24"][index % 4]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: "#08111f", border: "1px solid rgba(255,255,255,.12)", color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function CopilotWidget() {
  return (
    <Panel className="fixed bottom-4 right-4 z-50 hidden w-[360px] p-4 xl:block">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-400/15 text-purple-200">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Stock Copilot</h3>
          <p className="text-xs text-slate-500">Thai explanation · trader memory</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3 text-sm leading-6 text-slate-300">
        {copilotInsight}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {copilotPrompts.map((prompt) => (
          <button key={prompt} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-purple-300/40">{prompt}</button>
        ))}
      </div>
    </Panel>
  );
}
