import { NextRequest, NextResponse } from "next/server";
import { generatedNews, news } from "@/lib/mock-data";
import { stockUniverse } from "@/lib/market-utils";

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").trim();
}

async function fetchYahooNews(tickers: string[]) {
  const symbols = tickers.slice(0, 12).join(",");
  if (!symbols) return [];
  const response = await fetch(`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbols)}&region=US&lang=en-US`, {
    headers: { "User-Agent": "Mozilla/5.0" },
    cache: "no-store"
  });
  if (!response.ok) return [];
  const xml = await response.text();
  return Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g)).slice(0, 40).map((match, index) => {
    const block = match[1];
    const title = stripTags(block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([\s\S]*?)<\/title>/)?.[1] ?? block.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "Market headline");
    const link = stripTags(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "https://finance.yahoo.com/");
    const pubDate = new Date(stripTags(block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? new Date().toISOString()));
    const ticker = tickers[index % tickers.length] ?? "NVDA";
    const meta = stockUniverse.find((stock) => stock.ticker === ticker);
    const category = meta?.ticker.endsWith(".BK") ? "Thai Stocks" : meta?.sector.includes("Crypto") ? "Crypto" : meta?.sector.includes("Space") ? "Space" : meta?.sector.includes("Semi") ? "Semiconductor" : meta?.sector.includes("Energy") ? "Energy" : "US Stocks";
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
      summaryTh: `ข่าวล่าสุดของ ${ticker}: ระบบจัดหมวดหมู่และประเมิน sentiment อัตโนมัติ ควรดูร่วมกับราคา realtime, volume และแนวโน้ม sector ก่อนตัดสินใจ`,
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
  const requestedTickers = ticker ? [ticker.toUpperCase()] : stockUniverse.slice(0, 40).map((stock) => stock.ticker);

  const liveItems = refresh ? await fetchYahooNews(requestedTickers).catch(() => []) : [];

  const filtered = [...liveItems, ...news, ...generatedNews].filter((article) => {
    if (ticker && article.ticker !== ticker.toUpperCase()) return false;
    if (category && article.category !== category) return false;
    if (date && article.date !== date) return false;
    if (query && !`${article.title} ${article.summaryTh}`.toLowerCase().includes(query)) return false;
    return true;
  });

  return NextResponse.json({
    items: filtered.slice(0, 140),
    provider: liveItems.length ? "yahoo-rss+mock" : "mock",
    dates: Array.from(new Set([...liveItems, ...news, ...generatedNews].map((article) => article.date))).sort().reverse(),
    categories: ["AI", "Space", "Semiconductor", "Energy", "Crypto", "Thai Stocks", "US Stocks"]
  });
}
