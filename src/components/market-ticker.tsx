"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { allStockSymbols } from "@/lib/market-utils";
import { useMarketStore } from "@/store/market-store";

const quoteSymbols = allStockSymbols.join(",");

export function MarketTicker() {
  const { quotes, tick, setQuotes, setSelectedTicker, liveMode, lastUpdated, refreshNonce } = useMarketStore();

  useEffect(() => {
    let cancelled = false;
    async function refreshQuotes() {
      try {
        const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(quoteSymbols)}`, { cache: "no-store" });
        const data = (await response.json()) as { provider: string; quotes?: typeof quotes };
        if (!cancelled && data.quotes?.length) setQuotes(data.quotes, data.provider.includes("yahoo") ? "provider" : "mock");
      } catch {
        tick();
      }
    }
    refreshQuotes();
    const timer = window.setInterval(refreshQuotes, 15000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [setQuotes, tick, refreshNonce]);

  return (
    <div className="overflow-hidden border-y border-white/10 bg-black/30 lg:ml-[102px]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-1 text-xs text-slate-500">
        <span>{liveMode === "provider" ? `Live Yahoo Finance quotes for ${quotes.length} symbols` : `Mock live quotes for ${quotes.length} symbols - provider unavailable`}</span>
        <span>{lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}</span>
      </div>
      <motion.div animate={{ x: ["0%", "-45%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} className="flex w-max gap-3 px-4 py-2">
        {[...quotes, ...quotes, ...quotes].map((quote, index) => {
          const up = quote.change >= 0;
          return <button key={`${quote.ticker}-${index}`} onClick={() => setSelectedTicker(quote.ticker)} className="flex min-w-[180px] items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm"><span className="text-slate-200">{quote.ticker}</span><span className="text-white">${quote.price.toFixed(2)}</span><span className={up ? "text-emerald-300" : "text-rose-300"}>{up ? "+" : ""}{quote.changePercent.toFixed(2)}%</span></button>;
        })}
      </motion.div>
    </div>
  );
}
