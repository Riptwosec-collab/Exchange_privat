"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { watchlist } from "@/lib/mock-data";
import { useMarketStore } from "@/store/market-store";

const quoteSymbols = watchlist.map((quote) => quote.ticker).join(",");

export function MarketTicker() {
  const { quotes, tick, setQuotes, setSelectedTicker, liveMode, lastUpdated } = useMarketStore();

  useEffect(() => {
    let cancelled = false;

    async function refreshQuotes() {
      try {
        const response = await fetch(`/api/quotes?symbols=${encodeURIComponent(quoteSymbols)}`, {
          cache: "no-store"
        });
        const data = (await response.json()) as {
          provider: "mock" | "finnhub";
          quotes?: typeof quotes;
        };

        if (!cancelled && data.quotes?.length) {
          setQuotes(data.quotes, data.provider === "finnhub" ? "provider" : "mock");
        }
      } catch {
        tick();
      }
    }

    refreshQuotes();
    const timer = window.setInterval(refreshQuotes, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [setQuotes, tick]);

  return (
    <div className="overflow-hidden border-y border-white/10 bg-black/30 lg:ml-[102px]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-1 text-xs text-slate-500">
        <span>{liveMode === "provider" ? "Live provider quotes" : "Mock live quotes - add FINNHUB_API_KEY for real US prices"}</span>
        <span>{lastUpdated ? `Updated ${lastUpdated}` : "Connecting..."}</span>
      </div>
      <motion.div
        animate={{ x: ["0%", "-45%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex w-max gap-3 px-4 py-2"
      >
        {[...quotes, ...quotes, ...quotes].map((quote, index) => {
          const up = quote.change >= 0;
          return (
            <button
              key={`${quote.ticker}-${index}`}
              onClick={() => setSelectedTicker(quote.ticker)}
              className="flex min-w-[180px] items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm"
            >
              <span className="text-slate-200">{quote.ticker}</span>
              <span className="text-white">${quote.price.toFixed(2)}</span>
              <span className={up ? "text-emerald-300" : "text-rose-300"}>{up ? "+" : ""}{quote.changePercent.toFixed(2)}%</span>
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
