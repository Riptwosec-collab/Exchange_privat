import type { Candle, StockQuote } from "./types";

export type StockMeta = {
  ticker: string;
  name: string;
  sector: string;
  marketCap: string;
  logoUrl?: string;
  logoFallback: string;
  brandColor: string;
  yahooSymbol?: string;
};

function logo(domain: string) {
  return `https://logo.clearbit.com/${domain}`;
}

export const stockUniverse: StockMeta[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Consumer Tech", marketCap: "2.9T", logoUrl: logo("apple.com"), logoFallback: "A", brandColor: "#111827" },
  { ticker: "BTCTHB", name: "Bitcoin / Thai Baht", sector: "Crypto", marketCap: "Crypto", logoUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", logoFallback: "B", brandColor: "#f7931a", yahooSymbol: "BTC-USD" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Semiconductor", marketCap: "3.5T", logoUrl: logo("nvidia.com"), logoFallback: "N", brandColor: "#76b900" },
  { ticker: "CRWD", name: "CrowdStrike Holdings, Inc.", sector: "Cybersecurity", marketCap: "86B", logoUrl: logo("crowdstrike.com"), logoFallback: "C", brandColor: "#ef3124" },
  { ticker: "CRWV", name: "CoreWeave, Inc.", sector: "AI Cloud", marketCap: "AI Cloud", logoUrl: logo("coreweave.com"), logoFallback: "CW", brandColor: "#4563ff" },
  { ticker: "INTU", name: "Intuit Inc.", sector: "Software", marketCap: "180B", logoUrl: logo("intuit.com"), logoFallback: "I", brandColor: "#2f64d6" },
  { ticker: "RKLB", name: "Rocket Lab Corporation", sector: "Space", marketCap: "12B", logoUrl: logo("rocketlabusa.com"), logoFallback: "R", brandColor: "#1f2937" },
  { ticker: "TSLA", name: "Tesla, Inc.", sector: "EV", marketCap: "790B", logoUrl: logo("tesla.com"), logoFallback: "T", brandColor: "#e82127" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", sector: "Cloud/Retail", marketCap: "1.9T", logoUrl: logo("amazon.com"), logoFallback: "A", brandColor: "#ff9900" },
  { ticker: "GOOG", name: "Alphabet Inc. (Google) Class C", sector: "AI/Search", marketCap: "2.1T", logoUrl: logo("google.com"), logoFallback: "G", brandColor: "#ffffff" },
  { ticker: "MU", name: "Micron Technology, Inc.", sector: "Semiconductor", marketCap: "155B", logoUrl: logo("micron.com"), logoFallback: "M", brandColor: "#2d5ed3" },
  { ticker: "OSK", name: "Oshkosh Corporation", sector: "Industrial", marketCap: "8B", logoUrl: logo("oshkoshcorp.com"), logoFallback: "O", brandColor: "#20242a" },
  { ticker: "ASTS", name: "AST SpaceMobile, Inc.", sector: "Space", marketCap: "5B", logoUrl: logo("ast-science.com"), logoFallback: "AS", brandColor: "#111827" },
  { ticker: "LUNR", name: "Intuitive Machines, Inc.", sector: "Space", marketCap: "1B", logoUrl: logo("intuitivemachines.com"), logoFallback: "L", brandColor: "#2157a4" },
  { ticker: "SOFI", name: "SoFi Technologies, Inc.", sector: "Fintech", marketCap: "18B", logoUrl: logo("sofi.com"), logoFallback: "S", brandColor: "#45c3d3" },
  { ticker: "NBIS", name: "Nebius Group N.V.", sector: "AI Cloud", marketCap: "AI Cloud", logoUrl: logo("nebius.com"), logoFallback: "N", brandColor: "#d9ff3f" },
  { ticker: "NET", name: "Cloudflare, Inc.", sector: "Cloud/Security", marketCap: "35B", logoUrl: logo("cloudflare.com"), logoFallback: "CF", brandColor: "#f48120" },
  { ticker: "V", name: "Visa Inc.", sector: "Payments", marketCap: "560B", logoUrl: logo("visa.com"), logoFallback: "V", brandColor: "#1a1f71" },
  { ticker: "INTC", name: "Intel Corporation", sector: "Semiconductor", marketCap: "190B", logoUrl: logo("intel.com"), logoFallback: "I", brandColor: "#0071c5" },
  { ticker: "SNDK", name: "Sandisk Corporation", sector: "Storage", marketCap: "Storage", logoUrl: logo("sandisk.com"), logoFallback: "S", brandColor: "#f8fafc" },
  { ticker: "AMD", name: "Advanced Micro Devices, Inc.", sector: "Semiconductor", marketCap: "272B", logoUrl: logo("amd.com"), logoFallback: "AMD", brandColor: "#111827" },
  { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "AI Software", marketCap: "180B", logoUrl: logo("palantir.com"), logoFallback: "P", brandColor: "#171717" },
  { ticker: "QCOM", name: "QUALCOMM Incorporated", sector: "Semiconductor", marketCap: "210B", logoUrl: logo("qualcomm.com"), logoFallback: "Q", brandColor: "#3253dc" },
  { ticker: "IBM", name: "International Business Machines Corporation", sector: "AI/Enterprise", marketCap: "220B", logoUrl: logo("ibm.com"), logoFallback: "IBM", brandColor: "#0f62fe" },
  { ticker: "STK", name: "Columbia Seligman Premium Technology Growth Fund", sector: "Tech Fund", marketCap: "Fund", logoUrl: logo("columbiathreadneedleus.com"), logoFallback: "STK", brandColor: "#eef6ff" }
];

export const allStockSymbols = stockUniverse.map((stock) => stock.ticker);

export const quoteNameMap: Record<string, StockMeta> = Object.fromEntries(
  stockUniverse.map((stock) => [stock.ticker, stock])
);

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
  const meta = quoteNameMap[symbol] ?? { name: symbol, sector: "Watchlist", marketCap: "-", logoFallback: symbol.slice(0, 2), brandColor: "#334155" };
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? last;
  const change = last.close - previous.close;
  return {
    ticker: symbol,
    name: meta.name,
    logoUrl: meta.logoUrl,
    logoFallback: meta.logoFallback,
    brandColor: meta.brandColor,
    price: last.close,
    previousClose: previous.close,
    change: Number(change.toFixed(2)),
    changePercent: Number(((change / previous.close) * 100).toFixed(2)),
    volume: `${Math.round(last.volume / 1_000_000)}M`,
    marketCap: meta.marketCap,
    sector: meta.sector,
    rsi: Math.max(25, Math.min(82, Math.round(50 + change * 5 + Math.sin(last.close) * 10)))
  };
}
