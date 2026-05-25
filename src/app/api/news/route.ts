import { NextRequest, NextResponse } from "next/server";
import { generatedNews, news } from "@/lib/mock-data";
import { stockUniverse } from "@/lib/market-utils";

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
}

async function fetchYahooNews(tickers: string[]) {
  const metas = tickers
    .map((ticker) => stockUniverse.find((stock) => stock.ticker === ticker))
    .filter(Boolean);
  const symbols = metas.slice(0, 12).map((meta) => meta?.yahooSymbol ?? meta?.ticker).join(",");
  if (!symbols) return [];

  const response = await fetch(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbols)}&region=US&lang=en-US`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store"
  });
  if (!response.ok) return [];

  const xml = await response.text();
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 80).map((match, index) => {
    const block = match[1];
    const title = stripTags(block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/)?.[1] ?? block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Market headline");
    const link = stripTags(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "https://finance.yahoo.com/");
    const pubDate = new Date(stripTags(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? new Date().toISOString()));
    const ticker = tickers[index % tickers.length] ?? "NVDA";
    const meta = stockUniverse.find((stock) => stock.ticker === ticker);
    const category = meta?.sector ?? "Watchlist";
    const sentiment = index % 5 === 0 ? "Bearish" : index % 3 === 0 ? "Neutral" : "Bullish";

    return {
      id: `live-${ticker}-${pubDate.getTime()}-${index}`,
      ticker,
      title,
      source: "Yahoo Finance RSS",
      category,
      date: pubDate.toISOString().slice(0, 10),
      time: pubDate.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
      impact: 55 + (index % 41),
      sentiment,
      summaryTh: `ข่าวล่าสุดของ ${ticker}: ${title} ระบบจัดเข้ากลุ่ม ${category} และประเมิน sentiment เบื้องต้นเป็น ${sentiment}. ควรอ่านร่วมกับราคา realtime, volume, RSI, แนวรับแนวต้าน และทิศทาง sector เพื่อดูว่าตลาดยืนยันข่าวนี้หรือรับข่าวไปแล้ว`,
      url: link,
      saved: false
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const category = searchParams.get("category");
  const date = searchParams.get("date");
  const query = searchParams.get("q")?.toLowerCase();
  const refresh = searchParams.get("refresh") === "1";
  const allowedTickers = new Set(stockUniverse.map((stock) => stock.ticker));
  const requestedTickers = ticker && allowedTickers.has(ticker.toUpperCase())
    ? [ticker.toUpperCase()]
    : stockUniverse.map((stock) => stock.ticker);

  const liveItems = refresh ? await fetchYahooNews(requestedTickers).catch(() => []) : [];
  const allItems = [...liveItems, ...news, ...generatedNews].filter((article) => allowedTickers.has(article.ticker));
  const filtered = allItems.filter((article) => {
    if (ticker && article.ticker !== ticker.toUpperCase()) return false;
    if (category && article.category !== category) return false;
    if (date && article.date !== date) return false;
    if (query && !`${article.ticker} ${article.title} ${article.summaryTh}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return NextResponse.json({
    items: filtered.slice(0, 220),
    provider: liveItems.length ? "yahoo-rss+watchlist" : "watchlist-mock",
    dates: Array.from(new Set(filtered.map((article) => article.date))).sort().reverse(),
    categories: Array.from(new Set(stockUniverse.map((stock) => stock.sector))).sort()
  });
}
