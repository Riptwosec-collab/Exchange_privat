import { generateCandles, quoteFromCandle, stockUniverse } from "./market-utils";
import type { Candle, NewsArticle, PortfolioHolding, StockQuote } from "./types";

export const indices = [
  { label: "NASDAQ", value: "18,742.33", change: 1.42 },
  { label: "S&P 500", value: "5,824.12", change: 0.86 },
  { label: "DOW", value: "42,118.90", change: -0.24 },
  { label: "BTC/THB", value: "2,512,392", change: 0.09 }
];

export const watchlist: StockQuote[] = stockUniverse.map((stock, index) => {
  const candles = generateCandles(stock.ticker, 80);
  const quote = quoteFromCandle(stock.ticker, candles);
  const direction = [1, -1, 1, 1, -1][index % 5];
  const changePercent = Number((direction * (0.08 + (index % 9) * 0.41)).toFixed(2));
  const price = Number(Math.max(1, quote.price + index * 0.11).toFixed(2));
  const change = Number(((price * changePercent) / 100).toFixed(2));
  const previousClose = Number((price - change).toFixed(2));
  return { ...quote, price, previousClose, change, changePercent, rsi: Math.max(18, Math.min(86, 36 + ((index * 7) % 49))) };
});

export const gainers = [
  { ticker: "NBIS", change: 16.95 },
  { ticker: "IBM", change: 7.87 },
  { ticker: "SNDK", change: 5.82 },
  { ticker: "CRWV", change: 4.58 }
];

export const losers = [
  { ticker: "INTU", change: -19.98 },
  { ticker: "RKLB", change: -4.92 },
  { ticker: "INTC", change: -3.0 },
  { ticker: "AMD", change: -2.08 }
];

export const news: NewsArticle[] = [
  {
    id: "n1",
    ticker: "NVDA",
    title: "NVIDIA AI demand keeps data center suppliers in focus",
    source: "Reuters",
    category: "Semiconductor",
    date: "2026-05-18",
    time: "09:18",
    impact: 92,
    sentiment: "Bullish",
    summaryTh: "ดีมานด์ AI inference ยังหนุนหุ้นกลุ่ม data center และชิป นักลงทุนจับตา margin และ guidance รอบถัดไป",
    url: "https://www.reuters.com/",
    saved: false
  },
  {
    id: "n2",
    ticker: "RKLB",
    title: "Rocket Lab backlog stays in focus after new launch updates",
    source: "SpaceNews",
    category: "Space",
    date: "2026-05-18",
    time: "08:52",
    impact: 86,
    sentiment: "Bullish",
    summaryTh: "ธุรกิจ launch และ space systems ยังเป็นจุดที่ตลาดให้ premium แต่ความผันผวนสูง ควรดู backlog และ cash burn คู่กัน",
    url: "https://spacenews.com/",
    saved: true
  },
  {
    id: "n3",
    ticker: "NBIS",
    title: "Nebius rally extends as AI cloud demand remains strong",
    source: "Yahoo Finance",
    category: "AI Cloud",
    date: "2026-05-18",
    time: "08:15",
    impact: 88,
    sentiment: "Bullish",
    summaryTh: "แรงซื้อยังไหลเข้าหุ้น AI cloud ขนาดกลาง หลังตลาดมองหาโครงสร้างพื้นฐาน AI นอกกลุ่ม megacap",
    url: "https://finance.yahoo.com/",
    saved: false
  },
  {
    id: "n4",
    ticker: "INTU",
    title: "Intuit drops as investors reassess growth assumptions",
    source: "Bloomberg",
    category: "Software",
    date: "2026-05-18",
    time: "07:40",
    impact: 83,
    sentiment: "Bearish",
    summaryTh: "แรงขายสะท้อนความกังวลเรื่อง valuation และการเติบโตของซอฟต์แวร์ภาษี/บัญชี ควรรอฐานราคานิ่งก่อนเพิ่มน้ำหนัก",
    url: "https://www.bloomberg.com/",
    saved: false
  },
  {
    id: "n5",
    ticker: "AMD",
    title: "AMD pulls back while AI chip competition stays intense",
    source: "MarketWatch",
    category: "Semiconductor",
    date: "2026-05-18",
    time: "10:05",
    impact: 78,
    sentiment: "Bearish",
    summaryTh: "หุ้นชิปยังอยู่ในธีม AI แต่แรงขายระยะสั้นมาจากการแข่งขันและความคาดหวังที่สูง ต้องดูแนวรับและ order visibility",
    url: "https://www.marketwatch.com/",
    saved: false
  },
  {
    id: "n6",
    ticker: "TSLA",
    title: "EV makers face margin pressure as price cuts return in key markets",
    source: "CNBC",
    category: "EV",
    date: "2026-05-18",
    time: "10:22",
    impact: 69,
    sentiment: "Bearish",
    summaryTh: "สงครามราคากลับมากด margin กลุ่ม EV นักลงทุนจับตา delivery และ gross margin รอบถัดไป",
    url: "https://www.cnbc.com/",
    saved: false
  },
  {
    id: "n7",
    ticker: "CRWD",
    title: "Cybersecurity names trade mixed as cloud workloads expand",
    source: "Yahoo Finance",
    category: "Cybersecurity",
    date: "2026-05-18",
    time: "11:10",
    impact: 81,
    sentiment: "Neutral",
    summaryTh: "ความต้องการ cybersecurity ยังแข็งแรง แต่ valuation ทำให้หุ้นผันผวน ข่าวดีต้องยืนยันด้วยรายได้ recurring และ net retention",
    url: "https://finance.yahoo.com/",
    saved: false
  },
  {
    id: "n8",
    ticker: "BTCTHB",
    title: "Bitcoin holds range as traders watch dollar and liquidity",
    source: "CoinDesk",
    category: "Crypto",
    date: "2026-05-18",
    time: "11:42",
    impact: 58,
    sentiment: "Neutral",
    summaryTh: "ราคา Bitcoin ยังแกว่งในกรอบ นักลงทุนฝั่งเงินบาทควรดู USD/THB และสภาพคล่องตลาดคริปโตควบคู่กับแนวรับหลัก",
    url: "https://www.coindesk.com/",
    saved: false
  }
];

const today = new Date().toISOString().slice(0, 10);

export const generatedNews: NewsArticle[] = stockUniverse.map((stock, index) => {
  const sentiment = (index % 6 === 0 ? "Bearish" : index % 4 === 0 ? "Neutral" : "Bullish") as NewsArticle["sentiment"];
  return {
    id: `auto-${stock.ticker}`,
    ticker: stock.ticker,
    title: `${stock.name} market update: price action, volume, and sector rotation`,
    source: index % 3 === 0 ? "Yahoo Finance" : index % 3 === 1 ? "MarketWatch" : "Reuters",
    category: stock.sector,
    date: today,
    time: `${String(8 + (index % 10)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`,
    impact: 48 + (index % 48),
    sentiment,
    summaryTh: `${stock.ticker} อยู่ในกลุ่ม ${stock.sector} ข่าวนี้เหมาะสำหรับติดตามราคา volume sentiment และแนวรับแนวต้านก่อนตัดสินใจ`,
    url: "https://finance.yahoo.com/",
    saved: false
  };
});

export const portfolio: PortfolioHolding[] = [
  { ticker: "NVDA", quantity: 18, buyPrice: 101.4, currentPrice: 145.28, sector: "Semiconductor", currency: "USD", targetPrice: 175, stopLoss: 126 },
  { ticker: "RKLB", quantity: 420, buyPrice: 11.2, currentPrice: 24.18, sector: "Space", currency: "USD", targetPrice: 32, stopLoss: 19 },
  { ticker: "AMD", quantity: 28, buyPrice: 132.8, currentPrice: 168.35, sector: "Semiconductor", currency: "USD", targetPrice: 198, stopLoss: 144 },
  { ticker: "NBIS", quantity: 40, buyPrice: 170, currentPrice: 224, sector: "AI Cloud", currency: "USD", targetPrice: 260, stopLoss: 198 }
];

export const candles: Candle[] = generateCandles("NVDA", 120);

export const heatmap = watchlist.map((quote, index) => ({
  ticker: quote.ticker,
  sector: quote.sector,
  change: quote.changePercent,
  size: 8 + (index % 24)
}));

export const economicEvents = [
  { event: "US CPI", date: "May 21, 2026", impact: "High", forecast: "3.1%" },
  { event: "FOMC Minutes", date: "May 22, 2026", impact: "High", forecast: "Rate path" },
  { event: "NVDA Earnings", date: "May 28, 2026", impact: "High", forecast: "$5.61 EPS" },
  { event: "AI Cloud Earnings", date: "May 30, 2026", impact: "Medium", forecast: "NBIS/CRWV demand" },
  { event: "US Non-farm Payroll", date: "June 5, 2026", impact: "High", forecast: "185K" },
  { event: "Semiconductor Guidance", date: "June 10, 2026", impact: "Medium", forecast: "NVDA/AMD/MU/QCOM" }
];
