import { NextRequest, NextResponse } from "next/server";
import { news } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get("ticker");
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.toLowerCase();
  const filtered = news.filter((article) => {
    if (ticker && article.ticker !== ticker.toUpperCase()) return false;
    if (category && article.category !== category) return false;
    if (query && !`${article.title} ${article.summaryTh}`.toLowerCase().includes(query)) return false;
    return true;
  });
  return NextResponse.json({ items: filtered, categories: ["AI", "Space", "Semiconductor", "Energy", "Crypto", "Thai Stocks", "US Stocks"] });
}
