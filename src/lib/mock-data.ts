import type { Candle, NewsArticle, PortfolioHolding, StockQuote } from "./types";

export const indices = [
  { label: "NASDAQ", value: "18,742.33", change: 1.42 },
  { label: "S&P 500", value: "5,824.12", change: 0.86 },
  { label: "DOW", value: "42,118.90", change: -0.24 },
  { label: "SET", value: "1,392.45", change: 0.31 }
];

export const watchlist: StockQuote[] = [
  { ticker: "NVDA", name: "NVIDIA", price: 145.28, change: 3.92, changePercent: 2.77, volume: "58.2M", marketCap: "3.5T", sector: "Semiconductor", rsi: 64 },
  { ticker: "TSLA", name: "Tesla", price: 247.81, change: -4.22, changePercent: -1.67, volume: "92.4M", marketCap: "790B", sector: "EV", rsi: 43 },
  { ticker: "RKLB", name: "Rocket Lab", price: 24.18, change: 1.26, changePercent: 5.5, volume: "18.1M", marketCap: "12B", sector: "Space", rsi: 71 },
  { ticker: "AMD", name: "Advanced Micro Devices", price: 168.35, change: 2.44, changePercent: 1.47, volume: "44.9M", marketCap: "272B", sector: "Semiconductor", rsi: 58 },
  { ticker: "PTT.BK", name: "PTT", price: 35.75, change: 0.5, changePercent: 1.42, volume: "74.0M", marketCap: "1.0T THB", sector: "Energy", rsi: 52 }
];

export const gainers = [
  { ticker: "RKLB", change: 5.5 },
  { ticker: "PLTR", change: 4.12 },
  { ticker: "NVDA", change: 2.77 },
  { ticker: "GULF.BK", change: 2.31 }
];

export const losers = [
  { ticker: "COIN", change: -3.44 },
  { ticker: "TSLA", change: -1.67 },
  { ticker: "AAPL", change: -0.93 },
  { ticker: "DELTA.BK", change: -0.62 }
];

export const news: NewsArticle[] = [
  { id: "n1", ticker: "NVDA", title: "NVIDIA expands AI inference stack with enterprise GPU clusters", source: "Reuters", category: "AI", time: "09:18", impact: 92, sentiment: "Bullish", summaryTh: "ดีมานด์ AI inference ยังเร่งตัวต่อเนื่อง หนุนรายได้ data center และ margin ระยะกลาง", saved: false },
  { id: "n2", ticker: "RKLB", title: "Rocket Lab wins multi-launch contract for defense satellite program", source: "SpaceNews", category: "Space", time: "08:52", impact: 86, sentiment: "Bullish", summaryTh: "สัญญาใหม่ช่วยเพิ่ม backlog และทำให้ narrative ธุรกิจ launch + space systems แข็งแรงขึ้น", saved: true },
  { id: "n3", ticker: "PTT.BK", title: "Thai energy stocks rise as crude stabilizes above key support", source: "Bangkok Post", category: "Thai Stocks", time: "08:15", impact: 63, sentiment: "Neutral", summaryTh: "ราคาน้ำมันที่ทรงตัวช่วยลด downside แต่ upside ยังขึ้นกับค่าการกลั่นและค่าเงินบาท", saved: false },
  { id: "n4", ticker: "COIN", title: "Crypto exchange volumes cool after ETF-driven rally", source: "Bloomberg", category: "Crypto", time: "07:40", impact: 71, sentiment: "Bearish", summaryTh: "โมเมนตัม volume เริ่มชะลอ กดดันรายได้ transaction fee ในไตรมาสหน้า", saved: false }
];

export const portfolio: PortfolioHolding[] = [
  { ticker: "NVDA", quantity: 18, buyPrice: 101.4, currentPrice: 145.28, sector: "Semiconductor", currency: "USD", targetPrice: 175, stopLoss: 126 },
  { ticker: "RKLB", quantity: 420, buyPrice: 11.2, currentPrice: 24.18, sector: "Space", currency: "USD", targetPrice: 32, stopLoss: 19 },
  { ticker: "AMD", quantity: 28, buyPrice: 132.8, currentPrice: 168.35, sector: "Semiconductor", currency: "USD", targetPrice: 198, stopLoss: 144 },
  { ticker: "PTT.BK", quantity: 2600, buyPrice: 33.5, currentPrice: 35.75, sector: "Energy", currency: "THB", targetPrice: 41, stopLoss: 31 }
];

export const candles: Candle[] = Array.from({ length: 90 }, (_, index) => {
  const base = 118 + Math.sin(index / 5) * 8 + index * 0.32;
  const open = base + Math.sin(index) * 1.7;
  const close = base + Math.cos(index / 2) * 2.4;
  const date = new Date(Date.UTC(2026, 1, 1 + index)).toISOString().slice(0, 10);
  return { time: date, open: Number(open.toFixed(2)), high: Number((Math.max(open, close) + 3.2).toFixed(2)), low: Number((Math.min(open, close) - 2.8).toFixed(2)), close: Number(close.toFixed(2)), volume: Math.round(35000000 + Math.sin(index / 3) * 8000000) };
});

export const heatmap = [
  { ticker: "NVDA", sector: "AI", change: 2.77, size: 28 },
  { ticker: "MSFT", sector: "AI", change: 0.92, size: 24 },
  { ticker: "AAPL", sector: "Consumer", change: -0.93, size: 22 },
  { ticker: "TSLA", sector: "EV", change: -1.67, size: 18 },
  { ticker: "AMD", sector: "Semi", change: 1.47, size: 16 },
  { ticker: "RKLB", sector: "Space", change: 5.5, size: 12 },
  { ticker: "PTT", sector: "Energy", change: 1.42, size: 14 },
  { ticker: "COIN", sector: "Crypto", change: -3.44, size: 10 }
];

export const economicEvents = [
  { event: "US CPI", date: "May 21", impact: "High", forecast: "3.1%" },
  { event: "FOMC Minutes", date: "May 22", impact: "High", forecast: "Rate path" },
  { event: "NVDA Earnings", date: "May 28", impact: "High", forecast: "$5.61 EPS" },
  { event: "Thailand GDP", date: "May 30", impact: "Medium", forecast: "2.6%" }
];
