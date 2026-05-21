import { NextRequest, NextResponse } from "next/server";
import { generatedNews, news, watchlist } from "@/lib/mock-data";
import { stockUniverse } from "@/lib/market-utils";

const defaultLineChannelId = "2010161500";

function getLineConfig() {
  const channelId = process.env.LINE_CHANNEL_ID || defaultLineChannelId;
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TO;
  const missing = [
    !token ? "LINE_CHANNEL_ACCESS_TOKEN" : null,
    !to ? "LINE_TO" : null
  ].filter(Boolean);

  return {
    channelId,
    token,
    to,
    canPush: missing.length === 0,
    missing
  };
}

function buildThaiNewsSummary(ticker: string, sector: string, sentiment: string) {
  const tone =
    sentiment === "Bullish"
      ? "แรงซื้อเด่น"
      : sentiment === "Bearish"
        ? "แรงขาย/ความเสี่ยงยังต้องระวัง"
        : "ภาพรวมยังแกว่งตัว";

  const summaries: Record<string, string> = {
    NVDA: "ดีมานด์ AI และ data center ยังเป็นตัวขับเคลื่อนหลัก จับตา margin, guidance และคำสั่งซื้อชิปรอบใหม่",
    RKLB: "ธุรกิจ launch และ space systems ยังโตต่อ แต่ความผันผวนสูง ควรดู backlog กับ cash burn ควบคู่กัน",
    NBIS: "ธีม AI cloud ยังหนุนราคา นักลงทุนมองหาโครงสร้างพื้นฐาน AI นอกกลุ่ม megacap",
    INTU: "ตลาดกังวล valuation และการเติบโตของซอฟต์แวร์ภาษี/บัญชี ควรรอฐานราคานิ่งก่อนเพิ่มน้ำหนัก",
    AMD: "ยังอยู่ในธีม AI chip แต่การแข่งขันสูง ต้องติดตาม order visibility และแนวรับสำคัญ",
    TSLA: "แรงกดดัน margin จากราคา EV ยังเป็นประเด็นหลัก จับตา delivery และ gross margin รอบถัดไป",
    CRWD: "ความต้องการ cybersecurity ยังแข็งแรง แต่ valuation ทำให้ราคาผันผวน ข่าวดีควรยืนยันด้วย recurring revenue",
    BTCTHB: "Bitcoin ยังแกว่งตามสภาพคล่องและค่าเงิน USD/THB ควรดูแนวรับหลักก่อนเพิ่มความเสี่ยง"
  };

  return summaries[ticker] ?? `${ticker} อยู่ในกลุ่ม ${sector}: ${tone} ควรติดตามราคา, volume, RSI, แนวรับ และแนวต้านก่อนตัดสินใจ`;
}

function buildLineSummary(ticker?: string) {
  const allowedTickers = new Set(stockUniverse.map((stock) => stock.ticker));
  const articles = [...news, ...generatedNews]
    .filter((article) => allowedTickers.has(article.ticker))
    .filter((article) => !ticker || article.ticker === ticker)
    .slice(0, ticker ? 5 : 10);

  const headlineRows = articles.map((article, index) => {
    const quote = watchlist.find((item) => item.ticker === article.ticker);
    const move = quote ? `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "-";
    return `${index + 1}. ${article.ticker} (${move})\n${buildThaiNewsSummary(article.ticker, article.category, article.sentiment)}`;
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
  const config = getLineConfig();

  if (!config.canPush || !config.token || !config.to) {
    return {
      ok: false,
      status: 400,
      channelId: config.channelId,
      missing: config.missing,
      message: `เชื่อม Messaging API id ${config.channelId} แล้ว แต่ยังต้องตั้งค่า ${config.missing.join(" และ ")} ก่อนส่งจริง`
    };
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      to: config.to,
      messages: [{ type: "text", text: text.slice(0, 4900) }]
    })
  });

  return {
    ok: response.ok,
    status: response.status,
    channelId: config.channelId,
    message: response.ok ? "ส่งสรุปข่าวเข้า LINE แล้ว" : await response.text()
  };
}

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get("ticker")?.toUpperCase();
  const config = getLineConfig();
  return NextResponse.json({
    line: {
      channelId: config.channelId,
      canPush: config.canPush,
      missing: config.missing
    },
    preview: buildLineSummary(ticker)
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { ticker?: string };
  const text = buildLineSummary(body.ticker?.toUpperCase());
  const result = await pushLineMessage(text);
  return NextResponse.json({ ...result, preview: text }, { status: result.ok ? 200 : result.status });
}
