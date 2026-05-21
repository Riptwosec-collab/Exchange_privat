import { NextRequest, NextResponse } from "next/server";
import { generatedNews, news, watchlist } from "@/lib/mock-data";
import { stockUniverse } from "@/lib/market-utils";

function buildLineSummary(ticker?: string) {
  const allowedTickers = new Set(stockUniverse.map((stock) => stock.ticker));
  const articles = [...news, ...generatedNews]
    .filter((article) => allowedTickers.has(article.ticker))
    .filter((article) => !ticker || article.ticker === ticker)
    .slice(0, ticker ? 5 : 10);

  const headlineRows = articles.map((article, index) => {
    const quote = watchlist.find((item) => item.ticker === article.ticker);
    const move = quote ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "-";
    return `${index + 1}. ${article.ticker} (${move})\n${article.summaryTh}`;
  });

  return [
    "สรุปข่าวหุ้นวันนี้",
    ticker ? `โฟกัส: ${ticker}` : `ครอบคลุม ${stockUniverse.length} symbols ใน watchlist`,
    "",
    ...headlineRows,
    "",
    "หมายเหตุ: ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล"
  ].join("\n");
}

async function pushLineMessage(text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO;

  if (!token || !to) {
    return {
      ok: false,
      status: 400,
      message: "กรุณาตั้งค่า LINE_CHANNEL_ACCESS_TOKEN และ LINE_TO ก่อนส่งจริง"
    };
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text: text.slice(0, 4900) }]
    })
  });

  return {
    ok: response.ok,
    status: response.status,
    message: response.ok ? "ส่งสรุปข่าวเข้า LINE แล้ว" : await response.text()
  };
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker")?.toUpperCase();
  return NextResponse.json({ preview: buildLineSummary(ticker) });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { ticker?: string };
  const text = buildLineSummary(body.ticker?.toUpperCase());
  const result = await pushLineMessage(text);
  return NextResponse.json({ ...result, preview: text }, { status: result.ok ? 200 : result.status });
}
