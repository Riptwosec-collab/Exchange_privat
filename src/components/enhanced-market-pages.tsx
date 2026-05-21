"use client";

import { useState } from "react";
import { Bot, Mic, RefreshCw } from "lucide-react";
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
      return "เส้นแสดงทิศทางราคาปิด เหมาะดู momentum เร็ว ๆ";
    case "Area":
      return "พื้นที่ใต้เส้นช่วยเห็นแรงสะสมและแนวโน้มของราคา";
    case "Bars":
      return "แท่งบาร์ยาวแปลว่าช่วงแกว่งกว้าง ระวังความผันผวน";
    case "Heikin":
      return "แท่งปรับให้เรียบขึ้น ช่วยดู trend ต่อเนื่องและลด noise";
    case "Volume":
      return "แท่งสูงคือ volume หนา ใช้ยืนยัน breakout หรือแรงขาย";
    case "Range":
      return "แบ่งโซนบน/กลาง/ล่าง เพื่อดูราคาใกล้แนวต้านหรือแนวรับ";
    default:
      return "แท่งเขียวคือปิดสูงกว่าเปิด แท่งแดงคือปิดต่ำกว่าเปิด";
  }
}

function strategyExplanation(strategy: string) {
  if (strategy === "Pullback") return "รอราคาย่อใกล้แนวรับก่อนเข้า เพื่อลดความเสี่ยง";
  if (strategy === "Swing") return "เข้าใกล้ราคาปัจจุบัน แล้วถือรอบสั้นถึงกลางตามแรงแกว่ง";
  return "เข้าเมื่อราคาผ่านแนวต้าน พร้อมใช้จุดคัตเพื่อจำกัดขาดทุน";
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
            <motion.button key={stock.ticker} onClick={() => setSelectedTicker(stock.ticker)} whileHover={{ scale: 1.03 }} className={`rounded-md border p-3 text-left ${up ? "border-emerald-300/15 bg-emerald-400/15 hover:bg-emerald-400/25" : "border-rose-300/15 bg-rose-400/15 hover:bg-rose-400/25"}`} style={{ minHeight: `${92 + (index % 4) * 10}px` }}>
              <div className="flex items-start justify-between gap-2">
                <div><div className="font-mono text-sm text-white">{stock.ticker}</div><div className="mt-1 max-w-28 truncate text-xs text-slate-500">{stock.sector}</div></div>
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

export function EnhancedHeatmapPage() {
  const { quotes, setSelectedTicker, requestRefresh } = useMarketStore();
  const [filter, setFilter] = useState("All");
  const sectors = ["All", ...Array.from(new Set(quotes.map((item) => item.sector)))];
  const rows = quotes.filter((item) => filter === "All" || item.sector === filter).slice(0, 100);
  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Interactive Market Heatmap 100 symbols</h2>
          <p className="mt-1 text-sm text-slate-400">แสดงราคาปัจจุบัน ราคาเมื่อวาน และ % change พร้อม filter ตามประเภทหุ้น</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{sectors.map((item) => <option key={item}>{item}</option>)}</select>
          <button onClick={requestRefresh} className="h-10 rounded-md border border-white/10 px-3 text-sm text-slate-300 hover:border-cyan-300/40">Refresh</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
        {rows.map((stock, index) => {
          const up = stock.changePercent >= 0;
          return (
            <button key={stock.ticker} onClick={() => setSelectedTicker(stock.ticker)} className={`rounded-md border p-3 text-left transition hover:scale-[1.02] ${up ? "border-emerald-300/15 bg-emerald-400/15" : "border-rose-300/15 bg-rose-400/15"}`} style={{ minHeight: 108 + (index % 4) * 10 }}>
              <div className="flex items-start justify-between gap-2"><div className="font-mono text-sm text-white">{stock.ticker}</div><div className={up ? "text-emerald-300" : "text-rose-300"}>{up ? "+" : ""}{stock.changePercent.toFixed(2)}%</div></div>
              <div className="mt-2 truncate text-xs text-slate-500">{stock.sector}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[11px]"><span className="rounded bg-black/25 px-2 py-1 text-slate-300">Now ${stock.price.toFixed(2)}</span><span className="rounded bg-black/25 px-2 py-1 text-slate-400">Prev ${stock.previousClose.toFixed(2)}</span></div>
            </button>
          );
        })}
      </div>
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
        <div><h2 className="text-xl font-semibold text-white">Multi Chart Screen</h2><p className="mt-1 text-sm text-slate-400">ดูหลายหุ้นพร้อมกัน เปลี่ยนชนิดแท่งได้ 7 แบบ พร้อมแนวรับ แนวต้าน จุดเข้า จุดคัต และเป้าหมาย</p></div>
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
                <p><span className="font-semibold text-slate-200">อ่านแท่ง:</span> {chartModeExplanation(mode)}</p>
                <p className="mt-1"><span className="font-semibold text-slate-200">แผนเทรด:</span> {strategyExplanation(strategy)}</p>
                <p className="mt-1 font-mono text-slate-500">Target ${plan.target.toFixed(2)} · R/R {plan.rr.toFixed(2)}x</p>
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
  const [prompt, setPrompt] = useState("วิเคราะห์หุ้นนี้แบบรอบด้าน พร้อมแนวรับ แนวต้าน จุดเข้า จุดคัต เป้าหมาย ข่าวล่าสุด และความเสี่ยง");
  const [mode, setMode] = useState<"beginner" | "advanced">("advanced");
  const [answer, setAnswer] = useState("เลือก ticker แล้วกด Ask Copilot เพื่อวิเคราะห์จากราคา realtime, previous close, RSI, sector, peer group, ข่าว และ scenario หลายมุม");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    try {
      const plan = tradePlan(quote, "Breakout");
      const context = [
        `Ticker: ${ticker} (${quote.name})`,
        `Price: ${quote.price}, previous close: ${quote.previousClose}, change: ${quote.change} (${quote.changePercent}%), RSI: ${quote.rsi}, volume: ${quote.volume}, market cap: ${quote.marketCap}`,
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
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-cyan-300">AI Stock Copilot</p><h2 className="mt-1 text-xl font-semibold text-white">วิเคราะห์พร้อม context ราคา ข่าว sector และ peer</h2></div><div className="flex gap-2"><button onClick={requestRefresh} className="flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300"><RefreshCw size={15} />Refresh</button><StatusPill tone="info">{mode}</StatusPill></div></div>
        <div className="mt-4 grid gap-2 md:grid-cols-[1fr_auto_auto]"><select value={ticker} onChange={(event) => setTicker(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">{quotes.map((item) => <option key={item.ticker}>{item.ticker}</option>)}</select>{(["beginner", "advanced"] as const).map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-2 text-sm ${mode === item ? "bg-purple-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>)}</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4"><Metric label="Price" value={`$${quote.price.toFixed(2)}`} delta={`${quote.changePercent.toFixed(2)}%`} tone={quote.changePercent >= 0 ? "up" : "down"} /><Metric label="Prev Close" value={`$${quote.previousClose.toFixed(2)}`} delta={`chg ${quote.change.toFixed(2)}`} tone="neutral" /><Metric label="RSI" value={`${quote.rsi}`} delta={quote.sector} tone={quote.rsi > 65 ? "up" : quote.rsi < 35 ? "down" : "neutral"} /><Metric label="Sector Avg" value={`${sectorAvg.toFixed(2)}%`} delta={`${sectorRows.length} names`} tone={sectorAvg >= 0 ? "up" : "down"} /></div>
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mt-4 min-h-32 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] p-3 text-slate-100 outline-none" />
        <button onClick={ask} disabled={loading} className="mt-3 flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 font-medium text-slate-950"><Bot size={16} />{loading ? "Analyzing..." : "Ask Copilot"}</button>
        <pre className="mt-4 whitespace-pre-wrap rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-300">{answer}</pre>
      </Panel>
      <Panel className="p-4"><h3 className="font-semibold text-white">Context Stack</h3><div className="mt-4 space-y-3 text-sm text-slate-300"><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">Peers: {peers.map((item) => item.ticker).join(", ") || "-"}</div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">News loaded: {latestNews.length}</div><div className="rounded-md border border-white/10 bg-white/[0.03] p-3">Volume: {quote.volume} · Market cap: {quote.marketCap}</div></div><div className="mt-4 space-y-2">{["หุ้นนี้ breakout ไหม", "สรุปข่าวและ sentiment วันนี้", "ตั้ง stop loss/target แบบ trader", "เทียบกับหุ้นใน sector เดียวกัน", "ความเสี่ยง bullish/base/bearish"].map((item) => <button key={item} onClick={() => setPrompt(item)} className="w-full rounded-md border border-white/10 px-3 py-2 text-left text-sm text-slate-300">{item}</button>)}</div><button className="mt-4 flex items-center gap-2 text-sm text-cyan-200"><Mic size={15} />Voice input ready</button></Panel>
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
      <div className="mt-4 max-h-[680px] overflow-auto"><table className="w-full min-w-[1020px] text-sm"><thead className="text-left text-xs uppercase tracking-[0.16em] text-slate-500"><tr><th className="py-2">หุ้น</th><th>Market Cap</th><th>P/E</th><th>Revenue Growth</th><th>RSI</th><th>Breakout</th><th>AI Stocks</th><th>Dividend</th><th>Momentum</th></tr></thead><tbody>{rows.map((quote) => <tr key={quote.ticker} className="border-t border-white/10"><td className="py-3"><div className="flex items-center gap-2"><StockLogo quote={quote} size="sm" /><div><p className="font-mono text-white">{quote.ticker}</p><p className="text-xs text-slate-500">{quote.sector}</p></div></div></td><td className="font-mono text-slate-200">{quote.marketCap}</td><td className="font-mono text-slate-200">{formatPe(quote.peRatio)}</td><td className={quote.revenueGrowth >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>{formatSignedPercent(quote.revenueGrowth)}</td><td className="font-mono text-slate-200">{quote.rsi}</td><td><StatusPill tone={quote.breakoutScore >= 70 ? "up" : quote.breakoutScore <= 35 ? "down" : "neutral"}>{quote.breakoutScore}/100</StatusPill></td><td className="text-slate-300">{quote.isAiStock ? "ใช่" : "ไม่ใช่"}</td><td className="font-mono text-slate-300">{quote.dividendYield.toFixed(2)}%</td><td><StatusPill tone={quote.momentumScore >= 70 ? "up" : quote.momentumScore <= 35 ? "down" : "neutral"}>{quote.momentumScore}/100</StatusPill></td></tr>)}</tbody></table></div>
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
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => <div key={row.name} className="rounded-md border border-white/10 bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-[0.16em] text-slate-500">{row.name}</p><div className="mt-3 flex items-center justify-between"><span className="font-mono text-xl text-white">{row.ticker}</span><StatusPill tone={row.signal === "Accumulation" ? "up" : row.signal === "Distribution" ? "down" : "neutral"}>{row.signal}</StatusPill></div><p className="mt-2 font-mono text-slate-300">{row.value}</p><p className="mt-1 text-xs text-slate-500">Now ${quote.price.toFixed(2)} · Prev ${quote.previousClose.toFixed(2)}</p></div>)}</div>
    </Panel>
  );
}
