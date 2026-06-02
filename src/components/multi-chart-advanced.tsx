"use client";

import { useState } from "react";
import { AdvancedChart } from "@/components/advanced-chart";
import { useMarketStore } from "@/store/market-store";
import { Panel } from "./ui";

export function MultiChartAdvancedPage() {
  const { quotes, timeframe, setTimeframe, requestRefresh, setSelectedTicker } = useMarketStore();
  const [grid, setGrid] = useState(4);
  const [start, setStart] = useState(0);
  const rows = quotes.slice(start, start + grid);

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Multi monitor</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Multi Chart Screen</h2>
          <p className="mt-1 text-sm text-slate-400">ดึงกราฟจาก Active workspace Charts · Advanced Chart · YAHOO ทั้งกราฟ ราคา และข้อมูลใต้กราฟ</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[2, 4, 6, 8].map((item) => (
            <button key={item} onClick={() => setGrid(item)} className={`rounded-md px-3 py-2 text-sm ${grid === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{item} ช่อง</button>
          ))}
          <button onClick={requestRefresh} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 hover:border-cyan-300/40">Refresh</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select value={start} onChange={(event) => setStart(Number(event.target.value))} className="h-9 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">
          {quotes.map((quote, index) => <option key={quote.ticker} value={index}>Start {quote.ticker}</option>)}
        </select>
        {["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"].map((item) => (
          <button key={item} onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-2 text-sm ${timeframe === item ? "bg-[#2962ff] text-white" : "border border-white/10 text-slate-300"}`}>{item}</button>
        ))}
      </div>

      <div className={`mt-4 grid gap-5 rounded-lg border border-[#2962ff]/20 bg-[#2962ff]/8 p-3 ${grid <= 2 ? "xl:grid-cols-2" : grid <= 4 ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
        {rows.map((quote, index) => (
          <article
            key={quote.ticker}
            onClick={() => setSelectedTicker(quote.ticker)}
            className="group min-w-0 overflow-hidden rounded-lg border border-[#2962ff]/24 bg-[#070b12] p-2 shadow-[0_20px_48px_rgba(0,0,0,.42)] ring-1 ring-white/[0.06] transition hover:border-[#2962ff]/55 hover:ring-[#2962ff]/25"
          >
            <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/35 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#2962ff]/30 bg-[#2962ff]/14 font-mono text-[11px] text-[#b9c8ff]">{index + 1}</span>
                <span className="truncate font-mono text-sm font-bold text-white">{quote.ticker}</span>
                <span className="truncate text-xs text-slate-500">{quote.name}</span>
              </div>
              <div className="shrink-0 text-right font-mono text-xs">
                <p className="text-slate-100">${quote.price.toFixed(2)}</p>
                <p className={quote.changePercent >= 0 ? "text-[#37e47b]" : "text-[#ff7a92]"}>{quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%</p>
              </div>
            </div>
            <div className="min-w-0 rounded-lg border border-white/10 bg-black/25 p-1">
            <AdvancedChart symbolOverride={quote.ticker} compact />
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
