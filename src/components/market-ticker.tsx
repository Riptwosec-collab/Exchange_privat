"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { allStockSymbols } from "@/lib/market-utils";
import { useMarketStore } from "@/store/market-store";

const quoteSymbols = allStockSymbols.join(",");

export function MarketTicker() {
  const { quotes, tick, setQuotes, setSelectedTicker, liveMode, lastUpdated, refreshNonce } = useMarketStore();
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    let cancelled = false;
    async function refreshQuotes() {
      try {
        const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(quoteSymbols)}`, {
          cache: "no-store"
        });
        const data = (await response.json()) as {
          provider: string;
          quotes?: typeof quotes;
        };

        if (!cancelled && data.quotes?.length) {
          setQuotes(data.quotes, data.provider.includes("yahoo") ? "provider" : "mock");
        }
      } catch {
        tick();
      }
    }

    refreshQuotes();
    const timer = window.setInterval(refreshQuotes, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [setQuotes, tick, refreshNonce, paused]);

  return (
    <div className="mobile-market-ticker overflow-hidden border-y border-white/8 bg-[#111217]/82 backdrop-blur lg:ml-[292px]">
      <div className="ticker-status flex items-center justify-between border-b border-white/8 px-4 py-1.5 text-xs font-semibold text-slate-400">
        <span>{liveMode === "provider" ? `Live Yahoo Finance quotes for ${quotes.length} symbols` : `Mock live quotes for ${quotes.length} symbols - provider unavailable`}</span>
        <div className="flex items-center gap-3">
          <span>{paused ? "Paused" : lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}</span>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="rounded-lg border border-white/10 px-2 py-1 text-[11px] font-bold text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
          >
            {paused ? "Play" : "Pause"}
          </button>
        </div>
      </div>
      <motion.div
        animate={paused ? { x: "0%" } : { x: ["0%", "-45%"] }}
        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
        className="ticker-track flex w-max gap-3 px-4 py-2"
      >
        {[...quotes, ...quotes, ...quotes].map((quote, index) => {
          const up = quote.change >= 0;
          return (
            <button
              key={`${quote.ticker}-${index}`}
              onClick={() => setSelectedTicker(quote.ticker)}
              className="ticker-chip flex min-w-[190px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#1b1c23] px-3 py-2.5 font-mono text-sm transition hover:border-violet-400/28 hover:bg-violet-500/10"
            >
              <span className="font-black text-slate-100">{quote.ticker}</span>
              <span className="font-black text-white">${quote.price.toFixed(2)}</span>
              <span className={`font-black ${up ? "text-emerald-300" : "text-rose-300"}`}>{up ? "+" : ""}{quote.changePercent.toFixed(2)}%</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
