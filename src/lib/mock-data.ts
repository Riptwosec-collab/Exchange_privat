import { generateCandles } from "./market-utils";
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
  { ticker: "MSFT", name: "Microsoft", price: 424.11, change: 3.18, changePercent: 0.76, volume: "26.8M", marketCap: "3.1T", sector: "AI", rsi: 61 },
  { ticker: "AAPL", name: "Apple", price: 188.72, change: -1.22, changePercent: -0.64, volume: "51.4M", marketCap: "2.9T", sector: "Consumer", rsi: 48 },
  { ticker: "COIN", name: "Coinbase", price: 248.92, change: -7.4, changePercent: -2.89, volume: "14.2M", marketCap: "62B", sector: "Crypto", rsi: 39 },
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
  { id: "n1", ticker: "NVDA", title: "NVIDIA expands AI inference stack with enterprise GPU clusters", source: "Reuters", category: "AI", date: "2026-05-18", time: "09:18", impact: 92, sentiment: "Bullish", summaryTh: "ดีมานด์ AI inference ยังเร่งตัวต่อเนื่อง หนุนรายได้ data center และ margin ระยะกลาง", url: "https://www.reuters.com/", saved: false },
  { id: "n2", ticker: "RKLB", title: "Rocket Lab wins multi-launch contract for defense satellite program", source: "SpaceNews", category: "Space", date: "2026-05-18", time: "08:52", impact: 86, sentiment: "Bullish", summaryTh: "สัญญาใหม่ช่วยเพิ่ม backlog และทำให้ narrative ธุรกิจ launch + space systems แข็งแรงขึ้น", url: "https://spacenews.com/", saved: true },
  { id: "n3", ticker: "PTT.BK", title: "Thai energy stocks rise as crude stabilizes above key support", source: "Bangkok Post", category: "Thai Stocks", date: "2026-05-18", time: "08:15", impact: 63, sentiment: "Neutral", summaryTh: "ราคาน้ำมันที่ทรงตัวช่วยลด downside แต่ upside ยังขึ้นกับค่าการกลั่นและค่าเงินบาท", url: "https://www.bangkokpost.com/", saved: false },
  { id: "n4", ticker: "COIN", title: "Crypto exchange volumes cool after ETF-driven rally", source: "Bloomberg", category: "Crypto", date: "2026-05-18", time: "07:40", impact: 71, sentiment: "Bearish", summaryTh: "โมเมนตัม volume เริ่มชะลอ กดดันรายได้ transaction fee ในไตรมาสหน้า", url: "https://www.bloomberg.com/", saved: false },
  { id: "n5", ticker: "AMD", title: "Chip suppliers rebound as AI server demand broadens beyond megacaps", source: "MarketWatch", category: "Semiconductor", date: "2026-05-18", time: "10:05", impact: 78, sentiment: "Bullish", summaryTh: "แรงซื้อกระจายจากหุ้น AI megacap ไปยัง supplier ทำให้หุ้นชิประดับรองมีโอกาส outperform ระยะสั้น", url: "https://www.marketwatch.com/", saved: false },
  { id: "n6", ticker: "TSLA", title: "EV makers face margin pressure as price cuts return in key markets", source: "CNBC", category: "US Stocks", date: "2026-05-18", time: "10:22", impact: 69, sentiment: "Bearish", summaryTh: "สงครามราคากลับมากด margin กลุ่ม EV นักลงทุนจับตา delivery และ gross margin รอบถัดไป", url: "https://www.cnbc.com/", saved: false },
  { id: "n7", ticker: "MSFT", title: "Cloud AI spend remains resilient as enterprise migration accelerates", source: "Yahoo Finance", category: "AI", date: "2026-05-18", time: "11:10", impact: 81, sentiment: "Bullish", summaryTh: "รายจ่าย cloud AI ขององค์กรยังแข็งแรง ช่วยหนุนรายได้ recurring และ ecosystem software", url: "https://finance.yahoo.com/", saved: false },
  { id: "n8", ticker: "PTT.BK", title: "Thai market rotates into energy and utilities ahead of macro data", source: "SET News", category: "Thai Stocks", date: "2026-05-18", time: "11:42", impact: 58, sentiment: "Neutral", summaryTh: "เม็ดเงินในตลาดไทยเริ่มหมุนเข้ากลุ่ม defensive และพลังงานก่อนตัวเลขเศรษฐกิจสำคัญ", url: "https://www.set.or.th/", saved: false }
];

export const portfolio: PortfolioHolding[] = [
  { ticker: "NVDA", quantity: 18, buyPrice: 101.4, currentPrice: 145.28, sector: "Semiconductor", currency: "USD", targetPrice: 175, stopLoss: 126 },
  { ticker: "RKLB", quantity: 420, buyPrice: 11.2, currentPrice: 24.18, sector: "Space", currency: "USD", targetPrice: 32, stopLoss: 19 },
  { ticker: "AMD", quantity: 28, buyPrice: 132.8, currentPrice: 168.35, sector: "Semiconductor", currency: "USD", targetPrice: 198, stopLoss: 144 },
  { ticker: "PTT.BK", quantity: 2600, buyPrice: 33.5, currentPrice: 35.75, sector: "Energy", currency: "THB", targetPrice: 41, stopLoss: 31 }
];

export const candles: Candle[] = generateCandles("NVDA", 120);

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
  { event: "US CPI", date: "May 21, 2026", impact: "High", forecast: "3.1%" },
  { event: "FOMC Minutes", date: "May 22, 2026", impact: "High", forecast: "Rate path" },
  { event: "NVDA Earnings", date: "May 28, 2026", impact: "High", forecast: "$5.61 EPS" },
  { event: "Thailand GDP", date: "May 30, 2026", impact: "Medium", forecast: "2.6%" },
  { event: "US Non-farm Payroll", date: "June 5, 2026", impact: "High", forecast: "185K" },
  { event: "SET Earnings Window", date: "June 10, 2026", impact: "Medium", forecast: "Banks/Energy" }
];
