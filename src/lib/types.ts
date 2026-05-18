export type Sentiment = "Bullish" | "Neutral" | "Bearish";

export type StockQuote = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  sector: string;
  rsi: number;
};

export type NewsArticle = {
  id: string;
  ticker: string;
  title: string;
  source: string;
  category: string;
  time: string;
  impact: number;
  sentiment: Sentiment;
  summaryTh: string;
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
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};
