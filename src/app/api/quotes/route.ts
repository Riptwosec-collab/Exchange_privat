import { NextRequest, NextResponse } from "next/server";
import { getFundamentals, quoteFromCandle, quoteNameMap } from "@/lib/market-utils";
import { watchlist } from "@/lib/mock-data";
import type { Candle, StockQuote } from "@/lib/types";

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        regularMarketVolume?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
};

function mockQuotes(tickers: string[]) {
  return tickers.map((ticker) => {
    const base = watchlist.find((quote) => quote.ticker === ticker);
    const wave = Math.sin(Date.now() / 12000 + ticker.length) * 0.9;
    if (!base) return quoteFromCandle(ticker, [
      { time: "2026-01-01", open: 100, high: 103, low: 98, close: 101, volume: 1_000_000 },
      { time: "2026-01-02", open: 101, high: 104, low: 99, close: 102, volume: 1_200_000 }
    ]);
    const price = Number(Math.max(1, base.price + wave).toFixed(2));
    const change = Number((base.change + wave).toFixed(2));
    return {
      ...base,
      price,
      previousClose: Number((price - change).toFixed(2)),
      change,
      changePercent: Number(((change / (price - change)) * 100).toFixed(2))
    };
  });
}

async function fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
  const info = quoteNameMap[symbol] ?? { name: symbol, sector: "Watchlist", marketCap: "-", logoFallback: symbol.slice(0, 2), brandColor: "#334155" };
  const yahooSymbol = info.yahooSymbol ?? symbol;
  const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=1d&interval=1m`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store"
  });
  if (!response.ok) return null;

  const data = (await response.json()) as YahooChart;
  const result = data.chart?.result?.[0];
  const meta = result?.meta;
  const closes = result?.indicators?.quote?.[0]?.close?.filter((value): value is number => typeof value === "number") ?? [];
  const volumes = result?.indicators?.quote?.[0]?.volume?.filter((value): value is number => typeof value === "number") ?? [];
  const price = meta?.regularMarketPrice ?? closes.at(-1);
  const previous = meta?.previousClose ?? closes.at(-2) ?? price;

  if (!price || !previous) return null;

  const change = price - previous;
  const rsi = Math.max(20, Math.min(85, Math.round(50 + change * 4)));
  const fundamental = getFundamentals(symbol);
  const breakoutScore = Math.max(0, Math.min(100, 55 + Number(((change / previous) * 100).toFixed(2)) * 7 + (rsi - 50) * 0.45));
  const momentumScore = Math.max(0, Math.min(100, 40 + rsi * 0.5 + Number(((change / previous) * 100).toFixed(2)) * 4));
  return {
    ticker: symbol,
    name: info.name,
    logoUrl: info.logoUrl,
    logoFallback: info.logoFallback,
    brandColor: info.brandColor,
    price: Number(price.toFixed(2)),
    previousClose: Number(previous.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / previous) * 100).toFixed(2)),
    volume: `${Math.round((meta?.regularMarketVolume ?? volumes.at(-1) ?? 0) / 1_000_000)}M`,
    marketCap: info.marketCap,
    sector: info.sector,
    rsi,
    peRatio: fundamental.peRatio,
    revenueGrowth: fundamental.revenueGrowth,
    dividendYield: fundamental.dividendYield,
    isAiStock: fundamental.isAiStock,
    breakoutScore: Number(breakoutScore.toFixed(0)),
    momentumScore: Number(momentumScore.toFixed(0))
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers =
    searchParams
      .get("symbols")
      ?.split(",")
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean) ?? watchlist.map((quote) => quote.ticker);

  const quotes = await Promise.all(tickers.map((ticker) => fetchYahooQuote(ticker)));
  const liveQuotes = quotes.filter(Boolean) as StockQuote[];

  if (liveQuotes.length > 0) {
    const liveTickers = new Set(liveQuotes.map((quote) => quote.ticker));
    const fallbackQuotes = mockQuotes(tickers.filter((ticker) => !liveTickers.has(ticker)));
    return NextResponse.json({
      provider: fallbackQuotes.length ? "yahoo+mock" : "yahoo",
      quotes: [...liveQuotes, ...fallbackQuotes],
      updatedAt: new Date().toISOString()
    });
  }

  return NextResponse.json({
    provider: "mock",
    message: "Live quote provider is unavailable. Showing generated fallback data.",
    quotes: mockQuotes(tickers),
    updatedAt: new Date().toISOString()
  });
}
