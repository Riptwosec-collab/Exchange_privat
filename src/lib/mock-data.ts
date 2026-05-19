import { generateCandles, quoteFromCandle, stockUniverse } from "./market-utils";
import type { Candle, NewsArticle, PortfolioHolding, StockQuote } from "./types";

export const indices = [
  { label: "NASDAQ", value: "18,742.33", change: 1.42 },
  { label: "S&P 500", value: "5,824.12", change: 0.86 },
  { label: "DOW", value: "42,118.90", change: -0.24 },
  { label: "SET", value: "1,392.45", change: 0.31 }
];

export const watchlist: StockQuote[] = stockUniverse.map((stock, index) => {
  const candles = generateCandles(stock.ticker, 80);
  const quote = quoteFromCandle(stock.ticker, candles);
  const direction = index % 5 === 0 ? -1 : 1;
  const changePercent = Number((direction * (0.2 + (index % 9) * 0.37)).toFixed(2));
  const price = Number(Math.max(1, quote.price + index * 0.11).toFixed(2));
  const change = Number(((price * changePercent) / 100).toFixed(2));
  const previousClose = Number((price - change).toFixed(2));
  return { ...quote, price, previousClose, change, changePercent, rsi: Math.max(18, Math.min(86, 36 + ((index * 7) % 49))) };
});

export const gainers = [{ ticker: "RKLB", change: 5.5 }, { ticker: "PLTR", change: 4.12 }, { ticker: "NVDA", change: 2.77 }, { ticker: "GULF.BK", change: 2.31 }];
export const losers = [{ ticker: "COIN", change: -3.44 }, { ticker: "TSLA", change: -1.67 }, { ticker: "AAPL", change: -0.93 }, { ticker: "DELTA.BK", change: -0.62 }];

const today = new Date().toISOString().slice(0, 10);
const baseNews: NewsArticle[] = [
  { id: "n1", ticker: "NVDA", title: "NVIDIA expands AI inference stack with enterprise GPU clusters", source: "Reuters", category: "AI", date: today, time: "09:18", impact: 92, sentiment: "Bullish", summaryTh: "ดีมานด์ AI inference ยังเร่งตัว หนุนรายได้ data center และ margin ระยะกลาง", url: "https://www.reuters.com/", saved: false },
  { id: "n2", ticker: "RKLB", title: "Rocket Lab wins multi-launch contract for defense satellite program", source: "SpaceNews", category: "Space", date: today, time: "08:52", impact: 86, sentiment: "Bullish", summaryTh: "สัญญาใหม่ช่วยเพิ่ม backlog และทำให้ narrative launch + space systems แข็งแรงขึ้น", url: "https://spacenews.com/", saved: true },
  { id: "n3", ticker: "PTT.BK", title: "Thai energy stocks rise as crude stabilizes above key support", source: "Bangkok Post", category: "Thai Stocks", date: today, time: "08:15", impact: 63, sentiment: "Neutral", summaryTh: "ราคาน้ำมันที่ทรงตัวช่วยลด downside แต่ upside ยังขึ้นกับค่าการกลั่นและค่าเงินบาท", url: "https://www.bangkokpost.com/", saved: false }
];

export const generatedNews: NewsArticle[] = stockUniverse.slice(0, 120).map((stock, index) => {
  const categories = ["AI", "Space", "Semiconductor", "Energy", "Crypto", "Thai Stocks", "US Stocks"];
  const category = stock.ticker.endsWith(".BK") ? "Thai Stocks" : categories[index % categories.length];
  const sentiment = (index % 6 === 0 ? "Bearish" : index % 4 === 0 ? "Neutral" : "Bullish") as NewsArticle["sentiment"];
  return { id: `auto-${stock.ticker}`, ticker: stock.ticker, title: `${stock.name} market update: price action, volume, and sector rotation`, source: index % 3 === 0 ? "Yahoo Finance" : index % 3 === 1 ? "MarketWatch" : "Reuters", category, date: today, time: `${String(8 + (index % 10)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`, impact: 48 + (index % 48), sentiment, summaryTh: `${stock.ticker} อยู่ในกลุ่ม ${stock.sector} มีแรงเคลื่อนไหวจากราคา volume และ sentiment รายวัน เหมาะสำหรับติดตามแนวรับแนวต้านและความเสี่ยงก่อนตัดสินใจ`, url: "https://finance.yahoo.com/", saved: false };
});

export const news: NewsArticle[] = [...baseNews, ...generatedNews.slice(0, 12)];

export const portfolio: PortfolioHolding[] = [
  { ticker: "NVDA", quantity: 18, buyPrice: 101.4, currentPrice: 145.28, sector: "Semiconductor", currency: "USD", targetPrice: 175, stopLoss: 126 },
  { ticker: "RKLB", quantity: 420, buyPrice: 11.2, currentPrice: 24.18, sector: "Space", currency: "USD", targetPrice: 32, stopLoss: 19 },
  { ticker: "AMD", quantity: 28, buyPrice: 132.8, currentPrice: 168.35, sector: "Semiconductor", currency: "USD", targetPrice: 198, stopLoss: 144 },
  { ticker: "PTT.BK", quantity: 2600, buyPrice: 33.5, currentPrice: 35.75, sector: "Energy", currency: "THB", targetPrice: 41, stopLoss: 31 }
];

export const candles: Candle[] = generateCandles("NVDA", 120);
export const heatmap = watchlist.slice(0, 100).map((quote, index) => ({ ticker: quote.ticker, sector: quote.sector, change: quote.changePercent, size: 8 + (index % 24) }));
export const economicEvents = [
  { event: "US CPI", date: "May 21, 2026", impact: "High", forecast: "3.1%" },
  { event: "FOMC Minutes", date: "May 22, 2026", impact: "High", forecast: "Rate path" },
  { event: "NVDA Earnings", date: "May 28, 2026", impact: "High", forecast: "$5.61 EPS" },
  { event: "Thailand GDP", date: "May 30, 2026", impact: "Medium", forecast: "2.6%" },
  { event: "US Non-farm Payroll", date: "June 5, 2026", impact: "High", forecast: "185K" },
  { event: "SET Earnings Window", date: "June 10, 2026", impact: "Medium", forecast: "Banks/Energy" }
];
