export type Sentiment = "Bullish" | "Neutral" | "Bearish";

export type StockQuote = {
  ticker: string;
  name: string;
  logoUrl?: string;
  logoFallback: string;
  brandColor: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  sector: string;
  rsi: number;
  peRatio: number | null;
  revenueGrowth: number;
  dividendYield: number;
  isAiStock: boolean;
  breakoutScore: number;
  momentumScore: number;
};

export type NewsArticle = {
  id: string;
  ticker: string;
  title: string;
  source: string;
  category: string;
  date: string;
  time: string;
  impact: number;
  sentiment: Sentiment;
  summaryTh: string;
  url?: string;
  saved: boolean;
};

export type PortfolioHolding = {
  ticker: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  sector: string;
  currency: "USD" | "THB";
  targetPrice: number;
  stopLoss: number;
};

export type Candle = {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
