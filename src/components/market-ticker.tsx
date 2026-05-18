"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useMarketStore } from "@/store/market-store";

export function MarketTicker() {
  const { quotes, tick, setSelectedTicker } = useMarketStore();

  useEffect(() => {
    const timer = window.setInterval(tick, 1800);
    return () => window.clearInterval(timer);
  }, [tick]);

  return (
    <div className="overflow-hidden border-y border-white/10 bg-black/30 lg:ml-[102px]">
      <motion.div animate={{ x: ["0%", "-45%"] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }} className="flex w-max gap-3 px-4 py-2">
        {[...quotes, ...quotes, ...quotes].map((quote, index) => {
          const up = quote.change >= 0;
          return (
            <button key={`${quote.ticker}-${index}`} onClick={() => setSelectedTicker(quote.ticker)} className="flex min-w-[180px] items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 font-mono text-sm">
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
