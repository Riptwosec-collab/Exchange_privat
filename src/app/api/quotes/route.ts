import { NextRequest, NextResponse } from "next/server";
import { watchlist } from "@/lib/mock-data";
import type { StockQuote } from "@/lib/types";

type FinnhubQuote = {
  c?: number;
  d?: number;
  dp?: number;
};

function mockQuotes(tickers: string[]) {
  return watchlist
    .filter((quote) => tickers.includes(quote.ticker))
    .map((quote, index) => {
      const wave = Math.sin(Date.now() / 12000 + index) * 0.9;
      const price = Number(Math.max(1, quote.price + wave).toFixed(2));
      const change = Number((quote.change + wave).toFixed(2));
      return {
        ...quote,
        price,
        change,
        changePercent: Number(((change / (price - change)) * 100).toFixed(2))
      };
    });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers =
    searchParams
      .get("symbols")
      ?.split(",")
      .map((symbol) => symbol.trim().toUpperCase())
      .filter(Boolean) ?? watchlist.map((quote) => quote.ticker);

  const token = process.env.FINNHUB_API_KEY;

  if (!token) {
    return NextResponse.json({
      provider: "mock",
      message: "Set FINNHUB_API_KEY to enable live US stock quote polling.",
      quotes: mockQuotes(tickers)
    });
  }

  const quotes = await Promise.all(
    tickers.map(async (ticker): Promise<StockQuote | null> => {
      const base = watchlist.find((quote) => quote.ticker === ticker);
      if (!base || ticker.endsWith(".BK")) return base ?? null;

      const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${token}`, {
        next: { revalidate: 5 }
      });

      if (!response.ok) return base;

      const data = (await response.json()) as FinnhubQuote;
      const price = data.c && data.c > 0 ? data.c : base.price;
      const change = data.d ?? price - base.price;
      const changePercent = data.dp ?? (change / Math.max(price - change, 1)) * 100;

      return {
        ...base,
        price: Number(price.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2))
      };
    })
  );

  return NextResponse.json({
    provider: "finnhub",
    quotes: quotes.filter(Boolean)
  });
}
