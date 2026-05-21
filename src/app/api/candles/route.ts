import { NextRequest, NextResponse } from "next/server";
import { generateCandles, quoteNameMap } from "@/lib/market-utils";
import type { Candle } from "@/lib/types";

type YahooChart = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: Array<number | null>;
          high?: Array<number | null>;
          low?: Array<number | null>;
          close?: Array<number | null>;
          volume?: Array<number | null>;
        }>;
      };
    }>;
  };
};

const ranges: Record<string, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "5D": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  YTD: { range: "ytd", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "5Y": { range: "5y", interval: "1wk" }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase() ?? "NVDA";
  const yahooSymbol = quoteNameMap[symbol]?.yahooSymbol ?? symbol;
  const timeframe = searchParams.get("timeframe")?.toUpperCase() ?? "1D";
  const config = ranges[timeframe] ?? ranges["1D"];

  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=${config.range}&interval=${config.interval}`,
      { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }
    );
    if (!response.ok) throw new Error("Yahoo chart unavailable");

    const data = (await response.json()) as YahooChart;
    const result = data.chart?.result?.[0];
    const quote = result?.indicators?.quote?.[0];
    const candles: Candle[] =
      result?.timestamp
        ?.map((timestamp, index) => {
          const open = quote?.open?.[index];
          const high = quote?.high?.[index];
          const low = quote?.low?.[index];
          const close = quote?.close?.[index];
          if ([open, high, low, close].some((value) => typeof value !== "number")) return null;
          return {
            time: config.interval.includes("m") ? timestamp : new Date(timestamp * 1000).toISOString().slice(0, 10),
            open: Number((open as number).toFixed(2)),
            high: Number((high as number).toFixed(2)),
            low: Number((low as number).toFixed(2)),
            close: Number((close as number).toFixed(2)),
            volume: quote?.volume?.[index] ?? 0
          };
        })
        .filter((candle): candle is Candle => Boolean(candle)) ?? [];
    const uniqueCandles = Array.from(new Map(candles.map((candle) => [candle.time, candle])).values()).sort((a, b) => {
      const left = typeof a.time === "number" ? a.time : new Date(a.time).getTime() / 1000;
      const right = typeof b.time === "number" ? b.time : new Date(b.time).getTime() / 1000;
      return left - right;
    });

    if (uniqueCandles.length > 2) {
      return NextResponse.json({ provider: "yahoo", symbol, timeframe, candles: uniqueCandles, updatedAt: new Date().toISOString() });
    }
  } catch {
    // Fall through to mock data.
  }

  return NextResponse.json({
    provider: "mock",
    symbol,
    timeframe,
    candles: generateCandles(symbol, timeframe === "5Y" ? 260 : 120),
    updatedAt: new Date().toISOString()
  });
}
