"use client";

import { create } from "zustand";
import { watchlist } from "@/lib/mock-data";
import type { StockQuote } from "@/lib/types";

export type AppTheme = "Technology" | "Space" | "Luxury" | "Obsidian" | "Pearl" | "TradingView";

type MarketStore = {
  activeSection: string;
  appTheme: AppTheme;
  quotes: StockQuote[];
  selectedTicker: string;
  timeframe: string;
  liveMode: "mock" | "provider";
  lastUpdated: string | null;
  refreshNonce: number;
  setActiveSection: (section: string) => void;
  setAppTheme: (theme: AppTheme) => void;
  setSelectedTicker: (ticker: string) => void;
  setTimeframe: (timeframe: string) => void;
  setQuotes: (quotes: StockQuote[], liveMode?: "mock" | "provider") => void;
  requestRefresh: () => void;
  tick: () => void;
};

export const useMarketStore = create<MarketStore>((set) => ({
  activeSection: "Dashboard",
  appTheme: "Technology",
  quotes: watchlist,
  selectedTicker: "NVDA",
  timeframe: "1D",
  liveMode: "mock",
  lastUpdated: null,
  refreshNonce: 0,
  setActiveSection: (activeSection) => set({ activeSection }),
  setAppTheme: (appTheme) => set({ appTheme }),
  setSelectedTicker: (selectedTicker) => set({ selectedTicker }),
  setTimeframe: (timeframe) => set({ timeframe }),
  requestRefresh: () => set((state) => ({ refreshNonce: state.refreshNonce + 1 })),
  setQuotes: (quotes, liveMode = "provider") =>
    set({
      quotes,
      liveMode,
      lastUpdated: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    }),
  tick: () =>
    set((state) => ({
      quotes: state.quotes.map((quote) => {
        const move = (Math.random() - 0.48) * 0.7;
        const price = Number(Math.max(1, quote.price + move).toFixed(2));
        const change = Number((quote.change + move).toFixed(2));
        return {
          ...quote,
          price,
          previousClose: Number((price - change).toFixed(2)),
          change,
          changePercent: Number(((change / (price - change)) * 100).toFixed(2))
        };
      }),
      liveMode: "mock",
      lastUpdated: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    }))
}));
