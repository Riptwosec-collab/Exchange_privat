"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, RefreshCw, Search } from "lucide-react";
import { useMarketStore } from "@/store/market-store";
import { MarketSparkline } from "./market-sparkline";
import { StockLogo } from "./stock-logo";
import { Metric, Panel, StatusPill } from "./ui";

function signed(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function moveTone(value: number) {
  if (value > 0) return "text-emerald-300";
  if (value < 0) return "text-rose-300";
  return "text-slate-300";
}

function moveBadge(value: number) {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "neutral";
}

export function TopMoversPage() {
  const { quotes, requestRefresh, setSelectedTicker } = useMarketStore();
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState<number | "all">("all");
  const rows = useMemo(
    () =>
      quotes
        .map((quote) => {
          const dollarChange = Number((quote.price - quote.previousClose).toFixed(2));
          const percentChange = Number(((dollarChange / Math.max(0.01, quote.previousClose)) * 100).toFixed(2));
          return { ...quote, dollarChange, percentChange };
        })
        .filter((quote) => `${quote.ticker} ${quote.name} ${quote.sector}`.toLowerCase().includes(query.toLowerCase())),
    [query, quotes]
  );
  const visibleLimit = limit === "all" ? rows.length : limit;
  const gainers = [...rows].filter((quote) => quote.dollarChange >= 0).sort((a, b) => b.percentChange - a.percentChange).slice(0, visibleLimit);
  const losers = [...rows].filter((quote) => quote.dollarChange < 0).sort((a, b) => a.percentChange - b.percentChange).slice(0, visibleLimit);
  const biggestMove = [...rows].sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange))[0];
  const upCount = rows.filter((quote) => quote.dollarChange > 0).length;
  const downCount = rows.filter((quote) => quote.dollarChange < 0).length;

  function renderRows(items: typeof gainers, type: "gainer" | "loser") {
    const Icon = type === "gainer" ? ArrowUpRight : ArrowDownRight;
    return (
      <div className="space-y-2">
        {items.map((quote, index) => (
          <button
            key={quote.ticker}
            onClick={() => setSelectedTicker(quote.ticker)}
            className="grid w-full grid-cols-[32px_minmax(0,1fr)_120px_auto] items-center gap-3 rounded-2xl border border-white/10 bg-[#15161b] p-3 text-left transition hover:border-violet-300/35 hover:bg-white/[0.055]"
          >
            <span className="font-mono text-xs text-slate-500">#{index + 1}</span>
            <div className="flex min-w-0 items-center gap-3">
              <StockLogo quote={quote} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-white">{quote.ticker}</span>
                  <StatusPill tone={moveBadge(quote.dollarChange)}>{type === "gainer" ? "Gainer" : "Loser"}</StatusPill>
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{quote.name}</p>
                <p className="mt-1 text-xs text-slate-400">เมื่อวาน ${quote.previousClose.toFixed(2)} → ตอนนี้ ${quote.price.toFixed(2)}</p>
              </div>
            </div>
            <MarketSparkline id={quote.ticker} change={quote.percentChange} className="h-14 w-full" />
            <div className="text-right font-mono">
              <p className={`flex items-center justify-end gap-1 text-lg font-semibold ${moveTone(quote.dollarChange)}`}>
                <Icon size={17} /> {signed(quote.percentChange)}%
              </p>
              <p className={moveTone(quote.dollarChange)}>{signed(quote.dollarChange)} USD</p>
              <p className="mt-1 text-xs text-slate-500">Volume {quote.volume}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Realtime Movers</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Top Gainers / Losers</h2>
            <p className="mt-1 text-sm text-slate-400">สรุปหุ้นที่เพิ่ม/ลดจากราคาปิดเมื่อวาน แสดงทั้งเปอร์เซ็นต์และจำนวนดอลลาร์</p>
          </div>
          <button onClick={requestRefresh} className="flex h-10 items-center gap-2 rounded-md border border-white/10 px-3 text-sm text-slate-300 hover:border-cyan-300/40">
            <RefreshCw size={15} />Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3">
            <Search size={16} className="text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full bg-transparent text-sm text-slate-100 outline-none" placeholder="Search ticker, company, sector..." />
          </div>
          <div className="flex gap-2">
            {(["all", 5, 10, 20] as Array<number | "all">).map((item) => (
              <button key={item} onClick={() => setLimit(item)} className={`rounded-md px-3 py-2 text-sm ${limit === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-emerald-200">Top Gainers</h3>
              <span className="text-xs text-slate-500">{gainers.length} symbols</span>
            </div>
            {renderRows(gainers, "gainer")}
          </section>
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-rose-200">Top Losers</h3>
              <span className="text-xs text-slate-500">{losers.length} symbols</span>
            </div>
            {renderRows(losers, "loser")}
          </section>
        </div>
      </Panel>

      <Panel className="p-4">
        <h3 className="font-semibold text-white">Realtime Summary</h3>
        <div className="mt-4 space-y-3">
          <Metric label="Tracked" value={`${rows.length}`} delta="symbols" tone="neutral" />
          <Metric label="Up / Down" value={`${upCount}/${downCount}`} delta="vs yesterday" tone={upCount >= downCount ? "up" : "down"} />
          <Metric label="Biggest move" value={biggestMove?.ticker ?? "-"} delta={biggestMove ? `${signed(biggestMove.percentChange)}%` : "-"} tone={biggestMove ? moveBadge(biggestMove.dollarChange) : "neutral"} />
        </div>
        <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-slate-300">
          ราคาเทียบจาก `previousClose` ของแต่ละหุ้น: ถ้า `price` มากกว่าเมื่อวานจะแสดงเป็น Gainer และถ้าต่ำกว่าเมื่อวานจะแสดงเป็น Loser พร้อมส่วนต่างเป็น USD และเปอร์เซ็นต์แบบ realtime ตาม feed ปัจจุบัน
        </div>
      </Panel>
    </div>
  );
}
