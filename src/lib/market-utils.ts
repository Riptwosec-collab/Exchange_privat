import type { Candle, StockQuote } from "./types";

export const quoteNameMap: Record<string, { name: string; sector: string; marketCap: string }> = {
  NVDA: { name: "NVIDIA", sector: "Semiconductor", marketCap: "3.5T" },
  TSLA: { name: "Tesla", sector: "EV", marketCap: "790B" },
  RKLB: { name: "Rocket Lab", sector: "Space", marketCap: "12B" },
  AMD: { name: "Advanced Micro Devices", sector: "Semiconductor", marketCap: "272B" },
  "PTT.BK": { name: "PTT", sector: "Energy", marketCap: "1.0T THB" },
  MSFT: { name: "Microsoft", sector: "AI", marketCap: "3.1T" },
  AAPL: { name: "Apple", sector: "Consumer", marketCap: "2.9T" },
  COIN: { name: "Coinbase", sector: "Crypto", marketCap: "62B" },
  PLTR: { name: "Palantir", sector: "AI", marketCap: "180B" }
};

export function generateCandles(symbol: string, points = 120): Candle[] {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: points }, (_, index) => {
    const base = 80 + (seed % 80) + Math.sin(index / 6 + seed) * 8 + index * 0.18;
    const open = base + Math.sin(index + seed) * 1.8;
    const close = base + Math.cos(index / 2 + seed) * 2.6;
    const date = new Date(Date.UTC(2026, 1, 1 + index)).toISOString().slice(0, 10);
    return {
      time: date,
      open: Number(open.toFixed(2)),
      high: Number((Math.max(open, close) + 2.9).toFixed(2)),
      low: Number((Math.min(open, close) - 2.5).toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.round(12_000_000 + Math.abs(Math.sin(index / 3 + seed)) * 62_000_000)
    };
  });
}

export function quoteFromCandle(symbol: string, candles: Candle[]): StockQuote {
  const meta = quoteNameMap[symbol] ?? { name: symbol, sector: "Watchlist", marketCap: "-" };
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? last;
  const change = last.close - previous.close;
  return {
    ticker: symbol,
    name: meta.name,
    price: last.close,
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / previous.close) * 100).toFixed(2)),
    volume: `${Math.round(last.volume / 1_000_000)}M`,
    marketCap: meta.marketCap,
    sector: meta.sector,
    rsi: Math.max(25, Math.min(82, Math.round(50 + change * 5 + Math.sin(last.close) * 10)))
  };
}
