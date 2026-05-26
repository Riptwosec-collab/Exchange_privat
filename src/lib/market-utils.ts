import type { Candle, StockQuote } from "./types";
import { calculateRsi, calculateSupportResistance } from "./technical-indicators";

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

type FundamentalMeta = {
  peRatio: number | null;
  revenueGrowth: number;
  dividendYield: number;
  isAiStock: boolean;
};

function favicon(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

function simpleIcon(slug: string, color = "white") {
  return `https://cdn.simpleicons.org/${slug}/${color.replace("#", "")}`;
}

export const stockUniverse: StockMeta[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Consumer Tech", marketCap: "2.9T", logoUrl: simpleIcon("apple", "ffffff"), logoFallback: "A", brandColor: "#111827" },
  { ticker: "BTCTHB", name: "Bitcoin / Thai Baht", sector: "Crypto", marketCap: "Crypto", logoUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png", logoFallback: "B", brandColor: "#f7931a", yahooSymbol: "BTC-USD" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Semiconductor", marketCap: "3.5T", logoUrl: simpleIcon("nvidia", "76b900"), logoFallback: "N", brandColor: "#76b900" },
  { ticker: "CRWD", name: "CrowdStrike Holdings, Inc.", sector: "Cybersecurity", marketCap: "86B", logoUrl: favicon("crowdstrike.com"), logoFallback: "C", brandColor: "#ef3124" },
  { ticker: "CRWV", name: "CoreWeave, Inc.", sector: "AI Cloud", marketCap: "AI Cloud", logoUrl: favicon("coreweave.com"), logoFallback: "CW", brandColor: "#4563ff" },
  { ticker: "INTU", name: "Intuit Inc.", sector: "Software", marketCap: "180B", logoUrl: simpleIcon("intuit", "236cff"), logoFallback: "I", brandColor: "#2f64d6" },
  { ticker: "RKLB", name: "Rocket Lab Corporation", sector: "Space", marketCap: "12B", logoUrl: favicon("rocketlabusa.com"), logoFallback: "R", brandColor: "#1f2937" },
  { ticker: "TSLA", name: "Tesla, Inc.", sector: "EV", marketCap: "790B", logoUrl: simpleIcon("tesla", "e82127"), logoFallback: "T", brandColor: "#e82127" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", sector: "Cloud/Retail", marketCap: "1.9T", logoUrl: favicon("amazon.com"), logoFallback: "A", brandColor: "#ff9900" },
  { ticker: "GOOG", name: "Alphabet Inc. (Google) Class C", sector: "AI/Search", marketCap: "2.1T", logoUrl: simpleIcon("google", "4285f4"), logoFallback: "G", brandColor: "#ffffff" },
  { ticker: "MU", name: "Micron Technology, Inc.", sector: "Semiconductor", marketCap: "155B", logoUrl: favicon("micron.com"), logoFallback: "M", brandColor: "#2d5ed3" },
  { ticker: "OSK", name: "Oshkosh Corporation", sector: "Industrial", marketCap: "8B", logoUrl: favicon("oshkosh.com"), logoFallback: "O", brandColor: "#20242a" },
  { ticker: "ASTS", name: "AST SpaceMobile, Inc.", sector: "Space", marketCap: "5B", logoUrl: favicon("ast-science.com"), logoFallback: "AS", brandColor: "#111827" },
  { ticker: "LUNR", name: "Intuitive Machines, Inc.", sector: "Space", marketCap: "1B", logoUrl: favicon("intuitivemachines.com"), logoFallback: "L", brandColor: "#2157a4" },
  { ticker: "SOFI", name: "SoFi Technologies, Inc.", sector: "Fintech", marketCap: "18B", logoUrl: favicon("sofi.com"), logoFallback: "S", brandColor: "#45c3d3" },
  { ticker: "NBIS", name: "Nebius Group N.V.", sector: "AI Cloud", marketCap: "AI Cloud", logoUrl: favicon("nebius.com"), logoFallback: "N", brandColor: "#d9ff3f" },
  { ticker: "NET", name: "Cloudflare, Inc.", sector: "Cloud/Security", marketCap: "35B", logoUrl: simpleIcon("cloudflare", "f38020"), logoFallback: "CF", brandColor: "#f48120" },
  { ticker: "PANW", name: "Palo Alto Networks, Inc.", sector: "Cybersecurity", marketCap: "110B", logoUrl: favicon("paloaltonetworks.com"), logoFallback: "P", brandColor: "#fa582d" },
  { ticker: "NU", name: "Nu Holdings Ltd.", sector: "Fintech", marketCap: "58B", logoUrl: favicon("nubank.com.br"), logoFallback: "NU", brandColor: "#820ad1" },
  { ticker: "HOOD", name: "Robinhood Markets, Inc.", sector: "Fintech", marketCap: "20B", logoUrl: favicon("robinhood.com"), logoFallback: "H", brandColor: "#00c805" },
  { ticker: "AVGO", name: "Broadcom Inc.", sector: "Semiconductor", marketCap: "720B", logoUrl: favicon("broadcom.com"), logoFallback: "AV", brandColor: "#cc092f" },
  { ticker: "META", name: "Meta Platforms, Inc.", sector: "AI/Social", marketCap: "1.2T", logoUrl: simpleIcon("meta", "0866ff"), logoFallback: "M", brandColor: "#0866ff" },
  { ticker: "APLD", name: "Applied Digital Corporation", sector: "AI Infrastructure", marketCap: "3B", logoUrl: favicon("applieddigital.com"), logoFallback: "AD", brandColor: "#22c55e" },
  { ticker: "BBAI", name: "BigBear.ai Holdings, Inc.", sector: "AI Software", marketCap: "1B", logoUrl: favicon("bigbear.ai"), logoFallback: "BB", brandColor: "#2563eb" },
  { ticker: "IONQ", name: "IonQ, Inc.", sector: "Quantum Computing", marketCap: "10B", logoUrl: favicon("ionq.com"), logoFallback: "IQ", brandColor: "#6d28d9" },
  { ticker: "RGTI", name: "Rigetti Computing, Inc.", sector: "Quantum Computing", marketCap: "2B", logoUrl: favicon("rigetti.com"), logoFallback: "RG", brandColor: "#0ea5e9" },
  { ticker: "SMCI", name: "Super Micro Computer, Inc.", sector: "AI Infrastructure", marketCap: "45B", logoUrl: favicon("supermicro.com"), logoFallback: "SM", brandColor: "#0f766e" },
  { ticker: "VRT", name: "Vertiv Holdings Co.", sector: "AI Infrastructure", marketCap: "38B", logoUrl: favicon("vertiv.com"), logoFallback: "VT", brandColor: "#f97316" },
  { ticker: "SERV", name: "Serve Robotics Inc.", sector: "Robotics", marketCap: "1B", logoUrl: favicon("serverobotics.com"), logoFallback: "SR", brandColor: "#14b8a6" },
  { ticker: "SYM", name: "Symbotic Inc.", sector: "Robotics", marketCap: "28B", logoUrl: favicon("symbotic.com"), logoFallback: "SY", brandColor: "#16a34a" },
  { ticker: "ANET", name: "Arista Networks, Inc.", sector: "AI Networking", marketCap: "120B", logoUrl: favicon("arista.com"), logoFallback: "AN", brandColor: "#0ea5e9" },
  { ticker: "ETN", name: "Eaton Corporation plc", sector: "Power Infrastructure", marketCap: "130B", logoUrl: favicon("eaton.com"), logoFallback: "ET", brandColor: "#005eb8" },
  { ticker: "V", name: "Visa Inc.", sector: "Payments", marketCap: "560B", logoUrl: simpleIcon("visa", "1a1f71"), logoFallback: "V", brandColor: "#1a1f71" },
  { ticker: "INTC", name: "Intel Corporation", sector: "Semiconductor", marketCap: "190B", logoUrl: simpleIcon("intel", "0071c5"), logoFallback: "I", brandColor: "#0071c5" },
  { ticker: "SNDK", name: "Sandisk Corporation", sector: "Storage", marketCap: "Storage", logoUrl: favicon("sandisk.com"), logoFallback: "S", brandColor: "#f8fafc" },
  { ticker: "AMD", name: "Advanced Micro Devices, Inc.", sector: "Semiconductor", marketCap: "272B", logoUrl: simpleIcon("amd", "ed1c24"), logoFallback: "AMD", brandColor: "#111827" },
  { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "AI Software", marketCap: "180B", logoUrl: simpleIcon("palantir", "f5f5f5"), logoFallback: "P", brandColor: "#171717" },
  { ticker: "QCOM", name: "QUALCOMM Incorporated", sector: "Semiconductor", marketCap: "210B", logoUrl: simpleIcon("qualcomm", "3253dc"), logoFallback: "Q", brandColor: "#3253dc" },
  { ticker: "IBM", name: "International Business Machines Corporation", sector: "AI/Enterprise", marketCap: "220B", logoUrl: favicon("ibm.com"), logoFallback: "IBM", brandColor: "#0f62fe" },
  { ticker: "STK", name: "Columbia Seligman Premium Technology Growth Fund", sector: "Tech Fund", marketCap: "Fund", logoUrl: favicon("columbiathreadneedleus.com"), logoFallback: "STK", brandColor: "#eef6ff" }
];

export const allStockSymbols = stockUniverse.map((stock) => stock.ticker);

export const quoteNameMap: Record<string, StockMeta> = Object.fromEntries(
  stockUniverse.map((stock) => [stock.ticker, stock])
);

const fundamentals: Record<string, FundamentalMeta> = {
  AAPL: { peRatio: 32.4, revenueGrowth: 2.1, dividendYield: 0.5, isAiStock: true },
  BTCTHB: { peRatio: null, revenueGrowth: 0, dividendYield: 0, isAiStock: false },
  NVDA: { peRatio: 56.8, revenueGrowth: 122.4, dividendYield: 0.03, isAiStock: true },
  CRWD: { peRatio: null, revenueGrowth: 29.8, dividendYield: 0, isAiStock: true },
  CRWV: { peRatio: null, revenueGrowth: 64.2, dividendYield: 0, isAiStock: true },
  INTU: { peRatio: 54.1, revenueGrowth: 12.7, dividendYield: 0.6, isAiStock: true },
  RKLB: { peRatio: null, revenueGrowth: 16.2, dividendYield: 0, isAiStock: false },
  TSLA: { peRatio: 78.5, revenueGrowth: 1.4, dividendYield: 0, isAiStock: true },
  AMZN: { peRatio: 44.9, revenueGrowth: 11.9, dividendYield: 0, isAiStock: true },
  GOOG: { peRatio: 27.6, revenueGrowth: 14.0, dividendYield: 0.4, isAiStock: true },
  MU: { peRatio: 14.8, revenueGrowth: 61.6, dividendYield: 0.3, isAiStock: true },
  OSK: { peRatio: 11.6, revenueGrowth: 12.4, dividendYield: 1.5, isAiStock: false },
  ASTS: { peRatio: null, revenueGrowth: 0.8, dividendYield: 0, isAiStock: false },
  LUNR: { peRatio: null, revenueGrowth: 48.1, dividendYield: 0, isAiStock: false },
  SOFI: { peRatio: 42.5, revenueGrowth: 23.9, dividendYield: 0, isAiStock: false },
  NBIS: { peRatio: null, revenueGrowth: 38.5, dividendYield: 0, isAiStock: true },
  NET: { peRatio: null, revenueGrowth: 28.6, dividendYield: 0, isAiStock: true },
  PANW: { peRatio: 49.4, revenueGrowth: 16.5, dividendYield: 0, isAiStock: true },
  NU: { peRatio: 37.2, revenueGrowth: 58.4, dividendYield: 0, isAiStock: false },
  HOOD: { peRatio: 42.8, revenueGrowth: 39.1, dividendYield: 0, isAiStock: false },
  AVGO: { peRatio: 34.7, revenueGrowth: 43.9, dividendYield: 1.2, isAiStock: true },
  META: { peRatio: 27.8, revenueGrowth: 18.6, dividendYield: 0.4, isAiStock: true },
  APLD: { peRatio: null, revenueGrowth: 52.7, dividendYield: 0, isAiStock: true },
  BBAI: { peRatio: null, revenueGrowth: 22.4, dividendYield: 0, isAiStock: true },
  IONQ: { peRatio: null, revenueGrowth: 74.6, dividendYield: 0, isAiStock: true },
  RGTI: { peRatio: null, revenueGrowth: 61.9, dividendYield: 0, isAiStock: true },
  SMCI: { peRatio: 24.9, revenueGrowth: 46.8, dividendYield: 0, isAiStock: true },
  VRT: { peRatio: 39.5, revenueGrowth: 18.7, dividendYield: 0.1, isAiStock: true },
  SERV: { peRatio: null, revenueGrowth: 31.5, dividendYield: 0, isAiStock: true },
  SYM: { peRatio: null, revenueGrowth: 35.2, dividendYield: 0, isAiStock: true },
  ANET: { peRatio: 42.4, revenueGrowth: 16.9, dividendYield: 0, isAiStock: true },
  ETN: { peRatio: 31.3, revenueGrowth: 10.8, dividendYield: 1.0, isAiStock: true },
  V: { peRatio: 30.2, revenueGrowth: 9.8, dividendYield: 0.7, isAiStock: false },
  INTC: { peRatio: null, revenueGrowth: -2.1, dividendYield: 1.1, isAiStock: true },
  SNDK: { peRatio: 18.9, revenueGrowth: 7.4, dividendYield: 0.9, isAiStock: false },
  AMD: { peRatio: 47.3, revenueGrowth: 13.6, dividendYield: 0, isAiStock: true },
  PLTR: { peRatio: 86.7, revenueGrowth: 20.8, dividendYield: 0, isAiStock: true },
  QCOM: { peRatio: 18.2, revenueGrowth: 8.9, dividendYield: 1.8, isAiStock: true },
  IBM: { peRatio: 23.1, revenueGrowth: 3.5, dividendYield: 3.1, isAiStock: true },
  STK: { peRatio: null, revenueGrowth: 0, dividendYield: 6.4, isAiStock: true }
};

export function getFundamentals(symbol: string): FundamentalMeta {
  return fundamentals[symbol] ?? { peRatio: null, revenueGrowth: 0, dividendYield: 0, isAiStock: false };
}

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
  const fundamental = fundamentals[symbol] ?? { peRatio: null, revenueGrowth: 0, dividendYield: 0, isAiStock: false };
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2] ?? last;
  const change = last.close - previous.close;
  const rsi = Math.round(calculateRsi(candles) ?? Math.max(25, Math.min(82, 50 + change * 5 + Math.sin(last.close) * 10)));
  const { resistance } = calculateSupportResistance(candles, 20);
  const breakoutScore = resistance
    ? Math.max(0, Math.min(100, 100 - ((resistance - last.close) / Math.max(0.01, resistance)) * 450))
    : Math.max(0, Math.min(100, 50 + change * 8));
  const momentumScore = Math.max(0, Math.min(100, 45 + rsi * 0.45 + (change / Math.max(0.01, previous.close)) * 700));
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
    rsi,
    peRatio: fundamental.peRatio,
    revenueGrowth: fundamental.revenueGrowth,
    dividendYield: fundamental.dividendYield,
    isAiStock: fundamental.isAiStock,
    breakoutScore: Number(breakoutScore.toFixed(0)),
    momentumScore: Number(momentumScore.toFixed(0))
  };
}
