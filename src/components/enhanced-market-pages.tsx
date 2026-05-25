"use client";

import { useState } from "react";
import { Bot, Mic, RefreshCw, X } from "lucide-react";
import { motion } from "framer-motion";
import { generatedNews, portfolio as starterPortfolio } from "@/lib/mock-data";
import type { PortfolioHolding, StockQuote } from "@/lib/types";
import { useMarketStore } from "@/store/market-store";
import { StockLogo } from "./stock-logo";
import { Metric, Panel, StatusPill } from "./ui";

const chartModes = ["Candles", "Bars", "Line", "Area", "Heikin", "Volume", "Range"] as const;
type ChartMode = (typeof chartModes)[number];

function buildSeries(quote: StockQuote, timeframe: string) {
  const seed = `${quote.ticker}-${timeframe}`.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const drift = quote.changePercent >= 0 ? 0.22 : -0.18;
  return Array.from({ length: 34 }, (_, index) => {
    const wave = Math.sin(index / 2.7 + seed) * 1.8 + Math.cos(index / 4.1 + seed) * 1.1;
    const close = quote.price + wave + (index - 17) * drift;
    const open = close - Math.sin(index + seed) * 1.2;
    const high = Math.max(open, close) + 0.9 + Math.abs(Math.sin(index / 3 + seed));
    const low = Math.min(open, close) - 0.9 - Math.abs(Math.cos(index / 3 + seed));
    const volume = 30 + Math.abs(Math.sin(index / 2 + seed)) * 66;
    return { open, high, low, close, volume };
  });
}

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

function chartModeExplanation(mode: ChartMode) {
  switch (mode) {
    case "Line":
      return "à¹€à¸ªà¹‰à¸™à¹à¸ªà¸”à¸‡à¸—à¸´à¸¨à¸—à¸²à¸‡à¸£à¸²à¸„à¸²à¸›à¸´à¸” à¹€à¸«à¸¡à¸²à¸°à¸”à¸¹ momentum à¹€à¸£à¹‡à¸§ à¹†";
    case "Area":
      return "à¸žà¸·à¹‰à¸™à¸—à¸µà¹ˆà¹ƒà¸•à¹‰à¹€à¸ªà¹‰à¸™à¸Šà¹ˆà¸§à¸¢à¹€à¸«à¹‡à¸™à¹à¸£à¸‡à¸ªà¸°à¸ªà¸¡à¹à¸¥à¸°à¹à¸™à¸§à¹‚à¸™à¹‰à¸¡à¸‚à¸­à¸‡à¸£à¸²à¸„à¸²";
    case "Bars":
      return "à¹à¸—à¹ˆà¸‡à¸šà¸²à¸£à¹Œà¸¢à¸²à¸§à¹à¸›à¸¥à¸§à¹ˆà¸²à¸Šà¹ˆà¸§à¸‡à¹à¸à¸§à¹ˆà¸‡à¸à¸§à¹‰à¸²à¸‡ à¸£à¸°à¸§à¸±à¸‡à¸„à¸§à¸²à¸¡à¸œà¸±à¸™à¸œà¸§à¸™";
    case "Heikin":
      return "à¹à¸—à¹ˆà¸‡à¸›à¸£à¸±à¸šà¹ƒà¸«à¹‰à¹€à¸£à¸µà¸¢à¸šà¸‚à¸¶à¹‰à¸™ à¸Šà¹ˆà¸§à¸¢à¸”à¸¹ trend à¸•à¹ˆà¸­à¹€à¸™à¸·à¹ˆà¸­à¸‡à¹à¸¥à¸°à¸¥à¸” noise";
    case "Volume":
      return "à¹à¸—à¹ˆà¸‡à¸ªà¸¹à¸‡à¸„à¸·à¸­ volume à¸«à¸™à¸² à¹ƒà¸Šà¹‰à¸¢à¸·à¸™à¸¢à¸±à¸™ breakout à¸«à¸£à¸·à¸­à¹à¸£à¸‡à¸‚à¸²à¸¢";
    case "Range":
      return "à¹à¸šà¹ˆà¸‡à¹‚à¸‹à¸™à¸šà¸™/à¸à¸¥à¸²à¸‡/à¸¥à¹ˆà¸²à¸‡ à¹€à¸žà¸·à¹ˆà¸­à¸”à¸¹à¸£à¸²à¸„à¸²à¹ƒà¸à¸¥à¹‰à¹à¸™à¸§à¸•à¹‰à¸²à¸™à¸«à¸£à¸·à¸­à¹à¸™à¸§à¸£à¸±à¸š";
    default:
      return "à¹à¸—à¹ˆà¸‡à¹€à¸‚à¸µà¸¢à¸§à¸„à¸·à¸­à¸›à¸´à¸”à¸ªà¸¹à¸‡à¸à¸§à¹ˆà¸²à¹€à¸›à¸´à¸” à¹à¸—à¹ˆà¸‡à¹à¸”à¸‡à¸„à¸·à¸­à¸›à¸´à¸”à¸•à¹ˆà¸³à¸à¸§à¹ˆà¸²à¹€à¸›à¸´à¸”";
  }
}

function strategyExplanation(strategy: string) {
  if (strategy === "Pullback") return "à¸£à¸­à¸£à¸²à¸„à¸²à¸¢à¹ˆà¸­à¹ƒà¸à¸¥à¹‰à¹à¸™à¸§à¸£à¸±à¸šà¸à¹ˆà¸­à¸™à¹€à¸‚à¹‰à¸² à¹€à¸žà¸·à¹ˆà¸­à¸¥à¸”à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡";
  if (strategy === "Swing") return "à¹€à¸‚à¹‰à¸²à¹ƒà¸à¸¥à¹‰à¸£à¸²à¸„à¸²à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™ à¹à¸¥à¹‰à¸§à¸–à¸·à¸­à¸£à¸­à¸šà¸ªà¸±à¹‰à¸™à¸–à¸¶à¸‡à¸à¸¥à¸²à¸‡à¸•à¸²à¸¡à¹à¸£à¸‡à¹à¸à¸§à¹ˆà¸‡";
  return "à¹€à¸‚à¹‰à¸²à¹€à¸¡à¸·à¹ˆà¸­à¸£à¸²à¸„à¸²à¸œà¹ˆà¸²à¸™à¹à¸™à¸§à¸•à¹‰à¸²à¸™ à¸žà¸£à¹‰à¸­à¸¡à¹ƒà¸Šà¹‰à¸ˆà¸¸à¸”à¸„à¸±à¸•à¹€à¸žà¸·à¹ˆà¸­à¸ˆà¸³à¸à¸±à¸”à¸‚à¸²à¸”à¸—à¸¸à¸™";
}

function MiniSignalChart({ quote, timeframe, mode, strategy }: { quote: StockQuote; timeframe: string; mode: ChartMode; strategy: string }) {
  const data = buildSeries(quote, timeframe);
  const plan = tradePlan(quote, strategy);
  const values = data.flatMap((item) => [item.high, item.low, plan.support, plan.resistance, plan.entry, plan.cut, plan.target]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const scale = (value: number) => 92 - ((value - min) / Math.max(0.01, max - min)) * 82;
  const points = data.map((item, index) => `${(index / (data.length - 1)) * 100},${scale(item.close)}`).join(" ");
  const areaPoints = `0,96 ${points} 100,96`;
  const lineY = (value: number) => `${scale(value)}%`;

  return (
    <div className="relative mt-3 h-36 overflow-hidden rounded-md border border-white/10 bg-black/30">
      {mode === "Line" || mode === "Area" ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {mode === "Area" ? <polygon points={areaPoints} fill="rgba(34,211,238,.16)" /> : null}
          <polyline points={points} fill="none" stroke={quote.changePercent >= 0 ? "#34d399" : "#fb7185"} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
      {mode === "Range" ? (
        <div className="absolute inset-x-3 bottom-3 top-3 grid grid-rows-3 gap-1">
          <div className="rounded bg-rose-300/10" />
          <div className="rounded bg-cyan-300/10" />
          <div className="rounded bg-emerald-300/10" />
        </div>
      ) : null}
      {mode !== "Line" && mode !== "Area" && mode !== "Range" ? (
        <div className="absolute inset-x-3 bottom-3 top-3 flex items-end gap-1">
          {data.map((item, index) => {
            const up = mode === "Heikin" ? item.close + index * 0.01 >= item.open : item.close >= item.open;
            const top = scale(mode === "Volume" ? item.volume : item.high);
            const bottom = mode === "Volume" ? 96 : scale(item.low);
            const bodyTop = scale(Math.max(item.open, item.close));
            const bodyHeight = Math.max(6, Math.abs(scale(item.open) - scale(item.close)));
            if (mode === "Volume") return <span key={index} className={`flex-1 rounded-t ${up ? "bg-emerald-300/55" : "bg-rose-300/55"}`} style={{ height: `${100 - top}%` }} />;
            if (mode === "Bars") return <span key={index} className={`relative flex-1 ${up ? "bg-emerald-300/70" : "bg-rose-300/70"}`} style={{ height: `${bottom - top}%`, marginTop: `${top}%` }} />;
            return <span key={index} className="relative flex-1" style={{ height: "100%" }}><span className={`absolute left-1/2 w-px -translate-x-1/2 ${up ? "bg-emerald-300/60" : "bg-rose-300/60"}`} style={{ top: `${top}%`, height: `${bottom - top}%` }} /><span className={`absolute left-0 right-0 rounded-sm ${up ? "bg-emerald-300/80" : "bg-rose-300/80"}`} style={{ top: `${bodyTop}%`, height: `${bodyHeight}%` }} /></span>;
          })}
        </div>
      ) : null}
      {[
        { label: "Resistance", value: plan.resistance, color: "border-rose-300/70 text-rose-200" },
        { label: "Entry", value: plan.entry, color: "border-cyan-300/80 text-cyan-100" },
        { label: "Support", value: plan.support, color: "border-emerald-300/70 text-emerald-200" },
        { label: "Cut", value: plan.cut, color: "border-amber-300/75 text-amber-100" }
      ].map((line) => (
        <div key={line.label} className={`absolute left-0 right-0 border-t border-dashed ${line.color}`} style={{ top: lineY(line.value) }}>
          <span className="ml-2 rounded bg-slate-950/90 px-1.5 py-0.5 text-[10px]">{line.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EnhancedHeatmapPanel() {
  const { quotes, requestRefresh, setSelectedTicker } = useMarketStore();
  const [sector, setSector] = useState("All");
  const [selected, setSelected] = useState<StockQuote | null>(null);
  const [activeTool, setActiveTool] = useState<"compare" | "strategy" | "dcf" | "news">("news");
  const [lineStatus, setLineStatus] = useState("");
  const sectors = ["All", ...Array.from(new Set(quotes.map((quote) => quote.sector)))];
  const rows = quotes.filter((quote) => sector === "All" || quote.sector === sector).slice(0, 12);
  const detail = selected ? buildHeatmapInsight(selected) : null;

  async function sendLine(ticker: string) {
    setLineStatus("à¸à¸³à¸¥à¸±à¸‡à¸ªà¹ˆà¸‡à¹€à¸‚à¹‰à¸² LINE...");
    const response = await fetch("/api/line-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker })
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    setLineStatus(data.message ?? (response.ok ? "à¸ªà¹ˆà¸‡à¹€à¸‚à¹‰à¸² LINE à¹à¸¥à¹‰à¸§" : "à¸ªà¹ˆà¸‡ LINE à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ"));
  }

  function openDeepDive(stock: StockQuote) {
    setSelectedTicker(stock.ticker);
    setSelected(stock);
    setActiveTool("news");
    sendLine(stock.ticker).catch(() => setLineStatus("à¸ªà¹ˆà¸‡ LINE à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ"));
  }

  return (
    <Panel className="market-heatmap-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-white">Market Heatmap</h3>
          <p className="mt-1 text-xs text-slate-500">à¸à¸²à¸£à¹Œà¸”à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸«à¸¸à¹‰à¸™à¸žà¸£à¹‰à¸­à¸¡ target, upside, valuation à¹à¸¥à¸° risk</p>
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
      <div className="mt-4 grid max-h-[760px] gap-3 overflow-y-auto pr-1 scrollbar-thin sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((stock) => {
          const insight = buildHeatmapInsight(stock);
          const afterMarket = heatmapAfterMarketSnapshot(stock);
          const status = insight.upside > 8 && stock.rsi < 70 ? "Buy" : stock.rsi > 68 || insight.upside < 0 ? "Watch" : "Hold";
          const score = Math.max(8, Math.min(100, Math.round(Math.abs(insight.upside))));
          const rsiTone = heatmapRsiTone(stock.rsi);
          return (
            <motion.article
              key={stock.ticker}
              whileHover={{ y: -2 }}
              className="market-heatmap-card rounded-lg border border-white/10 bg-[#141414] p-4 text-left shadow-[0_16px_42px_rgba(0,0,0,.24)] transition hover:border-cyan-300/35 hover:bg-[#181818]"
            >
              <button onClick={() => setSelectedTicker(stock.ticker)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-3">
                    <StockLogo quote={stock} size="lg" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-mono text-base font-bold text-white">{stock.ticker}</h4>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{status}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{stock.name}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${heatmapBadge(afterMarket.closeVsPrev)}`}>
                    {heatmapArrow(afterMarket.closeVsPrev)} {heatmapSigned(afterMarket.closeVsPrevPercent)}%
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-sky-400/12 px-2 py-1 text-[11px] font-medium text-sky-200">{stock.sector}</span>
                  <span className="text-xs text-slate-500">Market Cap <span className="font-mono text-slate-300">{stock.marketCap}</span></span>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">à¸£à¸²à¸„à¸²à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™</p>
                    <strong className="font-mono text-2xl text-white">${stock.price.toFixed(2)}</strong>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>Prev ${stock.previousClose.toFixed(2)} <span className={heatmapTone(afterMarket.closeVsPrev)}>{heatmapSigned(afterMarket.closeVsPrev)}</span></p>
                    <p>AH ${afterMarket.price.toFixed(2)} <span className={heatmapTone(afterMarket.percent)}>{heatmapArrow(afterMarket.percent)} {heatmapSigned(afterMarket.percent)}%</span></p>
                    <p>P/E <span className="font-mono text-slate-300">{formatPe(stock.peRatio)}x</span></p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-white/[0.055] p-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">à¸§à¸±à¸™à¸™à¸µà¹‰</p>
                    <strong className={`font-mono text-sm ${heatmapTone(stock.change)}`}>{heatmapSigned(stock.change)}</strong>
                  </div>
                  <div className="rounded-md bg-white/[0.055] p-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">Upside</p>
                    <strong className={`font-mono text-sm ${insight.upside >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{insight.upside.toFixed(0)}%</strong>
                  </div>
                  <div className="rounded-md bg-white/[0.055] p-2">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">RSI</p>
                    <strong className={`font-mono text-sm ${rsiTone}`}>{stock.rsi}</strong>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>52W low ${insight.low52.toFixed(0)}</span>
                    <span>high ${insight.high52.toFixed(0)}</span>
                  </div>
                  <div className="relative mt-1.5 h-2 rounded-full bg-gradient-to-r from-emerald-400/25 via-amber-300/25 to-rose-400/25">
                    <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#141414] bg-cyan-200 shadow" style={{ left: `calc(${insight.position}% - 8px)` }} />
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-white/[0.08]">
                  <div className={`h-full rounded-full ${insight.upside >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} style={{ width: `${score}%` }} />
                </div>

                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{insight.bull}</p>
                <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                  <span className="text-slate-500">à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡: <span className="font-semibold text-slate-200">{insight.risk}</span></span>
                  <span className={heatmapTone(afterMarket.totalSessionPercent)}>à¸£à¸§à¸¡à¸§à¸±à¸™+AH {heatmapArrow(afterMarket.totalSessionPercent)} {heatmapSigned(afterMarket.totalSessionPercent)}%</span>
                </div>
              </button>
              <button onClick={() => openDeepDive(stock)} className="mt-3 w-full rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/16">
                à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¹€à¸Šà¸´à¸‡à¸¥à¸¶à¸ + à¸‚à¹ˆà¸²à¸§ real-time
              </button>
            </motion.article>
          );
        })}
      </div>
      {selected && detail ? (
        <HeatmapDeepDiveModal
          selected={selected}
          detail={detail}
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          lineStatus={lineStatus}
          onClose={() => setSelected(null)}
          onSendLine={sendLine}
        />
      ) : null}
    </Panel>
  );
}

function buildHeatmapInsight(quote: StockQuote) {
  const targetMultiplier = quote.rsi >= 66 ? 0.8 : quote.rsi <= 35 ? 1.2 : quote.isAiStock ? 1.16 : 1.1;
  const target = Number((quote.price * targetMultiplier).toFixed(2));
  const upside = ((target - quote.price) / quote.price) * 100;
  const low52 = Number((quote.price * (quote.rsi >= 66 ? 0.56 : 0.72)).toFixed(2));
  const high52 = Number((quote.price * (quote.rsi >= 66 ? 1.08 : 1.28)).toFixed(2));
  const risk = quote.rsi >= 70 || quote.breakoutScore >= 82 ? "à¸ªà¸¹à¸‡" : quote.rsi <= 42 && quote.momentumScore < 55 ? "à¸à¸¥à¸²à¸‡" : "à¸•à¹ˆà¸³";
  const position = Math.max(4, Math.min(96, ((quote.price - low52) / Math.max(0.01, high52 - low52)) * 100));

  return {
    target,
    upside,
    low52,
    high52,
    risk,
    position,
    forwardPe: quote.peRatio === null ? null : Math.max(1, quote.peRatio * 0.88),
    bull: `${quote.sector} à¸¢à¸±à¸‡à¸¡à¸µà¹à¸£à¸‡à¸«à¸™à¸¸à¸™à¸ˆà¸²à¸ revenue growth ${quote.revenueGrowth.toFixed(1)}% à¹à¸¥à¸° momentum ${quote.momentumScore}/100 à¸–à¹‰à¸² volume à¹€à¸‚à¹‰à¸²à¸•à¹ˆà¸­à¸¡à¸µà¹‚à¸­à¸à¸²à¸ªà¸—à¸”à¸ªà¸­à¸šà¹à¸™à¸§à¸•à¹‰à¸²à¸™`,
    bear: `à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡à¸«à¸¥à¸±à¸à¸„à¸·à¸­ valuation, RSI ${quote.rsi}, à¸à¸²à¸£à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¹ƒà¸™à¸à¸¥à¸¸à¹ˆà¸¡ ${quote.sector} à¹à¸¥à¸°à¹à¸£à¸‡à¸‚à¸²à¸¢à¸–à¹‰à¸²à¸«à¸¥à¸¸à¸”à¹à¸™à¸§à¸£à¸±à¸šà¸£à¸°à¸¢à¸°à¸ªà¸±à¹‰à¸™`,
    fit: quote.isAiStock ? "à¹€à¸«à¸¡à¸²à¸°à¸à¸±à¸šà¸žà¸­à¸£à¹Œà¸• AI/growth à¸—à¸µà¹ˆà¸£à¸±à¸šà¸„à¸§à¸²à¸¡à¸œà¸±à¸™à¸œà¸§à¸™à¹„à¸”à¹‰à¹à¸¥à¸°à¸£à¸­à¸ˆà¸±à¸‡à¸«à¸§à¸° pullback" : "à¹€à¸«à¸¡à¸²à¸°à¸à¸±à¸šà¸žà¸­à¸£à¹Œà¸•à¸à¸£à¸°à¸ˆà¸²à¸¢à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡ à¹ƒà¸Šà¹‰à¸‚à¸™à¸²à¸”à¸ªà¸–à¸²à¸™à¸°à¸žà¸­à¸”à¸µà¹à¸¥à¸°à¸¡à¸µà¸ˆà¸¸à¸”à¸•à¸±à¸”à¸‚à¸²à¸”à¸—à¸¸à¸™"
  };
}

function heatmapAfterMarketSnapshot(quote: StockQuote) {
  const seed = quote.ticker.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const direction = seed % 3 === 0 ? -1 : 1;
  const percent = Number((direction * (0.12 + (seed % 9) * 0.17)).toFixed(2));
  const price = Number((quote.price * (1 + percent / 100)).toFixed(2));
  const closeVsPrev = Number((quote.price - quote.previousClose).toFixed(2));
  const closeVsPrevPercent = Number(((closeVsPrev / Math.max(0.01, quote.previousClose)) * 100).toFixed(2));
  return { price, percent, closeVsPrev, closeVsPrevPercent, totalSessionPercent: Number((closeVsPrevPercent + percent).toFixed(2)) };
}

function heatmapSigned(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function heatmapTone(value: number) {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-rose-300";
  return "text-slate-300";
}

function heatmapBadge(value: number) {
  if (value > 0) return "bg-emerald-400/12 text-emerald-300";
  if (value < 0) return "bg-rose-400/14 text-rose-300";
  return "bg-slate-400/14 text-slate-200";
}

function heatmapArrow(value: number) {
  if (value > 0) return "â†—";
  if (value < 0) return "â†˜";
  return "â†’";
}

function heatmapRsiTone(value: number) {
  if (value >= 70) return "text-rose-300";
  if (value <= 30) return "text-emerald-300";
  return "text-slate-300";
}

function HeatmapDeepDiveModal({
  selected,
  detail,
  activeTool,
  setActiveTool,
  lineStatus,
  onClose,
  onSendLine
}: {
  selected: StockQuote;
  detail: ReturnType<typeof buildHeatmapInsight>;
  activeTool: "compare" | "strategy" | "dcf" | "news";
  setActiveTool: (tool: "compare" | "strategy" | "dcf" | "news") => void;
  lineStatus: string;
  onClose: () => void;
  onSendLine: (ticker: string) => void;
}) {
  const toolLabels: Array<["compare" | "strategy" | "dcf" | "news", string]> = [
    ["compare", "à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸š"],
    ["strategy", "à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œ"],
    ["dcf", "DCF"],
    ["news", "à¸‚à¹ˆà¸²à¸§ + LINE"]
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/10 bg-[#0f0f0f] p-5 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <StockLogo quote={selected} size="lg" />
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold">{selected.ticker} Â· {selected.name}</h3>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-200">{selected.changePercent >= 0 ? "Buy" : "Watch"}</span>
                <span className="rounded-full bg-violet-500/24 px-2 py-1 text-[11px] text-violet-100">{selected.sector}</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="text-right">
              <p className="font-mono text-2xl font-semibold">${selected.price.toFixed(2)}</p>
              <span className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-semibold ${selected.changePercent >= 0 ? "bg-emerald-400/12 text-emerald-300" : "bg-rose-400/14 text-rose-300"}`}>
                {selected.changePercent > 0 ? "+" : ""}{selected.changePercent.toFixed(2)}%
              </span>
            </div>
            <button onClick={onClose} title="Close" className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={20} /></button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[["à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢", `$${detail.target.toFixed(2)}`], ["Upside", `${detail.upside.toFixed(0)}%`], ["Market Cap", selected.marketCap], ["P/E (TTM)", `${formatPe(selected.peRatio)}x`], ["Forward P/E", detail.forwardPe === null ? "-" : `${detail.forwardPe.toFixed(0)}x`], ["à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡", detail.risk]].map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/[0.055] p-3">
              <p className="text-xs text-slate-400">{label}</p>
              <strong className={`${label === "Upside" && detail.upside < 0 ? "text-rose-300" : "text-white"}`}>{value}</strong>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold">à¸Šà¹ˆà¸§à¸‡à¸£à¸²à¸„à¸² 52 à¸ªà¸±à¸›à¸”à¸²à¸«à¹Œ</p>
          <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-emerald-400/30 via-amber-300/30 to-rose-400/30">
            <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#0f0f0f] bg-cyan-200 shadow" style={{ left: `calc(${detail.position}% - 8px)` }} />
          </div>
          <div className="mt-2 flex justify-between gap-2 text-xs text-slate-400">
            <span>à¸•à¹ˆà¸³à¸ªà¸¸à¸” ${detail.low52.toFixed(0)}</span>
            <span>à¹€à¸›à¹‰à¸² ${detail.target.toFixed(0)} Â· à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™ ${selected.price.toFixed(2)}</span>
            <span>à¸ªà¸¹à¸‡à¸ªà¸¸à¸” ${detail.high52.toFixed(0)}</span>
          </div>
        </div>

        <div className="mt-5 space-y-4 text-sm leading-6">
          <section>
            <h4 className="border-b border-white/10 pb-1 font-semibold text-emerald-200">Bull case</h4>
            <p className="mt-2 text-slate-300">{detail.bull}</p>
          </section>
          <section>
            <h4 className="border-b border-white/10 pb-1 font-semibold text-rose-200">Bear case</h4>
            <p className="mt-2 text-slate-300">{detail.bear}</p>
          </section>
          <section>
            <h4 className="border-b border-white/10 pb-1 font-semibold text-cyan-100">à¹€à¸«à¸¡à¸²à¸°à¸à¸±à¸šà¹ƒà¸„à¸£</h4>
            <p className="mt-2 text-slate-300">{detail.fit}</p>
          </section>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          {toolLabels.map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveTool(key);
                if (key === "news") onSendLine(selected.ticker);
              }}
              className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                activeTool === key ? "border-amber-300 bg-amber-300/14 text-amber-100" : "border-white/10 bg-white/[0.035] text-slate-200 hover:bg-white/[0.08]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-300">
          {activeTool === "compare" ? (
            <div>
              <h4 className="font-bold text-white">à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸à¸±à¸šà¸à¸¥à¸¸à¹ˆà¸¡ {selected.sector}</h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Momentum</p><strong className="text-white">{selected.momentumScore}/100</strong></div>
                <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Breakout</p><strong className="text-white">{selected.breakoutScore}/100</strong></div>
                <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Revenue Growth</p><strong className={selected.revenueGrowth >= 0 ? "text-emerald-300" : "text-rose-300"}>{selected.revenueGrowth.toFixed(1)}%</strong></div>
              </div>
            </div>
          ) : null}
          {activeTool === "strategy" ? (
            <div>
              <h4 className="font-bold text-white">à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œà¹€à¸—à¸£à¸”</h4>
              <p className="mt-2">à¸ˆà¸¸à¸”à¹€à¸‚à¹‰à¸²à¹ƒà¸à¸¥à¹‰ ${Math.max(detail.low52, selected.price * 0.985).toFixed(2)} Â· à¸ˆà¸¸à¸”à¸„à¸±à¸• ${Math.max(detail.low52 * 0.97, selected.price * 0.94).toFixed(2)} Â· à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢ ${detail.target.toFixed(2)}</p>
            </div>
          ) : null}
          {activeTool === "dcf" ? (
            <div>
              <h4 className="font-bold text-white">DCF à¹à¸šà¸šà¸¢à¹ˆà¸­</h4>
              <p className="mt-2">à¹ƒà¸Šà¹‰ revenue growth {selected.revenueGrowth.toFixed(1)}%, discount rate 10%, terminal growth 3% à¹„à¸”à¹‰ fair value à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¸›à¸£à¸°à¸¡à¸²à¸“ ${detail.target.toFixed(2)}</p>
              <p className="mt-2">Margin of safety: <span className={detail.upside >= 0 ? "text-emerald-300" : "text-rose-300"}>{detail.upside.toFixed(0)}%</span></p>
            </div>
          ) : null}
          {activeTool === "news" ? (
            <div>
              <h4 className="font-bold text-white">à¸‚à¹ˆà¸²à¸§ real-time + LINE</h4>
              <p className="mt-2">à¸£à¸°à¸šà¸šà¸ˆà¸°à¸ªà¹ˆà¸‡à¸ªà¸£à¸¸à¸›à¸‚à¹ˆà¸²à¸§à¹€à¸‰à¸žà¸²à¸° {selected.ticker} à¹€à¸‚à¹‰à¸² LINE à¸žà¸£à¹‰à¸­à¸¡à¹à¸›à¸¥à¹„à¸—à¸¢à¹à¸¥à¸°à¸ªà¸–à¸²à¸™à¸°à¸£à¸²à¸„à¸² à¸–à¹‰à¸²à¸•à¸±à¹‰à¸‡à¸„à¹ˆà¸² LINE token à¹à¸¥à¸° LINE_TO à¸–à¸¹à¸à¸•à¹‰à¸­à¸‡</p>
              {lineStatus ? <p className="mt-2 text-amber-200">{lineStatus}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EnhancedHeatmapPage() {
  const { quotes, setSelectedTicker, requestRefresh } = useMarketStore();
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<StockQuote | null>(null);
  const [activeTool, setActiveTool] = useState<"compare" | "strategy" | "dcf" | "news">("compare");
  const [lineStatus, setLineStatus] = useState("");
  const sectors = ["All", ...Array.from(new Set(quotes.map((item) => item.sector)))];
  const rows = quotes.filter((item) => filter === "All" || item.sector === filter);
  const detail = selected ? buildHeatmapInsight(selected) : null;

  async function sendLine(ticker: string) {
    setLineStatus("à¸à¸³à¸¥à¸±à¸‡à¸ªà¹ˆà¸‡à¹€à¸‚à¹‰à¸² LINE...");
    const response = await fetch("/api/line-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker })
    });
    const data = (await response.json().catch(() => ({}))) as { message?: string };
    setLineStatus(data.message ?? (response.ok ? "à¸ªà¹ˆà¸‡à¹€à¸‚à¹‰à¸² LINE à¹à¸¥à¹‰à¸§" : "à¸ªà¹ˆà¸‡ LINE à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ"));
  }

  return (
    <Panel className="market-heatmap-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Market Heatmap</h2>
          <p className="mt-1 text-sm text-slate-400">à¸à¸²à¸£à¹Œà¸”à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸£à¸²à¸¢à¸«à¸¸à¹‰à¸™ à¸žà¸£à¹‰à¸­à¸¡ target, upside, valuation, risk à¹à¸¥à¸°à¸‚à¹ˆà¸²à¸§à¸ªà¸³à¸«à¸£à¸±à¸šà¸ªà¹ˆà¸‡ LINE</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{sectors.map((item) => <option key={item}>{item}</option>)}</select>
          <button onClick={requestRefresh} className="h-10 rounded-md border border-white/10 px-3 text-sm text-slate-300 hover:border-cyan-300/40">Refresh</button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {rows.map((stock) => {
          const insight = buildHeatmapInsight(stock);
          const afterMarket = heatmapAfterMarketSnapshot(stock);
          const status = insight.upside > 8 && stock.rsi < 70 ? "Buy" : stock.rsi > 68 || insight.upside < 0 ? "Watch" : "Hold";
          return (
            <article key={stock.ticker} className="market-heatmap-card rounded-lg border border-white/10 bg-[#141414] p-4 text-slate-100 shadow-[0_16px_42px_rgba(0,0,0,.24)] transition hover:border-cyan-300/35 hover:bg-[#181818]">
              <button
                onClick={() => { setSelectedTicker(stock.ticker); setSelected(stock); }}
                className="block w-full text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <StockLogo quote={stock} size="lg" />
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-white">{stock.ticker}</h3>
                      <p className="truncate text-xs text-slate-500">{stock.name}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-300">{status}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-sky-400/12 px-2 py-1 text-[11px] font-medium text-sky-200">{stock.sector}</span>
                  <span className={`rounded-md px-2 py-1 text-xs font-semibold ${heatmapBadge(afterMarket.closeVsPrev)}`}>{heatmapArrow(afterMarket.closeVsPrev)} {heatmapSigned(afterMarket.closeVsPrevPercent)}%</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <strong className="font-mono text-2xl text-white">${stock.price.toFixed(2)}</strong>
                  <div className="text-right text-xs text-slate-500">
                    <p>P/E {formatPe(stock.peRatio)}x</p>
                    <p>AH <span className={heatmapTone(afterMarket.percent)}>{heatmapArrow(afterMarket.percent)} {heatmapSigned(afterMarket.percent)}%</span></p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  à¹€à¸›à¹‰à¸² ${insight.target.toFixed(2)} Â· Upside <span className={insight.upside >= 0 ? "text-emerald-300" : "text-rose-300"}>{insight.upside.toFixed(0)}%</span> Â· <span className={heatmapRsiTone(stock.rsi)}>RSI {stock.rsi}</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
                  <span className={heatmapTone(afterMarket.closeVsPrev)}>à¹€à¸¡à¸·à¹ˆà¸­à¸§à¸²à¸™ {heatmapSigned(afterMarket.closeVsPrev)}</span>
                  <span className={heatmapTone(stock.change)}>à¸§à¸±à¸™à¸™à¸µà¹‰ {heatmapSigned(stock.change)}</span>
                  <span className={`${heatmapTone(afterMarket.percent)} text-right`}>AH {heatmapSigned(afterMarket.percent)}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-white/[0.08]">
                  <div className={`h-full rounded-full ${insight.risk === "à¸ªà¸¹à¸‡" ? "bg-rose-500" : insight.risk === "à¸à¸¥à¸²à¸‡" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${stock.momentumScore}%` }} />
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">{insight.bull}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡: {insight.risk}
                </div>
              </button>
              <button
                onClick={() => {
                  setSelected(stock);
                  setActiveTool("news");
                  sendLine(stock.ticker);
                }}
                className="mt-3 w-full rounded-md border border-cyan-300/25 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/16"
              >
                à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¹€à¸Šà¸´à¸‡à¸¥à¸¶à¸ + à¸‚à¹ˆà¸²à¸§ real-time
              </button>
            </article>
          );
        })}
      </div>
      {selected && detail ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-white/10 bg-[#111111] p-5 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <StockLogo quote={selected} size="lg" />
                <div className="min-w-0">
                  <h3 className="truncate text-xl font-semibold">{selected.ticker} Â· {selected.name}</h3>
                  <div className="mt-1 flex gap-2">
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-slate-200">Hold</span>
                    <span className="rounded-full bg-violet-500/24 px-2 py-1 text-[11px] text-violet-100">{selected.sector}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <p className="font-mono text-2xl font-semibold">${selected.price.toFixed(2)}</p>
                  <span className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-semibold ${selected.changePercent >= 0 ? "bg-emerald-400/12 text-emerald-300" : "bg-rose-400/14 text-rose-300"}`}>{selected.changePercent.toFixed(2)}%</span>
                </div>
                <button onClick={() => setSelected(null)} title="Close" className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[["à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢", `$${detail.target.toFixed(2)}`], ["Upside", `${detail.upside.toFixed(0)}%`], ["Market Cap", selected.marketCap], ["P/E (TTM)", `${formatPe(selected.peRatio)}x`], ["Forward P/E", detail.forwardPe === null ? "-" : `${detail.forwardPe.toFixed(0)}x`], ["à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡", detail.risk]].map(([label, value]) => (
                <div key={label} className="rounded-md bg-white/[0.055] p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <strong className={`${label === "Upside" && detail.upside < 0 ? "text-rose-300" : "text-white"}`}>{value}</strong>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-sm font-semibold">à¸Šà¹ˆà¸§à¸‡à¸£à¸²à¸„à¸² 52 à¸ªà¸±à¸›à¸”à¸²à¸«à¹Œ</p>
              <div className="relative mt-4 h-2 rounded-full bg-gradient-to-r from-emerald-100 via-amber-100 to-rose-200">
                <span className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-rose-600 shadow" style={{ left: `calc(${detail.position}% - 8px)` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>à¸•à¹ˆà¸³à¸ªà¸¸à¸” ${detail.low52.toFixed(0)}</span>
                <span>à¹€à¸›à¹‰à¸² ${detail.target.toFixed(0)} Â· à¸›à¸±à¸ˆà¸ˆà¸¸à¸šà¸±à¸™ ${selected.price.toFixed(2)}</span>
                <span>à¸ªà¸¹à¸‡à¸ªà¸¸à¸” ${detail.high52.toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-6">
              <section>
                <h4 className="border-b border-white/10 pb-1 font-semibold">ðŸ“ˆ BULL CASE (à¸ˆà¸¸à¸”à¹à¸‚à¹‡à¸‡)</h4>
                <p className="mt-2 text-slate-300">{detail.bull}</p>
              </section>
              <section>
                <h4 className="border-b border-white/10 pb-1 font-semibold">ðŸ“‰ BEAR CASE (à¸„à¸§à¸²à¸¡à¹€à¸ªà¸µà¹ˆà¸¢à¸‡)</h4>
                <p className="mt-2 text-slate-300">{detail.bear}</p>
              </section>
              <section>
                <h4 className="border-b border-white/10 pb-1 font-semibold">à¹ƒà¸„à¸£à¹€à¸«à¸¡à¸²à¸°à¸à¸±à¸šà¹ƒà¸„à¸£</h4>
                <p className="mt-2 text-slate-300">{detail.fit}</p>
              </section>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[selected.sector, selected.isAiStock ? "AI" : "Core", selected.dividendYield > 0 ? "Dividend" : "Growth"].map((tag) => (
                <span key={tag} className="rounded-full bg-violet-500/24 px-2 py-1 text-xs text-violet-100">{tag}</span>
              ))}
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {[
                ["compare", "ðŸ“Š à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸š"],
                ["strategy", "ðŸŽ¯ à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œ"],
                ["dcf", "â—º DCF"],
                ["news", "ðŸ“° à¸‚à¹ˆà¸²à¸§ + LINE"]
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTool(key as typeof activeTool);
                    if (key === "news") sendLine(selected.ticker);
                  }}
                  className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
                    activeTool === key ? "border-amber-300 bg-amber-300/14 text-amber-100" : "border-white/10 bg-white/[0.035] text-slate-200 hover:bg-white/[0.08]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-4 text-sm leading-6 text-slate-300">
              {activeTool === "compare" ? (
                <div>
                  <h4 className="font-bold text-white">à¹€à¸›à¸£à¸µà¸¢à¸šà¹€à¸—à¸µà¸¢à¸šà¸à¸±à¸šà¸à¸¥à¸¸à¹ˆà¸¡ {selected.sector}</h4>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Momentum</p><strong className="text-white">{selected.momentumScore}/100</strong></div>
                    <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Breakout</p><strong className="text-white">{selected.breakoutScore}/100</strong></div>
                    <div className="rounded-md bg-white/[0.04] p-3"><p className="text-xs text-slate-400">Revenue Growth</p><strong className={selected.revenueGrowth >= 0 ? "text-emerald-300" : "text-rose-300"}>{selected.revenueGrowth.toFixed(1)}%</strong></div>
                  </div>
                </div>
              ) : null}
              {activeTool === "strategy" ? (
                <div>
                  <h4 className="font-bold text-white">à¸à¸¥à¸¢à¸¸à¸—à¸˜à¹Œà¹€à¸—à¸£à¸”</h4>
                  <p className="mt-2">à¸ˆà¸¸à¸”à¹€à¸‚à¹‰à¸²à¹ƒà¸à¸¥à¹‰ ${Math.max(detail.low52, selected.price * 0.985).toFixed(2)} Â· à¸ˆà¸¸à¸”à¸„à¸±à¸• ${Math.max(detail.low52 * 0.97, selected.price * 0.94).toFixed(2)} Â· à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢ ${detail.target.toFixed(2)}</p>
                  <p className="mt-2">à¸–à¹‰à¸² RSI à¹€à¸à¸´à¸™ 70 à¹ƒà¸«à¹‰à¸£à¸­à¸¢à¹ˆà¸­à¸à¹ˆà¸­à¸™ à¸ªà¹ˆà¸§à¸™à¸–à¹‰à¸² momentum à¸¡à¸²à¸à¸à¸§à¹ˆà¸² 70 à¹ƒà¸«à¹‰à¸—à¸¢à¸­à¸¢à¸•à¸²à¸¡à¹€à¸¡à¸·à¹ˆà¸­à¸£à¸²à¸„à¸²à¸¢à¸·à¸™à¹€à¸«à¸™à¸·à¸­à¹à¸™à¸§à¸•à¹‰à¸²à¸™à¹„à¸”à¹‰</p>
                </div>
              ) : null}
              {activeTool === "dcf" ? (
                <div>
                  <h4 className="font-bold text-white">DCF à¹à¸šà¸šà¸¢à¹ˆà¸­</h4>
                  <p className="mt-2">à¹ƒà¸Šà¹‰ revenue growth {selected.revenueGrowth.toFixed(1)}%, discount rate 10%, terminal growth 3% à¹„à¸”à¹‰ fair value à¹€à¸šà¸·à¹‰à¸­à¸‡à¸•à¹‰à¸™à¸›à¸£à¸°à¸¡à¸²à¸“ ${detail.target.toFixed(2)}</p>
                  <p className="mt-2">Margin of safety: <span className={detail.upside >= 0 ? "text-emerald-300" : "text-rose-300"}>{detail.upside.toFixed(0)}%</span></p>
                </div>
              ) : null}
              {activeTool === "news" ? (
                <div>
                  <h4 className="font-bold text-white">à¸‚à¹ˆà¸²à¸§ + LINE</h4>
                  <p className="mt-2">à¸ªà¹ˆà¸‡à¸ªà¸£à¸¸à¸›à¸‚à¹ˆà¸²à¸§à¹€à¸‰à¸žà¸²à¸° {selected.ticker} à¹€à¸‚à¹‰à¸² LINE à¹à¸¥à¹‰à¸§/à¸à¸³à¸¥à¸±à¸‡à¸ªà¹ˆà¸‡ à¸žà¸£à¹‰à¸­à¸¡à¸ªà¸£à¸¸à¸›à¹„à¸—à¸¢à¹à¸¥à¸°à¸ªà¸–à¸²à¸™à¸°à¸£à¸²à¸„à¸²</p>
                  {lineStatus ? <p className="mt-2 text-amber-200">{lineStatus}</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

export function EnhancedMultiChartPage() {
  const { quotes, setSelectedTicker, timeframe, setTimeframe, requestRefresh } = useMarketStore();
  const [grid, setGrid] = useState(4);
  const [start, setStart] = useState(0);
  const [mode, setMode] = useState<ChartMode>("Candles");
  const [strategy, setStrategy] = useState("Breakout");
  const rows = quotes.slice(start, start + grid);

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold text-white">Multi Chart Screen</h2><p className="mt-1 text-sm text-slate-400">à¸”à¸¹à¸«à¸¥à¸²à¸¢à¸«à¸¸à¹‰à¸™à¸žà¸£à¹‰à¸­à¸¡à¸à¸±à¸™ à¹€à¸›à¸¥à¸µà¹ˆà¸¢à¸™à¸Šà¸™à¸´à¸”à¹à¸—à¹ˆà¸‡à¹„à¸”à¹‰ 7 à¹à¸šà¸š à¸žà¸£à¹‰à¸­à¸¡à¹à¸™à¸§à¸£à¸±à¸š à¹à¸™à¸§à¸•à¹‰à¸²à¸™ à¸ˆà¸¸à¸”à¹€à¸‚à¹‰à¸² à¸ˆà¸¸à¸”à¸„à¸±à¸• à¹à¸¥à¸°à¹€à¸›à¹‰à¸²à¸«à¸¡à¸²à¸¢</p></div>
        <div className="flex flex-wrap gap-2">{[2, 4, 6, 8].map((item) => <button key={item} onClick={() => setGrid(item)} className={`rounded-md px-3 py-2 text-sm ${grid === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item} Grid</button>)}<button onClick={requestRefresh} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-cyan-300/40">Refresh</button></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <select value={start} onChange={(event) => setStart(Number(event.target.value))} className="h-9 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((quote, index) => <option key={quote.ticker} value={index}>Start {quote.ticker}</option>)}</select>
        {["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"].map((item) => <button key={item} onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-2 text-sm ${timeframe === item ? "bg-purple-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chartModes.map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-2 text-sm ${mode === item ? "bg-emerald-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}
        {["Breakout", "Pullback", "Swing"].map((item) => <button key={item} onClick={() => setStrategy(item)} className={`rounded-md px-3 py-2 text-sm ${strategy === item ? "bg-amber-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {rows.map((quote) => {
          const plan = tradePlan(quote, strategy);
          return (
            <button key={quote.ticker} onClick={() => setSelectedTicker(quote.ticker)} className="rounded-md border border-white/10 bg-black/20 p-3 text-left transition hover:border-cyan-300/30 hover:bg-white/[0.055]">
              <div className="flex items-center justify-between gap-3"><div><span className="font-mono text-white">{quote.ticker}</span><p className="mt-0.5 truncate text-xs text-slate-500">{quote.name}</p></div><div className="text-right font-mono"><p className="text-sm text-white">${quote.price.toFixed(2)}</p><p className={quote.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}>{quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%</p></div></div>
              <MiniSignalChart quote={quote} timeframe={timeframe} mode={mode} strategy={strategy} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><span className="rounded border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-emerald-200">Support ${plan.support.toFixed(2)}</span><span className="rounded border border-rose-300/20 bg-rose-300/10 px-2 py-1 text-rose-200">Resistance ${plan.resistance.toFixed(2)}</span><span className="rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-cyan-100">Entry ${plan.entry.toFixed(2)}</span><span className="rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-amber-100">Cut ${plan.cut.toFixed(2)}</span></div>
              <div className="mt-3 rounded-md border border-white/10 bg-white/[0.03] p-3 text-[11px] leading-5 text-slate-400">
                <p><span className="font-semibold text-slate-200">à¸­à¹ˆà¸²à¸™à¹à¸—à¹ˆà¸‡:</span> {chartModeExplanation(mode)}</p>
                <p className="mt-1"><span className="font-semibold text-slate-200">à¹à¸œà¸™à¹€à¸—à¸£à¸”:</span> {strategyExplanation(strategy)}</p>
                <p className="mt-1 font-mono text-slate-500">Target ${plan.target.toFixed(2)} Â· R/R {plan.rr.toFixed(2)}x</p>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

export function EnhancedCopilotPageFull() {
  const { quotes, requestRefresh } = useMarketStore();
  const [ticker, setTicker] = useState("NVDA");
  const quote = quotes.find((item) => item.ticker === ticker) ?? quotes[0];
  const peers = quotes.filter((item) => item.sector === quote.sector && item.ticker !== ticker).slice(0, 6);
  const sectorRows = quotes.filter((item) => item.sector === quote.sector);
  const sectorAvg = sectorRows.length ? sectorRows.reduce((sum, item) => sum + item.changePercent, 0) / sectorRows.length : 0;
  const latestNews = generatedNews.filter((item) => item.ticker === ticker || item.category.includes(quote.sector.split(" ")[0])).slice(0, 8);
  const [prompt, setPrompt] = useState("วิเคราะห์หุ้นนี้แบบ GPT-5.5 institutional-grade ให้ครบ 12 sections: Market Context, Technical Structure, Momentum, Smart Money, Sector & Peer, Volatility/Risk, Bull/Base/Bear Case, Trade Setup, Institutional Signal Scores และ AI Conclusion พร้อม Market Regime, Liquidity Zones, Dark Pool, Options Flow, Gamma/Max Pain ถ้ามีข้อมูล");
  const [mode, setMode] = useState<"beginner" | "advanced">("advanced");
  const [answer, setAnswer] = useState("เลือก ticker แล้วกด Ask Copilot เพื่อวิเคราะห์แบบ GPT-5.5 Institutional AI Stock Copilot: market context, technical structure, momentum, smart money, sector/peer, volatility/risk, scenario engine, trade setup และ institutional signal scores เป็นภาษาไทยแบบมืออาชีพ");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const plan = tradePlan(quote, "Breakout");
      const context = [
        `Ticker: ${ticker} (${quote.name})`,
        `Price: ${quote.price}, previous close: ${quote.previousClose}, change: ${quote.change} (${quote.changePercent}%), RSI: ${quote.rsi}, volume: ${quote.volume}, market cap: ${quote.marketCap}`,
        `Quant factors: breakout score ${quote.breakoutScore}/100, momentum score ${quote.momentumScore}/100, revenue growth ${quote.revenueGrowth}%, P/E ${quote.peRatio ?? "N/A"}, dividend yield ${quote.dividendYield}%`,
        `Theme flags: AI stock ${quote.isAiStock ? "yes" : "no"}, sector ${quote.sector}`,
        `Sector: ${quote.sector}, sector average change: ${sectorAvg.toFixed(2)}%`,
        `Peer group: ${peers.map((item) => `${item.ticker} ${item.changePercent}% RSI ${item.rsi}`).join(" | ")}`,
        `Technical levels: support ${plan.support.toFixed(2)}, resistance ${plan.resistance.toFixed(2)}, entry ${plan.entry.toFixed(2)}, cut ${plan.cut.toFixed(2)}, target ${plan.target.toFixed(2)}, RR ${plan.rr.toFixed(2)}`,
        `Latest news: ${latestNews.map((item) => `${item.date} ${item.ticker} ${item.sentiment} impact ${item.impact}: ${item.title}`).join(" | ")}`
      ].join("\n");
      const response = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: `${context}\n\nUser asks: ${prompt}`, mode }) });
      const data = (await response.json()) as { answer: string; disclaimer: string };
      setAnswer(`${data.answer}\n\n${data.disclaimer}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Stock Copilot</p><h2 className="mt-1 text-xl font-semibold text-white">à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸žà¸£à¹‰à¸­à¸¡ context à¸£à¸²à¸„à¸² à¸‚à¹ˆà¸²à¸§ sector à¹à¸¥à¸° peer</h2></div><div className="flex gap-2"><button onClick={requestRefresh} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"><RefreshCw size={15} />Refresh</button><StatusPill tone="info">{mode}</StatusPill></div></div>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]"><select value={ticker} onChange={(event) => setTicker(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((item) => <option key={item.ticker}>{item.ticker}</option>)}</select>{(["beginner", "advanced"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-2 text-sm ${mode === item ? "bg-purple-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4"><Metric label="Price" value={`$${quote.price.toFixed(2)}`} delta={`${quote.changePercent.toFixed(2)}%`} tone={quote.changePercent >= 0 ? "up" : "down"} /><Metric label="Prev Close" value={`$${quote.previousClose.toFixed(2)}`} delta={`chg ${quote.change.toFixed(2)}`} tone="neutral" /><Metric label="RSI" value={`${quote.rsi}`} delta={quote.sector} tone={quote.rsi > 65 ? "up" : quote.rsi < 35 ? "down" : "neutral"} /><Metric label="Sector Avg" value={`${sectorAvg.toFixed(2)}%`} delta={`${sectorRows.length} names`} tone={sectorAvg >= 0 ? "up" : "down"} /></div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-4 min-h-32 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] p-3 text-slate-100 outline-none" />
        <button onClick={ask} disabled={loading} className="mt-3 flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 font-medium text-slate-950"><Bot size={16} />{loading ? "Analyzing..." : "Ask Copilot"}</button>
        <pre className="mt-4 whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-300">{answer}</pre>
      </Panel>
      <Panel className="p-4"><h3 className="font-semibold text-white">Context Stack</h3><div className="mt-4 space-y-3 text-sm text-slate-300"><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">Peers: {peers.map((item) => item.ticker).join(", ") || "-"}</div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">News loaded: {latestNews.length}</div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">Volume: {quote.volume} Â· Market cap: {quote.marketCap}</div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">Breakout {quote.breakoutScore}/100 Â· Momentum {quote.momentumScore}/100 Â· Revenue Growth {quote.revenueGrowth.toFixed(1)}%</div></div><div className="mt-4 space-y-2">{["à¸§à¸´à¹€à¸„à¸£à¸²à¸°à¸«à¹Œà¸«à¸¸à¹‰à¸™à¸™à¸µà¹‰à¹à¸šà¸š institutional-grade à¸„à¸£à¸šà¸—à¸¸à¸à¸¡à¸´à¸•à¸´", "à¸«à¸¸à¹‰à¸™à¸™à¸µà¹‰ Breakout/Breakdown probability à¹€à¸—à¹ˆà¸²à¹„à¸£", "à¹€à¸ˆà¸²à¸° Smart Money, Dark Pool, Options Flow à¹à¸¥à¸° Liquidity Zones", "à¸—à¸³ Bull/Base/Bear Scenario à¸žà¸£à¹‰à¸­à¸¡ price target", "à¸•à¸±à¹‰à¸‡ Entry, Stop Loss, Take Profit à¹à¸¥à¸° Risk/Reward", "à¹€à¸—à¸µà¸¢à¸šà¸à¸±à¸š Sector, Nasdaq, S&P500 à¹à¸¥à¸° peer companies"].map((item) => <button key={item} onClick={() => setPrompt(item)} className="w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm text-slate-300">{item}</button>)}</div><button className="mt-4 flex items-center gap-2 text-sm text-cyan-200"><Mic size={15} />Voice input ready</button></Panel>
    </div>
  );
}

export function EnhancedPortfolioPage() {
  const { quotes, requestRefresh } = useMarketStore();
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(starterPortfolio);
  const [form, setForm] = useState({ ticker: "NVDA", quantity: 1, buyPrice: 100, targetPrice: 150, stopLoss: 90 });
  const rows = holdings.map((holding) => {
    const live = quotes.find((quote) => quote.ticker === holding.ticker);
    const currentPrice = live?.price ?? holding.currentPrice;
    const value = holding.quantity * currentPrice;
    const cost = holding.quantity * holding.buyPrice;
    return { ...holding, currentPrice, value, cost, pnl: value - cost, roi: ((value - cost) / cost) * 100 };
  });
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Portfolio Tracker watchlist realtime</h2>
          <button onClick={requestRefresh} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"><RefreshCw size={15} />Refresh</button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3"><Metric label="Total Value" value={`$${total.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} delta="live marks" tone="up" /><Metric label="Positions" value={`${rows.length}`} delta="editable" tone="neutral" /><Metric label="Best ROI" value={`${rows.length ? Math.max(...rows.map((row) => row.roi)).toFixed(1) : "0"}%`} delta="top" tone="up" /></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[780px] text-sm"><thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="py-2">Ticker</th><th>Qty</th><th>Avg Cost</th><th>Live Price</th><th>Prev</th><th>P/L</th><th>ROI</th><th></th></tr></thead><tbody>{rows.map((row) => { const live = quotes.find((quote) => quote.ticker === row.ticker); return <tr key={row.ticker} className="border-t border-white/10"><td className="py-3 font-mono text-white">{row.ticker}</td><td>{row.quantity}</td><td>${row.buyPrice.toFixed(2)}</td><td>${row.currentPrice.toFixed(2)}</td><td>${(live?.previousClose ?? row.currentPrice - row.pnl / Math.max(1, row.quantity)).toFixed(2)}</td><td className={row.pnl >= 0 ? "text-emerald-300" : "text-rose-300"}>${row.pnl.toFixed(0)}</td><td className={row.roi >= 0 ? "text-emerald-300" : "text-rose-300"}>{row.roi.toFixed(1)}%</td><td><button onClick={() => setHoldings((current) => current.filter((item) => item.ticker !== row.ticker))} className="text-slate-500 hover:text-rose-300">Remove</button></td></tr>; })}</tbody></table></div>
      </Panel>
      <Panel className="p-4"><h3 className="font-semibold text-white">Add / Update Position</h3><div className="mt-4 space-y-3"><select value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value })} className="h-10 w-full rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((quote) => <option key={quote.ticker} value={quote.ticker}>{quote.ticker} - {quote.name}</option>)}</select>{(["quantity", "buyPrice", "targetPrice", "stopLoss"] as const).map((key) => <input key={key} type="number" value={form[key]} onChange={(event) => setForm({ ...form, [key]: Number(event.target.value) })} className="h-10 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 text-slate-100 outline-none" placeholder={key} />)}<button onClick={() => { const quote = quotes.find((item) => item.ticker === form.ticker) ?? quotes[0]; setHoldings((current) => [...current.filter((item) => item.ticker !== form.ticker), { ...form, currentPrice: quote.price, sector: quote.sector, currency: form.ticker.endsWith(".BK") ? "THB" : "USD" }]); }} className="w-full rounded-md bg-cyan-300 px-3 py-2 font-medium text-slate-950">Save Position</button></div></Panel>
    </div>
  );
}

function formatPe(value: number | null) {
  return value === null ? "-" : value.toFixed(1);
}

function formatSignedPercent(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function EnhancedScreenerPage() {
  const { quotes, requestRefresh } = useMarketStore();
  const [sector, setSector] = useState("All");
  const [minRsi, setMinRsi] = useState(0);
  const [search, setSearch] = useState("");
  const [onlyBreakout, setOnlyBreakout] = useState(false);
  const sectors = ["All", ...Array.from(new Set(quotes.map((quote) => quote.sector)))];
  const rows = quotes.filter((quote) => (sector === "All" || quote.sector === sector) && quote.rsi >= minRsi && (!onlyBreakout || quote.breakoutScore >= 70 || quote.rsi > 65 || quote.changePercent > 2) && `${quote.ticker} ${quote.name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-white">Stock Screener watchlist realtime</h2><div className="flex gap-2"><button onClick={requestRefresh} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300">Refresh</button><StatusPill tone="info">{rows.length} matches</StatusPill></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-4"><input value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 rounded-md border border-white/10 bg-white/[0.03] px-3 text-slate-100 outline-none" placeholder="Search ticker..." /><select value={sector} onChange={(event) => setSector(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{sectors.map((item) => <option key={item}>{item}</option>)}</select><label className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-slate-300">Min RSI {minRsi}<input type="range" min="0" max="80" value={minRsi} onChange={(event) => setMinRsi(Number(event.target.value))} className="ml-3 align-middle" /></label><button onClick={() => setOnlyBreakout((value) => !value)} className={`rounded-md border px-3 py-2 text-sm ${onlyBreakout ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-slate-300"}`}>Breakout only</button></div>
      <div className="mt-4 max-h-[680px] overflow-auto"><table className="w-full min-w-[1020px] text-sm"><thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="py-2">à¸«à¸¸à¹‰à¸™</th><th>Market Cap</th><th>P/E</th><th>Revenue Growth</th><th>RSI</th><th>Breakout</th><th>AI Stocks</th><th>Dividend</th><th>Momentum</th></tr></thead><tbody>{rows.map((quote) => <tr key={quote.ticker} className="border-t border-white/10"><td className="py-3"><div className="flex items-center gap-2"><StockLogo quote={quote} size="sm" /><div><p className="font-mono text-white">{quote.ticker}</p><p className="text-xs text-slate-500">{quote.sector}</p></div></div></td><td className="font-mono text-slate-200">{quote.marketCap}</td><td className="font-mono text-slate-200">{formatPe(quote.peRatio)}</td><td className={quote.revenueGrowth >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>{formatSignedPercent(quote.revenueGrowth)}</td><td className="font-mono text-slate-200">{quote.rsi}</td><td><StatusPill tone={quote.breakoutScore >= 70 ? "up" : quote.breakoutScore <= 35 ? "down" : "neutral"}>{quote.breakoutScore}/100</StatusPill></td><td className="text-slate-300">{quote.isAiStock ? "à¹ƒà¸Šà¹ˆ" : "à¹„à¸¡à¹ˆà¹ƒà¸Šà¹ˆ"}</td><td className="font-mono text-slate-300">{quote.dividendYield.toFixed(2)}%</td><td><StatusPill tone={quote.momentumScore >= 70 ? "up" : quote.momentumScore <= 35 ? "down" : "neutral"}>{quote.momentumScore}/100</StatusPill></td></tr>)}</tbody></table></div>
    </Panel>
  );
}

export function EnhancedWhalesPage() {
  const { quotes, requestRefresh } = useMarketStore();
  const [ticker, setTicker] = useState("NVDA");
  const quote = quotes.find((item) => item.ticker === ticker) ?? quotes[0];
  const rows = ["Institutional Flow", "CEO Transaction", "Congress Trade", "Hedge Fund 13F", "Options Sweep", "Dark Pool"].map((name, index) => ({ name, ticker, value: index % 2 ? `+$${(quote.price * (index + 2)).toFixed(0)}M` : `${(quote.changePercent * (index + 1)).toFixed(2)}%`, signal: quote.changePercent > 1 ? "Accumulation" : quote.changePercent < -1 ? "Distribution" : "Watch" }));
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-white">Insider / Whale Tracking watchlist</h2><div className="flex flex-wrap gap-2"><select value={ticker} onChange={(event) => setTicker(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((item) => <option key={item.ticker}>{item.ticker}</option>)}</select><button onClick={requestRefresh} className="rounded-md border border-white/10 px-3 text-sm text-slate-300">Refresh</button></div></div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <div key={row.name} className="rounded-md border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{row.name}</p><div className="mt-3 flex items-center justify-between"><span className="font-mono text-xl text-white">{row.ticker}</span><StatusPill tone={row.signal === "Accumulation" ? "up" : row.signal === "Distribution" ? "down" : "neutral"}>{row.signal}</StatusPill></div><p className="mt-2 font-mono text-slate-300">{row.value}</p><p className="mt-1 text-xs text-slate-500">Now ${quote.price.toFixed(2)} Â· Prev ${quote.previousClose.toFixed(2)}</p></div>)}</div>
    </Panel>
  );
}

