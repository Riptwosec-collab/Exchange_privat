"use client";

import { useState } from "react";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bookmark, Bot, ChevronLeft, ChevronRight, ExternalLink, Filter, Gauge, Layers3, Newspaper, Radio, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Sparkles, Volume2, X } from "lucide-react";
import { motion } from "framer-motion";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { economicEvents, gainers, generatedNews, indices, losers, news, portfolio } from "@/lib/mock-data";
import type { NewsArticle, StockQuote } from "@/lib/types";
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

function buildMiniSeries(ticker: string, up: boolean, points = 118) {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  let value = 50 + (seed % 11);
  let walk = 0;
  const volatility = 2.5 + (seed % 9) * 0.32;
  const pullbackEvery = 8 + (seed % 5);
  const impulseEvery = 15 + (seed % 7);
  const noiseAt = (index: number, salt: number) => {
    const raw = Math.sin((index + 1) * (12.9898 + salt) + seed * (78.233 + salt)) * 43758.5453;
    return raw - Math.floor(raw);
  };
  const values = Array.from({ length: points }, (_, index) => {
    const progress = index / Math.max(1, points - 1);
    const trend = (up ? 13 : -12) * progress;
    const localStep = noiseAt(index, 0.17) - 0.5;
    const localShock = noiseAt(index, 0.61) - 0.5;
    const pullback = ((index % pullbackEvery) / pullbackEvery - 0.5) * volatility * (up ? -1 : 1);
    const impulse = index % impulseEvery === 0 ? (noiseAt(index, 1.13) - 0.5) * volatility * 5.8 : 0;
    const wave =
      Math.sin(index / 1.85 + seed * 0.13) * volatility +
      Math.cos(index / 3.35 + seed * 0.07) * (volatility * 0.95) +
      Math.sin(index / 6.25 + seed) * (volatility * 1.1);
    const micro =
      Math.sin(index * 1.93 + seed) * (volatility * 0.95) +
      Math.cos(index * 2.71 + seed / 5) * (volatility * 0.68) +
      localShock * volatility * 2.2;
    const reversal = Math.sin(progress * Math.PI * (3.1 + (seed % 4) * 0.45) + seed) * volatility * 1.7;
    walk = walk * 0.82 + localStep * volatility * 1.55 + (up ? 0.04 : -0.04);
    value = 50 + trend + wave + reversal + pullback + impulse + walk + micro * 0.58;
    return value;
  });
  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalized = values.map((row, index) => {
    const x = (index / (points - 1)) * 132;
    const y = 54 - ((row - min) / Math.max(1, max - min)) * 46;
    return { x, y };
  });

  return normalized.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function afterMarketSnapshot(quote: { ticker: string; price: number; previousClose: number; change: number; changePercent: number }) {
  const seed = quote.ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const direction = seed % 3 === 0 ? -1 : 1;
  const percent = Number((direction * (0.12 + (seed % 9) * 0.17)).toFixed(2));
  const price = Number((quote.price * (1 + percent / 100)).toFixed(2));
  const closeVsPrevPercent = Number(((quote.price - quote.previousClose) / Math.max(0.01, quote.previousClose) * 100).toFixed(2));
  const closeVsPrevChange = Number((quote.price - quote.previousClose).toFixed(2));
  return { price, percent, closeVsPrevPercent, closeVsPrevChange, totalSessionPercent: Number((closeVsPrevPercent + percent).toFixed(2)) };
}

function signed(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function directionTone(value: number) {
  if (value > 0) return "text-[#37e47b]";
  if (value < 0) return "text-[#ff7a92]";
  return "text-slate-300";
}

function directionBadge(value: number) {
  if (value > 0) return "bg-[#22c55e]/16 text-[#b5ffd2]";
  if (value < 0) return "bg-[#fb7185]/16 text-[#ffc0ca]";
  return "bg-slate-400/14 text-slate-200";
}

function directionArrow(value: number) {
  if (value > 0) return "↗";
  if (value < 0) return "↘";
  return "→";
}

type WatchlistIntel = {
  trendScore: number;
  momentumScore: number;
  smartMoneyScore: number;
  volatilityScore: number;
  riskScore: number;
  aiConfidenceScore: number;
  relativeStrength: number;
  darkPoolActivity: string;
  optionsFlow: string;
  institutionalPositioning: string;
  newsSentiment: string;
  aiSentiment: string;
  peerContext: string;
  sectorRotation: string;
  priority: string;
  setup: string;
  alert: string;
  thesis: string;
  invalidation: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function buildWatchlistIntel(quote: StockQuote, universe: StockQuote[]): WatchlistIntel {
  const sectorPeers = universe.filter((item) => item.sector === quote.sector);
  const sectorAvg = sectorPeers.length ? sectorPeers.reduce((sum, item) => sum + item.changePercent, 0) / sectorPeers.length : quote.changePercent;
  const relativeStrength = clampScore(50 + (quote.changePercent - sectorAvg) * 8 + (quote.momentumScore - 50) * 0.35);
  const volatilityScore = clampScore(Math.abs(quote.changePercent) * 12 + Math.abs(quote.change) / Math.max(1, quote.price) * 600 + (quote.rsi > 72 || quote.rsi < 28 ? 18 : 6));
  const riskScore = clampScore(volatilityScore * 0.48 + (quote.rsi > 70 ? 22 : quote.rsi < 30 ? 16 : 8) + (quote.breakoutScore < 35 ? 16 : 0));
  const smartMoneyScore = clampScore(quote.breakoutScore * 0.38 + quote.momentumScore * 0.34 + relativeStrength * 0.2 + (quote.isAiStock ? 8 : 0) - riskScore * 0.12);
  const trendScore = clampScore(quote.momentumScore * 0.45 + quote.breakoutScore * 0.35 + relativeStrength * 0.2);
  const aiConfidenceScore = clampScore((trendScore + smartMoneyScore + relativeStrength) / 3 - riskScore * 0.08 + (quote.revenueGrowth > 15 ? 6 : 0));
  const bullish = trendScore >= 64 && smartMoneyScore >= 58;
  const weak = trendScore <= 38 || quote.breakoutScore <= 35;
  const distribution = quote.changePercent < -1 && quote.momentumScore < 48;
  const accumulation = bullish || (quote.changePercent > 0 && relativeStrength >= 60);
  const unusualVolume = volatilityScore >= 62 || Math.abs(quote.changePercent) >= 3.5;
  const optionsFlow = quote.breakoutScore >= 72 ? "Call sweep bias / unusual options watch" : quote.breakoutScore <= 35 ? "Put hedge / downside protection watch" : "Options flow ปกติ ต้องรอ confirmation";
  const darkPoolActivity = accumulation ? "Dark Pool accumulation inference" : distribution ? "Dark Pool distribution risk" : "Dark Pool neutral / absorption watch";
  const institutionalPositioning = accumulation ? "สถาบันอาจสะสมตาม relative strength" : distribution ? "สถาบันอาจลด beta หรือขายทำกำไร" : "สถาบันยังรอ catalyst";
  const newsSentiment = quote.revenueGrowth > 20 || quote.isAiStock ? "Bullish news sensitivity" : quote.changePercent < -1 ? "Bearish/neutral news pressure" : "Neutral news impact";
  const aiSentiment = quote.isAiStock || /AI|Semiconductor|Cloud|Space/i.test(quote.sector) ? "AI theme supported" : "AI theme indirect";
  const peerContext = relativeStrength >= 60 ? "นำ sector / relative strength เด่น" : relativeStrength <= 40 ? "ตามหลัง peers" : "เคลื่อนไหวใกล้ sector";
  const sectorRotation = sectorAvg > 0.7 ? "เงินหมุนเข้า sector" : sectorAvg < -0.7 ? "เงินไหลออกจาก sector" : "sector rotation เป็นกลาง";
  const priority = bullish ? "Momentum Leader" : weak ? "High-Risk / Weak Tape" : unusualVolume ? "Volatility Expansion" : "Watch";
  const setup = quote.breakoutScore >= 72 ? "Breakout candidate" : quote.rsi <= 32 ? "Oversold reversal watch" : quote.rsi >= 72 ? "Momentum exhaustion risk" : "Base-building";
  const alert = quote.breakoutScore >= 78
    ? "Breakout detected"
    : unusualVolume
      ? "Volatility spike / unusual volume"
      : distribution
        ? "Institutional distribution risk"
        : quote.rsi <= 32
          ? "RSI divergence watch"
          : "Monitor";
  const thesis = accumulation
    ? `${quote.ticker} แข็งแรงเพราะ momentum, breakout score และ relative strength เหนือกลุ่ม สะท้อนแรงซื้อสถาบันหรือการสะสมแบบค่อยเป็นค่อยไป`
    : distribution
      ? `${quote.ticker} อ่อนกว่าที่ควรเมื่อเทียบ sector มีความเสี่ยง distribution และ liquidity ถูกขายใส่จังหวะเด้ง`
      : `${quote.ticker} ยังอยู่ในโหมดรอ catalyst ต้องดู volume, Options Flow และการยืนเหนือแนวต้านเพื่อยืนยัน`;
  const invalidation = bullish
    ? "เสีย thesis ถ้าหลุด previous close พร้อม RSI ถอยและ volume ขายเพิ่ม"
    : "เปลี่ยนมุมมองถ้าเกิด reclaim ราคาเดิมพร้อม volume และ relative strength ฟื้น";

  return {
    trendScore,
    momentumScore: quote.momentumScore,
    smartMoneyScore,
    volatilityScore,
    riskScore,
    aiConfidenceScore,
    relativeStrength,
    darkPoolActivity,
    optionsFlow,
    institutionalPositioning,
    newsSentiment,
    aiSentiment,
    peerContext,
    sectorRotation,
    priority,
    setup,
    alert,
    thesis,
    invalidation
  };
}

function scoreTone(score: number, inverse = false) {
  const good = inverse ? score <= 35 : score >= 65;
  const weak = inverse ? score >= 65 : score <= 35;
  if (good) return "text-[#37e47b]";
  if (weak) return "text-[#ff7a92]";
  return "text-amber-200";
}

function scoreBar(score: number, inverse = false) {
  const good = inverse ? score <= 35 : score >= 65;
  const weak = inverse ? score >= 65 : score <= 35;
  if (good) return "from-emerald-300 to-cyan-300";
  if (weak) return "from-rose-400 to-orange-300";
  return "from-amber-300 to-purple-300";
}

function MiniMarketChart({ ticker, intradayChange, afterHoursChange }: { ticker: string; intradayChange: number; afterHoursChange: number }) {
  const seed = ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const up = intradayChange >= 0;
  const points = buildMiniSeries(ticker, up);
  const afterPoints = buildMiniSeries(`${ticker}-after`, afterHoursChange >= 0, 34);
  const areaPath = `${points} L 132 58 L 0 58 Z`;
  const stroke = up ? "#22c55e" : "#fb7185";
  const glow = up ? "#37e47b" : "#ff7a92";
  const fill = up ? "rgba(34,197,94,.26)" : "rgba(251,113,133,.24)";
  const afterStroke = "rgba(245,248,255,.98)";

  return (
    <svg viewBox="0 0 132 60" preserveAspectRatio="xMidYMid meet" shapeRendering="geometricPrecision" className="h-[70px] w-full min-w-[118px] rounded-xl bg-[#03070c]" aria-label={`${ticker} intraday chart`}>
      <defs>
        <linearGradient id={`spark-${ticker}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="55%" stopColor={fill} />
          <stop offset="100%" stopColor="rgba(16,16,16,0)" />
        </linearGradient>
        <filter id={`spark-glow-${ticker}`} x="-8%" y="-32%" width="116%" height="164%">
          <feGaussianBlur stdDeviation="0.95" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`after-spark-${ticker}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,248,255,.28)" />
          <stop offset="70%" stopColor="rgba(203,213,225,.16)" />
          <stop offset="100%" stopColor="rgba(16,16,16,0)" />
        </linearGradient>
      </defs>
      {[22, 44, 66, 88, 110].map((x) => <line key={`v-${x}`} x1={x} x2={x} y1="0" y2="60" stroke="rgba(148,163,184,.10)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />)}
      {[15, 30, 45].map((y) => <line key={`h-${y}`} x1="0" x2="132" y1={y} y2={y} stroke="rgba(148,163,184,.10)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />)}
      {Array.from({ length: 36 }, (_, index) => (
        <rect
          key={index}
          x={index * 3.7}
          y={57 - (3 + Math.abs(Math.sin(index + seed)) * 15)}
          width="1.7"
          height={3 + Math.abs(Math.sin(index + seed)) * 15}
          fill={up ? "rgba(34,197,94,.16)" : "rgba(251,113,133,.18)"}
        />
      ))}
      <path d={areaPath} fill={`url(#spark-${ticker})`} stroke="none" opacity="0.95" />
      <path d={points} fill="none" stroke={glow} strokeOpacity="0.16" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" filter={`url(#spark-glow-${ticker})`} vectorEffect="non-scaling-stroke" />
      <path d={points} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={`${afterPoints} L 132 58 L 0 58 Z`} fill={`url(#after-spark-${ticker})`} stroke="none" transform="translate(82 0) scale(.38 1)" />
      <path d={afterPoints} fill="none" stroke={afterStroke} strokeOpacity="0.92" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" transform="translate(82 0) scale(.38 1)" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function WatchlistPanel() {
  const { quotes, setSelectedTicker, selectedTicker, requestRefresh } = useMarketStore();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const sectors = ["All", ...Array.from(new Set(quotes.map((quote) => quote.sector)))];
  const intelByTicker = new Map(quotes.map((quote) => [quote.ticker, buildWatchlistIntel(quote, quotes)]));
  const rankedRows = [...quotes].sort((a, b) => {
    const left = intelByTicker.get(a.ticker)?.aiConfidenceScore ?? 0;
    const right = intelByTicker.get(b.ticker)?.aiConfidenceScore ?? 0;
    return right - left;
  });
  const leaders = rankedRows.slice(0, 3);
  const riskAlerts = rankedRows
    .filter((quote) => {
      const intel = intelByTicker.get(quote.ticker);
      return intel ? intel.riskScore >= 62 || intel.alert !== "Monitor" : false;
    })
    .slice(0, 4);
  const filteredRows = rankedRows.filter((quote) => {
    const matchesQuery = `${quote.ticker} ${quote.name} ${quote.sector}`.toLowerCase().includes(query.toLowerCase());
    const matchesSector = sector === "All" || quote.sector === sector;
    return matchesQuery && matchesSector;
  });
  const rows = filteredRows;

  return (
    <Panel className="aq-watchlist-panel flex max-h-[1420px] flex-col overflow-hidden p-0 ring-1 ring-violet-300/10">
      <div className="border-b border-white/10 bg-black/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Watchlist</h3>
            <p className="text-xs text-slate-400">{quotes.length} tracked symbols · realtime institutional intelligence</p>
          </div>
          <button onClick={requestRefresh} className="rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-300/30">Refresh</button>
        </div>
      </div>
      <div className="mx-4 mt-3 grid gap-2 rounded-lg border border-cyan-300/18 bg-cyan-300/[0.035] p-3 text-xs sm:grid-cols-3">
        <div className="rounded-md border border-white/10 bg-black/25 p-2">
          <div className="flex items-center gap-2 text-cyan-100"><ShieldCheck size={14} /> Coverage</div>
          <strong className="mt-1 block font-mono text-slate-100">{quotes.length}/{quotes.length} tickers</strong>
          <p className="mt-1 text-slate-400">Stocks, ETF, Crypto, AI, Chip, Space</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-2">
          <div className="flex items-center gap-2 text-emerald-200"><Sparkles size={14} /> AI Priority</div>
          <strong className="mt-1 block font-mono text-slate-100">{leaders.map((item) => item.ticker).join(" · ")}</strong>
          <p className="mt-1 text-slate-400">จัดอันดับจาก Momentum + Smart Money + Relative Strength</p>
        </div>
        <div className="rounded-md border border-white/10 bg-black/25 p-2">
          <div className="flex items-center gap-2 text-amber-200"><AlertTriangle size={14} /> Alerts</div>
          <strong className="mt-1 block font-mono text-slate-100">{riskAlerts.length} signals</strong>
          <p className="mt-1 text-slate-400">{riskAlerts.slice(0, 2).map((item) => `${item.ticker}: ${intelByTicker.get(item.ticker)?.alert}`).join(" · ") || "ไม่มี alert แรง"}</p>
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
      <div className="mx-4 mt-3 flex items-center justify-between gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
        <span>{filteredRows.length} stocks</span>
        <span className="font-mono text-slate-300">ราคา · เมื่อวาน · หลังตลาดปิด</span>
      </div>
      <div className="mt-2 min-h-0 max-h-[1160px] space-y-3 overflow-y-auto p-4 pt-2 scrollbar-thin">
        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-white/10 bg-white/[0.025] p-4 text-center text-sm text-slate-400">
            ไม่พบหุ้นตามตัวกรองนี้
          </div>
        ) : rows.map((quote) => {
          const afterMarket = afterMarketSnapshot(quote);
          const intel = intelByTicker.get(quote.ticker) ?? buildWatchlistIntel(quote, quotes);
          return (
            <button
              key={quote.ticker}
              onClick={() => setSelectedTicker(quote.ticker)}
              className={`aq-watchlist-row w-full rounded-xl border p-3 text-left shadow-[0_16px_40px_rgba(0,0,0,.26)] transition ${
                selectedTicker === quote.ticker
                  ? "border-cyan-300/45 bg-cyan-300/[0.075] ring-1 ring-cyan-300/25"
                  : "border-white/10 bg-[#0b0f14] hover:border-cyan-300/25 hover:bg-white/[0.045]"
              }`}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_132px_auto] items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <StockLogo quote={quote} size="md" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <strong className="block truncate font-mono text-base font-black text-slate-50">{quote.ticker}</strong>
                      <span className="shrink-0 rounded-full border border-violet-300/25 bg-violet-400/14 px-2 py-0.5 text-[10px] font-bold text-violet-100">
                        หุ้นสหรัฐฯ
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs leading-4 text-slate-500">{quote.name}</p>
                    <div className="mt-1 flex min-w-0 items-center gap-2 text-[11px] text-slate-500">
                      <span className="truncate">{intel.priority}</span>
                      <span className={directionTone(afterMarket.percent)}>หลังตลาด {directionArrow(afterMarket.percent)} {signed(afterMarket.percent)}%</span>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/35 px-1.5 py-1">
                  <MiniMarketChart ticker={quote.ticker} intradayChange={afterMarket.closeVsPrevChange} afterHoursChange={afterMarket.percent} />
                </div>

                <div className="min-w-[104px] text-right font-mono">
                  <p className="text-lg font-black leading-none text-slate-50">
                    {quote.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    <span className="ml-1 text-xs font-semibold text-slate-500">USD</span>
                  </p>
                  <span className={`mt-2 inline-flex rounded-lg px-2 py-1 text-xs font-black ${directionBadge(afterMarket.closeVsPrevChange)}`}>
                    {directionArrow(afterMarket.closeVsPrevChange)} {signed(afterMarket.closeVsPrevPercent)}%
                  </span>
                  <p className="mt-1 text-[11px] text-slate-500">Prev {quote.previousClose.toFixed(2)}</p>
                </div>
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
  const rows = quotes.map((quote) => ({
    ...quote,
    dollarChange: Number((quote.price - quote.previousClose).toFixed(2)),
    percentChange: Number(((quote.price - quote.previousClose) / Math.max(0.01, quote.previousClose) * 100).toFixed(2))
  }));
  const topGainers = [...rows].filter((item) => item.percentChange >= 0).sort((a, b) => b.percentChange - a.percentChange);
  const topLosers = [...rows].filter((item) => item.percentChange < 0).sort((a, b) => a.percentChange - b.percentChange);
  return (
    <Panel className="p-4">
      <h3 className="font-semibold text-white">Top Gainers / Losers</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          {topGainers.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between gap-3 rounded-md bg-emerald-400/10 px-3 py-2">
              <div>
                <span className="font-mono text-white">{item.ticker}</span>
                <p className="text-[11px] text-slate-500">Prev ${item.previousClose.toFixed(2)}</p>
              </div>
              <span className="text-right font-mono text-emerald-300">
                <span className="flex items-center justify-end gap-1"><ArrowUpRight size={14} />+{item.percentChange.toFixed(2)}%</span>
                <span className="block text-[11px]">+${item.dollarChange.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {topLosers.map((item) => (
            <div key={item.ticker} className="flex items-center justify-between gap-3 rounded-md bg-rose-400/10 px-3 py-2">
              <div>
                <span className="font-mono text-white">{item.ticker}</span>
                <p className="text-[11px] text-slate-500">Prev ${item.previousClose.toFixed(2)}</p>
              </div>
              <span className="text-right font-mono text-rose-300">
                <span className="flex items-center justify-end gap-1"><ArrowDownRight size={14} />{item.percentChange.toFixed(2)}%</span>
                <span className="block text-[11px]">${item.dollarChange.toFixed(2)}</span>
              </span>
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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
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
          <article
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="cursor-pointer rounded-md border border-white/10 bg-white/[0.035] p-2.5 transition hover:border-cyan-300/35 hover:bg-white/[0.055]"
          >
            <div className="flex flex-wrap items-center gap-2">
              {quote ? <StockLogo quote={quote} size="sm" /> : null}
              <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
              <StatusPill tone="info">{article.category}</StatusPill>
              <span className="font-mono text-xs text-slate-500">{article.ticker} · {article.source} · {article.time}</span>
              <button onClick={(event) => event.stopPropagation()} title="Bookmark article" className="ml-auto text-slate-400"><Bookmark size={16} fill={article.saved ? "currentColor" : "none"} /></button>
            </div>
            <h4 className="mt-2 text-sm font-semibold leading-5 text-white">{article.title}</h4>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{article.summaryTh}</p>
            <div className="mt-2 h-1 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} />
            </div>
          </article>
        );})}
      </div>
      {selectedArticle ? <DashboardNewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} /> : null}
    </Panel>
  );
}

function DashboardNewsDetailModal({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const quote = useMarketStore((state) => state.quotes.find((item) => item.ticker === article.ticker));
  const sentimentTone = article.sentiment === "Bullish" ? "text-emerald-300" : article.sentiment === "Bearish" ? "text-rose-300" : "text-slate-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#101010] p-5 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {quote ? <StockLogo quote={quote} size="lg" /> : null}
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold text-cyan-200">{article.ticker} · {article.source}</p>
              <h3 className="mt-1 text-xl font-semibold leading-7 text-white">{article.title}</h3>
            </div>
          </div>
          <button onClick={onClose} title="Close" className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
          <StatusPill tone="info">{article.category}</StatusPill>
          <span className="font-mono text-xs text-slate-500">{article.date} {article.time}</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Impact</p><strong className="font-mono text-white">{article.impact}/100</strong></div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Sentiment</p><strong className={sentimentTone}>{article.sentiment}</strong></div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">Ticker</p><strong className="font-mono text-white">{article.ticker}</strong></div>
        </div>
        <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">สรุปข่าวภาษาไทย</p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{article.summaryTh}</p>
        </div>
        <div className="mt-5 h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} />
        </div>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {article.url ? (
            <a href={article.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/16">
              <ExternalLink size={15} /> เปิดข่าวต้นทาง
            </a>
          ) : null}
          <button onClick={onClose} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06]">ปิด</button>
        </div>
      </div>
    </div>
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
            <Area dataKey="value" stroke="#00d9ff" fill="url(#growth)" strokeWidth={3} />
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
      <div className="mt-4 space-y-2">
        {quotes.map((quote) => {
          const growthTone = quote.revenueGrowth >= 0 ? "text-emerald-300" : "text-rose-300";
          const breakoutTone = quote.breakoutScore >= 70 ? "bg-emerald-400/14 text-emerald-200" : quote.breakoutScore <= 35 ? "bg-rose-400/14 text-rose-200" : "bg-slate-400/12 text-slate-200";
          const momentumTone = quote.momentumScore >= 70 ? "bg-emerald-400/14 text-emerald-200" : quote.momentumScore <= 35 ? "bg-rose-400/14 text-rose-200" : "bg-slate-400/12 text-slate-200";
          return (
            <article key={quote.ticker} className="rounded-2xl border border-white/10 bg-[#0b0f14] p-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <StockLogo quote={quote} size="md" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate font-mono text-base font-black text-white">{quote.ticker}</p>
                      {quote.isAiStock ? <span className="shrink-0 rounded-full bg-cyan-300/14 px-2 py-0.5 text-[10px] font-bold text-cyan-100">AI</span> : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{quote.name}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-black text-slate-100">{quote.marketCap}</p>
                  <p className={`mt-0.5 font-mono text-xs font-bold ${growthTone}`}>{formatSignedPercent(quote.revenueGrowth)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2">
                  <p className="text-[10px] font-bold text-slate-500">P/E</p>
                  <p className="mt-1 truncate font-mono text-sm font-bold text-slate-100">{formatPe(quote.peRatio)}</p>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/[0.035] p-2">
                  <p className="text-[10px] font-bold text-slate-500">RSI</p>
                  <p className="mt-1 font-mono text-sm font-bold text-slate-100">{quote.rsi}</p>
                </div>
                <div className={`rounded-xl p-2 ${breakoutTone}`}>
                  <p className="text-[10px] font-bold opacity-70">Break</p>
                  <p className="mt-1 font-mono text-sm font-black">{quote.breakoutScore}</p>
                </div>
                <div className={`rounded-xl p-2 ${momentumTone}`}>
                  <p className="text-[10px] font-bold opacity-70">Momo</p>
                  <p className="mt-1 font-mono text-sm font-black">{quote.momentumScore}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="truncate">{quote.sector}</span>
                <span className="font-mono">Dividend {quote.dividendYield.toFixed(2)}%</span>
              </div>
            </article>
          );
        })}
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
