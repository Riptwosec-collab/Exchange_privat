"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { BarChart3, Bell, Bookmark, CalendarDays, ExternalLink, LineChart, RefreshCw, Save, Search, Settings, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { economicEvents, generatedNews, news, watchlist } from "@/lib/mock-data";
import { allStockSymbols, stockUniverse } from "@/lib/market-utils";
import type { NewsArticle } from "@/lib/types";
import { useMarketStore, type AppTheme } from "@/store/market-store";
import { StockLogo } from "./stock-logo";
import { Metric, Panel, StatusPill } from "./ui";

const categories = ["All", ...Array.from(new Set(stockUniverse.map((stock) => stock.sector)))];
const calendarEventNote = "วิธีดู: event impact สูงมักทำให้ดัชนี, bond yield, USD และหุ้น growth ผันผวน ควรเช็ก position size และ stop loss ก่อนประกาศ";
const calendarGuide = {
  cpi: "กระทบ valuation และดอกเบี้ย",
  earnings: "ดู revenue, EPS, guidance และ margin",
  gdp: "บอกภาพเศรษฐกิจและ risk-on/risk-off"
};
const settingsOptions = {
  theme: ["Technology", "Space", "Luxury", "Obsidian", "Pearl"],
  currency: ["USD", "THB"],
  language: ["TH", "EN"],
  refresh: ["5s", "15s", "30s"],
  density: ["Compact", "Comfortable"],
  risk: ["Balanced", "Aggressive"]
};

const themeSwatches: Record<AppTheme, string[]> = {
  Technology: ["#12080a", "#ef4444", "#f6c177", "#94a3b8"],
  Space: ["#05051a", "#22d3ee", "#a78bfa", "#fbbf24"],
  Luxury: ["#120b05", "#d6a84f", "#7f1d1d", "#fff2c6"],
  Obsidian: ["#000000", "#f59e0b", "#fef3c7", "#92400e"],
  Pearl: ["#ead9bd", "#a86212", "#0f6b50", "#c6782f"]
};

const settingsAlertThemeStyles: Record<AppTheme, {
  enabled: CSSProperties;
  disabled: CSSProperties;
  iconEnabled: CSSProperties;
  iconDisabled: CSSProperties;
  title: CSSProperties;
  statusEnabled: CSSProperties;
  statusDisabled: CSSProperties;
}> = {
  Technology: {
    enabled: { background: "linear-gradient(135deg, rgba(239,68,68,.24), rgba(246,193,119,.10)), #2b1218", borderColor: "rgba(239,68,68,.5)", boxShadow: "0 14px 34px rgba(239,68,68,.17)" },
    disabled: { background: "linear-gradient(135deg, rgba(251,113,133,.13), rgba(239,68,68,.05)), #1d0d11", borderColor: "rgba(251,113,133,.28)" },
    iconEnabled: { color: "#fecdd3" },
    iconDisabled: { color: "#ffe4e9" },
    title: { color: "#fff1f2" },
    statusEnabled: { color: "#f6c177" },
    statusDisabled: { color: "#ffe4e9" }
  },
  Space: {
    enabled: { background: "linear-gradient(135deg, rgba(34,211,238,.17), rgba(167,139,250,.12)), #151b45", borderColor: "rgba(34,211,238,.42)", boxShadow: "0 14px 36px rgba(34,211,238,.13)" },
    disabled: { background: "linear-gradient(135deg, rgba(251,113,133,.10), rgba(251,191,36,.06)), #0b102d", borderColor: "rgba(251,191,36,.24)" },
    iconEnabled: { color: "#cffafe" },
    iconDisabled: { color: "#fbbf24" },
    title: { color: "#eef2ff" },
    statusEnabled: { color: "#ddd6fe" },
    statusDisabled: { color: "#fbbf24" }
  },
  Luxury: {
    enabled: { background: "linear-gradient(135deg, rgba(214,168,79,.18), rgba(127,29,29,.12)), #27190d", borderColor: "rgba(214,168,79,.44)", boxShadow: "0 16px 36px rgba(214,168,79,.12)" },
    disabled: { background: "linear-gradient(135deg, rgba(127,29,29,.16), rgba(214,168,79,.05)), #1e140b", borderColor: "rgba(127,29,29,.34)" },
    iconEnabled: { color: "#fff2c6" },
    iconDisabled: { color: "#fca5a5" },
    title: { color: "#fff7df" },
    statusEnabled: { color: "#fff2c6" },
    statusDisabled: { color: "#fca5a5" }
  },
  Obsidian: {
    enabled: { background: "linear-gradient(135deg, rgba(245,158,11,.20), rgba(254,243,199,.08)), #15110a", borderColor: "rgba(245,158,11,.46)", boxShadow: "0 16px 40px rgba(245,158,11,.14)" },
    disabled: { background: "linear-gradient(135deg, rgba(220,38,38,.12), rgba(245,158,11,.05)), #080706", borderColor: "rgba(220,38,38,.26)" },
    iconEnabled: { color: "#fde68a" },
    iconDisabled: { color: "#fecaca" },
    title: { color: "#fff7df" },
    statusEnabled: { color: "#fef3c7" },
    statusDisabled: { color: "#fecaca" }
  },
  Pearl: {
    enabled: { background: "linear-gradient(135deg, rgba(15,107,80,.10), rgba(168,98,18,.07)), #ead9bd", borderColor: "rgba(15,107,80,.28)", boxShadow: "0 14px 32px rgba(93,72,45,.14)" },
    disabled: { background: "linear-gradient(135deg, rgba(161,18,53,.07), rgba(93,72,45,.06)), #ead8b8", borderColor: "rgba(161,18,53,.18)" },
    iconEnabled: { color: "#0f6b50" },
    iconDisabled: { color: "#a11235" },
    title: { color: "#1f2933" },
    statusEnabled: { color: "#064937" },
    statusDisabled: { color: "#741027" }
  }
};

function sentimentThai(sentiment: NewsArticle["sentiment"]) {
  if (sentiment === "Bullish") return "บวก";
  if (sentiment === "Bearish") return "ลบ";
  return "กลาง";
}

function sourceCredibility(source: string) {
  const normalized = source.toLowerCase();
  if (normalized.includes("reuters") || normalized.includes("bloomberg")) return 94;
  if (normalized.includes("cnbc") || normalized.includes("marketwatch")) return 86;
  if (normalized.includes("yahoo")) return 82;
  if (normalized.includes("coindesk") || normalized.includes("spacenews")) return 78;
  return 72;
}

function formatCompactNews(value: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function sentimentScore(sentiment: NewsArticle["sentiment"]) {
  if (sentiment === "Bullish") return 1;
  if (sentiment === "Bearish") return -1;
  return 0;
}

function buildTickerResearch(quote: (typeof watchlist)[number] | undefined) {
  if (!quote) {
    return {
      revenue: "-",
      growth: "-",
      marketShare: "-",
      analystRating: "Neutral",
      priceTarget: "-",
      targetUpside: "-",
      technical: "รอข้อมูลราคา",
      competitive: "รอข้อมูล peer",
      thesis: "ยังไม่มี ticker context เพียงพอสำหรับ investment thesis",
      riskScore: 50
    };
  }
  const target = quote.price * (1 + Math.max(-0.08, Math.min(0.28, quote.breakoutScore / 360 + quote.revenueGrowth / 1000)));
  const upside = ((target - quote.price) / quote.price) * 100;
  const rating = quote.breakoutScore >= 72 && quote.momentumScore >= 65 ? "Outperform" : quote.breakoutScore <= 35 ? "Underperform" : "Market Perform";
  return {
    revenue: quote.marketCap.includes("T") ? "$90B+" : quote.marketCap.includes("B") ? "$10B-$90B" : "กำลังเติบโต",
    growth: `${quote.revenueGrowth >= 0 ? "+" : ""}${quote.revenueGrowth.toFixed(1)}%`,
    marketShare: quote.isAiStock ? "ผู้นำ/ผู้ท้าชิงใน AI supply chain" : `แข่งขันในกลุ่ม ${quote.sector}`,
    analystRating: rating,
    priceTarget: `$${target.toFixed(2)}`,
    targetUpside: `${upside >= 0 ? "+" : ""}${upside.toFixed(1)}%`,
    technical: `RSI ${quote.rsi}, Breakout ${quote.breakoutScore}/100, Momentum ${quote.momentumScore}/100`,
    competitive: quote.isAiStock ? "เทียบกับ mega-cap AI, semiconductor และ AI cloud peers" : "ต้องเทียบ relative strength กับ peer ใน sector เดียวกัน",
    thesis: quote.isAiStock
      ? "Investment thesis: รายได้และ margin ยังผูกกับ AI capex cycle หากข่าวยืนยัน demand และราคาไม่หลุดแนวรับ thesis ฝั่ง Bullish ยังมีน้ำหนัก"
      : "Investment thesis: ต้องเห็น revenue growth, valuation support และ sector rotation หนุนพร้อมกันก่อนเพิ่มน้ำหนัก",
    riskScore: Math.max(12, Math.min(92, Math.round(quote.rsi * 0.45 + Math.abs(quote.changePercent) * 7 + (quote.peRatio ?? 25) * 0.35)))
  };
}

function buildNewsInsight(article: NewsArticle) {
  const quote = watchlist.find((item) => item.ticker === article.ticker);
  const rsi = quote?.rsi ?? 50;
  const priceText = quote ? `$${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%)` : "-";
  const rsiText = rsi >= 70 ? "RSI อยู่โซนร้อน ต้องระวังแรงขายทำกำไร" : rsi <= 30 ? "RSI อยู่โซนอ่อน มีโอกาสรีบาวด์ถ้าข่าวหนุน" : "RSI ยังอยู่กลางกรอบ ใช้ราคาและวอลุ่มยืนยัน";
  const impactText = article.impact >= 80 ? "ผลกระทบสูง ควรติดตามทันที" : article.impact >= 60 ? "ผลกระทบปานกลางถึงสูง มีผลต่อ sentiment ระยะสั้น" : "ผลกระทบปานกลาง ใช้เป็นบริบทประกอบ";
  const sentimentText = sentimentThai(article.sentiment);
  const sector = quote?.sector ?? article.category;

  return {
    priceText,
    fullSummary: `${article.summaryTh} ภาพรวมเพิ่มเติม: ข่าวนี้ควรอ่านร่วมกับราคา ${priceText}, วอลุ่มล่าสุด, RSI และทิศทาง sector เพราะตลาดมักตอบสนองแรงเมื่อข่าวตรงกับ momentum เดิมของหุ้น หากราคาไปทางเดียวกับ sentiment และมีวอลุ่มเพิ่มขึ้น จะเพิ่มน้ำหนักให้สัญญาณ แต่ถ้าราคาไม่ตอบสนองหรือกลับทิศ ต้องถือว่าเป็นสัญญาณเตือนว่าตลาดอาจรับข่าวไปแล้ว`,
    points: [
      `ประเด็นหลัก: ${article.title}`,
      `Ticker / Sector: ${article.ticker} / ${sector}`,
      `Sentiment: ${article.sentiment} (${sentimentText})`,
      `Impact: ${impactText}`
    ],
    checklist: [
      `เช็กราคา: ${priceText}`,
      `เช็ก RSI: ${rsi} - ${rsiText}`,
      "ดู Volume ว่าสูงกว่าค่าเฉลี่ยหรือไม่",
      "เทียบข่าวกับแนวรับ/แนวต้านในหน้า Charts"
    ],
    risk: article.sentiment === "Bearish"
      ? "ความเสี่ยงหลักคือแรงขายต่อเนื่อง หากหลุดแนวรับหรือวอลุ่มขายเพิ่ม ไม่ควรรีบถัวเฉลี่ย"
      : article.sentiment === "Bullish"
        ? "ความเสี่ยงหลักคือราคาอาจสะท้อนข่าวบวกไปแล้ว ควรรอจังหวะย่อหรือ breakout ที่มีวอลุ่มยืนยัน"
        : "ความเสี่ยงหลักคือข่าวยังไม่ชี้ทิศทางชัด ต้องรอราคาและ sector confirmation",
    action: article.impact >= 75 ? "Action: เพิ่มเข้ารายการเฝ้าดูวันนี้ และตั้ง alert ที่แนวรับ/แนวต้าน" : "Action: เก็บเป็นบริบท และรอข้อมูลราคา/วอลุ่มยืนยัน"
  };
}

function buildExpandedNewsInsight(article: NewsArticle) {
  const quote = watchlist.find((item) => item.ticker === article.ticker);
  const sector = quote?.sector ?? article.category;
  const sentimentTh = article.sentiment === "Bullish" ? "บวก" : article.sentiment === "Bearish" ? "ลบ" : "กลาง";
  const price = quote ? `$${quote.price.toFixed(2)}` : "-";
  const change = quote ? `${quote.change >= 0 ? "+" : ""}${quote.change.toFixed(2)} USD / ${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%` : "-";
  const rsi = quote?.rsi ?? 50;
  const rsiMeaning = rsi >= 70 ? "RSI อยู่โซนร้อน อาจมีแรงขายทำกำไรหากข่าวไม่แรงพอ" : rsi <= 30 ? "RSI อยู่โซนอ่อน มีโอกาสรีบาวด์ถ้าข่าวหนุนและวอลุ่มกลับมา" : "RSI อยู่กลางกรอบ ต้องรอสัญญาณจากราคาและวอลุ่ม";
  const pe = quote?.peRatio === null || quote?.peRatio === undefined ? "-" : `${quote.peRatio.toFixed(1)}x`;
  const growth = quote ? `${quote.revenueGrowth >= 0 ? "+" : ""}${quote.revenueGrowth.toFixed(1)}%` : "-";
  const impactMeaning = article.impact >= 80 ? "ข่าวระดับสำคัญสูง มีโอกาสกระทบราคาและ sentiment ระยะสั้นทันที" : article.impact >= 60 ? "ข่าวสำคัญปานกลางถึงสูง ควรใช้ประกอบการดู momentum" : "ข่าวเป็นบริบทประกอบ ยังต้องรอราคาและวอลุ่มยืนยัน";
  const confirmation = article.sentiment === "Bullish"
    ? "ถ้าราคายืนเหนือแนวต้านพร้อมวอลุ่มสูงกว่าค่าเฉลี่ย ข่าวนี้จะมีน้ำหนักเชิงบวกมากขึ้น"
    : article.sentiment === "Bearish"
      ? "ถ้าราคาหลุดแนวรับพร้อมวอลุ่มขายสูง ข่าวนี้จะเพิ่มความเสี่ยงขาลง"
      : "ถ้าราคาแกว่งในกรอบ ให้รอ breakout หรือ breakdown ก่อนเพิ่มน้ำหนักการตัดสินใจ";

  const summaryParagraphs = [
    `สรุปหลัก: ${article.title} เป็นข่าวของ ${article.ticker} ในกลุ่ม ${sector}. ระบบจัด sentiment เป็น ${article.sentiment} (${sentimentTh}) และให้ impact ${article.impact}/100 หมายความว่า ${impactMeaning}.`,
    `ภาพราคาและเทคนิค: ราคาปัจจุบัน ${price}, เปลี่ยนแปลง ${change}, RSI ${rsi}. ${rsiMeaning}. ควรดูร่วมกับ Volume, RVOL, MACD และแนวรับ/แนวต้านในหน้า Charts เพื่อดูว่าตลาดยืนยันข่าวนี้จริงหรือไม่`,
    `ภาพพื้นฐาน: Market Cap ${quote?.marketCap ?? "-"}, P/E ${pe}, Revenue Growth ${growth}, Dividend ${quote?.dividendYield?.toFixed(2) ?? "-"}%. สำหรับหุ้นในกลุ่ม ${sector} ตลาดจะให้น้ำหนักกับ guidance, margin, demand visibility, backlog/order book และความสามารถในการรักษา growth มากกว่าพาดหัวข่าวเพียงอย่างเดียว`,
    `มุมมองใช้งานจริง: ${confirmation}. ถ้าราคาไม่ตอบสนองตาม sentiment หรือกลับทิศเร็ว ให้ถือว่าอาจเป็น sell-the-news / buy-the-dip แล้วลดความมั่นใจของสัญญาณลง`
  ];

  return {
    summaryParagraphs,
    fullSummary: summaryParagraphs.join(" "),
    points: [
      `ประเด็นหลัก: ${article.title}`,
      `Ticker / Sector: ${article.ticker} / ${sector}`,
      `Sentiment: ${article.sentiment} (${sentimentTh})`,
      `Impact: ${article.impact}/100 - ${impactMeaning}`,
      `ราคา: ${price} (${change})`,
      `RSI: ${rsi} - ${rsiMeaning}`
    ],
    checklist: [
      "เช็กว่า volume สูงกว่าค่าเฉลี่ยหรือไม่",
      "ดู MACD ว่า momentum สนับสนุนข่าวหรือเริ่มอ่อนแรง",
      "เทียบราคากับแนวรับ/แนวต้านใน Advanced Chart",
      "ดูหุ้น peer ใน sector เดียวกันว่าขยับไปทางเดียวกันหรือไม่",
      "ถ้าข่าว impact สูง ให้ตั้ง alert และรอ confirmation ก่อนเพิ่มน้ำหนัก"
    ],
    risk: article.sentiment === "Bearish"
      ? "ความเสี่ยงหลักคือแรงขายต่อเนื่องและ valuation ถูกปรับลง หากหลุดแนวรับพร้อมวอลุ่มขายสูง ไม่ควรรีบถัวเฉลี่ย"
      : article.sentiment === "Bullish"
        ? "ความเสี่ยงหลักคือราคาอาจสะท้อนข่าวบวกไปแล้ว หาก RSI สูงหรือวอลุ่มไม่ตาม อาจเกิดการย่อตัวหลังข่าว"
        : "ความเสี่ยงหลักคือข่าวยังไม่ชี้ทิศทางชัด ตลาดอาจแกว่งในกรอบจนกว่าจะมี catalyst ใหม่",
    action: article.impact >= 75
      ? "Action: เพิ่มเข้ารายการเฝ้าดูวันนี้ ตั้ง alert ที่แนวรับ/แนวต้าน และรอดูราคา+วอลุ่มยืนยัน"
      : "Action: เก็บเป็นบริบทประกอบ รอราคา/วอลุ่มยืนยัน และใช้ position size เล็กจนกว่าสัญญาณจะชัด"
  };
}

export function NewsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [ticker, setTicker] = useState("All");
  const [date, setDate] = useState("All");
  const [bookmarks, setBookmarks] = useState<string[]>(news.filter((item) => item.saved).map((item) => item.id));
  const [items, setItems] = useState<NewsArticle[]>([...news, ...generatedNews]);
  const [dates, setDates] = useState<string[]>(Array.from(new Set([...news, ...generatedNews].map((item) => item.date))).sort().reverse());
  const [provider, setProvider] = useState("watchlist-mock");
  const [lineStatus, setLineStatus] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [source, setSource] = useState("All");
  const [depth, setDepth] = useState<"สั้น" | "ละเอียด" | "ผู้เชี่ยวชาญ">("ผู้เชี่ยวชาญ");
  const [focus, setFocus] = useState("ทั้งหมด");
  const [compareTicker, setCompareTicker] = useState("NVDA");
  const [sentimentAlert, setSentimentAlert] = useState(true);

  async function refreshNews(forceLive = false) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category !== "All") params.set("category", category);
    if (ticker !== "All") params.set("ticker", ticker);
    if (date !== "All") params.set("date", date);
    if (forceLive) params.set("refresh", "1");
    const response = await fetch(`/api/news?${params.toString()}`, { cache: "no-store" });
    const data = (await response.json()) as { items: NewsArticle[]; dates: string[]; provider: string };
    setItems(data.items?.length ? data.items : [...news, ...generatedNews]);
    setDates(data.dates?.length ? data.dates : dates);
    setProvider(data.provider ?? "watchlist-mock");
  }

  async function sendLineSummary() {
    setLineStatus("กำลังส่งเข้า LINE...");
    const response = await fetch("/api/line-news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: ticker === "All" ? undefined : ticker })
    });
    const data = (await response.json()) as { message?: string };
    setLineStatus(data.message ?? (response.ok ? "ส่งเข้า LINE แล้ว" : "ส่ง LINE ไม่สำเร็จ"));
  }

  useEffect(() => {
    refreshNews(false).catch(() => undefined);
  }, [category, ticker, date]);

  const filtered = items.filter((article) => {
    const search = `${article.ticker} ${article.title} ${article.source} ${article.summaryTh}`.toLowerCase();
    if (!search.includes(query.toLowerCase())) return false;
    if (source !== "All" && article.source !== source) return false;
    return true;
  });
  const highImpact = filtered.filter((article) => article.impact >= 75);
  const bullishCount = filtered.filter((article) => article.sentiment === "Bullish").length;
  const bearishCount = filtered.filter((article) => article.sentiment === "Bearish").length;
  const neutralCount = filtered.filter((article) => article.sentiment === "Neutral").length;
  const sources = useMemo(() => ["All", ...Array.from(new Set(items.map((article) => article.source))).sort()], [items]);
  const selectedQuote = watchlist.find((item) => item.ticker === (ticker === "All" ? (filtered[0]?.ticker ?? "NVDA") : ticker));
  const compareQuote = watchlist.find((item) => item.ticker === compareTicker) ?? watchlist[0];
  const research = buildTickerResearch(selectedQuote);
  const sourceQuality = filtered.length ? Math.round(filtered.reduce((sum, article) => sum + sourceCredibility(article.source), 0) / filtered.length) : 0;
  const newsVolumeTrend = useMemo(() => {
    const rows = Array.from(filtered.reduce((acc, article) => acc.set(article.date, (acc.get(article.date) ?? 0) + 1), new Map<string, number>()));
    return rows.sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  }, [filtered]);
  const sentimentTrend = useMemo(() => {
    const rows = Array.from(filtered.reduce((acc, article) => acc.set(article.date, (acc.get(article.date) ?? 0) + sentimentScore(article.sentiment)), new Map<string, number>()));
    return rows.sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  }, [filtered]);
  const sectorComparison = useMemo(() => {
    return Array.from(
      filtered.reduce((acc, article) => {
        const row = acc.get(article.category) ?? { count: 0, score: 0 };
        row.count += 1;
        row.score += sentimentScore(article.sentiment);
        acc.set(article.category, row);
        return acc;
      }, new Map<string, { count: number; score: number }>())
    ).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
  }, [filtered]);
  const topTickers = Array.from(
    filtered.reduce((acc, article) => acc.set(article.ticker, (acc.get(article.ticker) ?? 0) + 1), new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
      <Panel className="overflow-hidden p-4 ring-1 ring-cyan-300/10">
        <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Realtime News Feed</p>
            <h2 className="mt-1 text-xl font-semibold text-white">ข่าวเฉพาะหุ้นใน Watchlist พร้อมสรุปไทย</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={sendLineSummary} className="flex items-center gap-2 rounded-md border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-medium text-emerald-100">
              <Bell size={15} />Send LINE
            </button>
            <button onClick={() => refreshNews(true)} className="flex items-center gap-2 rounded-md bg-cyan-300 px-3 py-2 text-sm font-medium text-slate-950">
              <RefreshCw size={15} />Refresh live
            </button>
          </div>
        </div>
        </div>
        {lineStatus ? <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-300">{lineStatus}</p> : null}
        <div className="mt-4 rounded-lg border border-cyan-300/15 bg-black/25 p-3">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 md:col-span-2">
            <Search size={16} className="text-slate-500" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="h-10 w-full bg-transparent text-sm text-slate-100 outline-none" placeholder="Search ticker, source, headline..." />
          </div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={ticker} onChange={(event) => setTicker(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {["All", ...allStockSymbols].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={date} onChange={(event) => setDate(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {["All", ...dates].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <select value={source} onChange={(event) => setSource(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {sources.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={depth} onChange={(event) => setDepth(event.target.value as typeof depth)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {["สั้น", "ละเอียด", "ผู้เชี่ยวชาญ"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={focus} onChange={(event) => setFocus(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {["ทั้งหมด", "พื้นฐาน", "เทคนิค", "ข่าว", "ความเสี่ยง", "Investment Thesis"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={compareTicker} onChange={(event) => setCompareTicker(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-sm text-slate-100 outline-none">
            {allStockSymbols.slice(0, 120).map((item) => <option key={item}>{item}</option>)}
          </select>
          <button onClick={() => setSentimentAlert((value) => !value)} className={`flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm ${sentimentAlert ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 text-slate-400"}`}>
            <Bell size={15} /> Alert Sentiment
          </button>
        </div>
        </div>
        <div className="mt-4 grid gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-3 xl:grid-cols-4">
          <div className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 p-3 ring-1 ring-cyan-300/10">
            <div className="flex items-center gap-2 text-cyan-100"><ShieldCheck size={16} /><span className="text-xs uppercase tracking-[0.14em]">Source Quality</span></div>
            <strong className="mt-2 block font-mono text-xl text-white">{sourceQuality}/100</strong>
            <p className="mt-1 text-xs text-cyan-50">คะแนนความน่าเชื่อถือเฉลี่ยของแหล่งข่าวที่กรองอยู่</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-black/30 p-3 ring-1 ring-white/[0.04]">
            <div className="flex items-center gap-2 text-slate-200"><BarChart3 size={16} /><span className="text-xs uppercase tracking-[0.14em]">Price / Volume</span></div>
            <strong className="mt-2 block font-mono text-xl text-white">{selectedQuote ? `$${selectedQuote.price.toFixed(2)}` : "-"}</strong>
            <p className="mt-1 text-xs text-slate-400">Volume {selectedQuote ? selectedQuote.volume : "-"} · Change {selectedQuote ? `${selectedQuote.changePercent.toFixed(2)}%` : "-"}</p>
          </div>
          <div className="rounded-lg border border-purple-300/25 bg-purple-300/10 p-3 ring-1 ring-purple-300/10">
            <div className="flex items-center gap-2 text-purple-100"><LineChart size={16} /><span className="text-xs uppercase tracking-[0.14em]">Analyst View</span></div>
            <strong className="mt-2 block text-white">{research.analystRating}</strong>
            <p className="mt-1 text-xs text-purple-50">Target {research.priceTarget} · Upside {research.targetUpside}</p>
          </div>
          <div className="rounded-lg border border-rose-300/25 bg-rose-300/10 p-3 ring-1 ring-rose-300/10">
            <div className="flex items-center gap-2 text-rose-100"><SlidersHorizontal size={16} /><span className="text-xs uppercase tracking-[0.14em]">Risk</span></div>
            <strong className="mt-2 block font-mono text-xl text-white">{research.riskScore}/100</strong>
            <p className="mt-1 text-xs text-rose-50">ประเมินจาก RSI, price move และ valuation proxy</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-lg border border-cyan-300/18 bg-black/30 p-3 ring-1 ring-white/[0.04]">
            <h3 className="text-sm font-semibold text-white">Fundamental / Competitive Deep Dive</h3>
            <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
              <span className="rounded border border-white/10 bg-white/[0.035] p-2 text-slate-300">Revenue <b className="block text-slate-100">{research.revenue}</b></span>
              <span className="rounded border border-white/10 bg-white/[0.035] p-2 text-slate-300">Growth <b className="block text-slate-100">{research.growth}</b></span>
              <span className="rounded border border-white/10 bg-white/[0.035] p-2 text-slate-300">Market Share <b className="block text-slate-100">{research.marketShare}</b></span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">{research.competitive}</p>
            <p className="mt-2 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm leading-6 text-cyan-50">{research.thesis}</p>
          </div>
          <div className="rounded-lg border border-purple-300/18 bg-black/30 p-3 ring-1 ring-white/[0.04]">
            <h3 className="text-sm font-semibold text-white">Technical / Peer Compare</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">{research.technical}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <span className="rounded border border-white/10 bg-white/[0.035] p-2 text-slate-300">Selected <b className="block text-white">{selectedQuote?.ticker ?? "-"} {selectedQuote?.changePercent.toFixed(2) ?? "-"}%</b></span>
              <span className="rounded border border-white/10 bg-white/[0.035] p-2 text-slate-300">Compare <b className="block text-white">{compareQuote.ticker} {compareQuote.changePercent.toFixed(2)}%</b></span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          <MiniTrendPanel title="Sentiment Evolution" rows={sentimentTrend} positiveLabel="Bullish" negativeLabel="Bearish" />
          <MiniTrendPanel title="News Volume Trend" rows={newsVolumeTrend} positiveLabel="Articles" negativeLabel="Low" />
          <div className="rounded-lg border border-white/15 bg-black/30 p-3 ring-1 ring-white/[0.04]">
            <h3 className="text-sm font-semibold text-white">Sector / Industry Comparison</h3>
            <div className="mt-3 space-y-2">
              {sectorComparison.map(([sectorName, row]) => (
                <div key={sectorName} className="flex items-center justify-between gap-3 text-xs">
                  <span className="truncate text-slate-400">{sectorName}</span>
                  <span className={row.score >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>{row.count} ข่าว · score {row.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.035] p-3">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-cyan-300/15 pb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">News Cards</p>
              <h3 className="mt-1 text-sm font-semibold text-white">ข่าวแต่ละรายการถูกแยกเป็นช่องชัดเจน พร้อมสรุปและ action</h3>
            </div>
            <span className="rounded-md border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-xs text-slate-300">{filtered.length} articles</span>
          </div>
        <div className="space-y-4">
          {filtered.slice(0, 100).map((article) => {
            const quote = watchlist.find((item) => item.ticker === article.ticker) ?? watchlist[0];
            const insight = buildExpandedNewsInsight(article);
            return (
              <article
                key={article.id}
                onClick={() => setSelectedArticle((current) => current?.id === article.id ? null : article)}
                className={`cursor-pointer overflow-hidden rounded-lg border bg-[#080b0f] shadow-[0_18px_42px_rgba(0,0,0,.28)] ring-1 ring-white/[0.05] transition hover:border-cyan-300/45 hover:bg-[#0b1118] hover:ring-cyan-300/20 ${selectedArticle?.id === article.id ? "border-cyan-300/55 ring-cyan-300/20" : "border-white/15"}`}
              >
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-black/35 px-4 py-3">
                  <StockLogo quote={quote} size="sm" />
                  <span className="font-mono text-sm font-semibold text-white">{article.ticker}</span>
                  <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
                  <StatusPill tone="info">{article.category}</StatusPill>
                  <span className="font-mono text-xs text-slate-500">{article.source} · {article.date} {article.time}</span>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setBookmarks((current) => current.includes(article.id) ? current.filter((id) => id !== article.id) : [...current, article.id]);
                    }}
                    title="Bookmark"
                    className="ml-auto text-slate-400 hover:text-cyan-200"
                  >
                    <Bookmark size={16} fill={bookmarks.includes(article.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-4">
                <h3 className="text-base font-semibold text-white">{article.title}</h3>
                <p className="mt-2 rounded-md border border-white/10 bg-white/[0.025] p-3 text-sm leading-6 text-slate-300">{insight.fullSummary}</p>
                <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                  {insight.points.slice(1).map((point) => (
                    <span key={point} className="rounded-md border border-white/12 bg-black/30 px-2.5 py-2 text-slate-400">{point}</span>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-50">
                  {insight.action}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} /></div>
                  <span className="font-mono text-xs text-slate-400">Impact {article.impact}</span>
                </div>
                {selectedArticle?.id === article.id ? (
                  <div className="mt-4 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.07] p-4 ring-1 ring-cyan-300/10">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Expanded Reader</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedArticle(null);
                        }}
                        className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-white/[0.06]"
                      >
                        Close
                      </button>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <div className="rounded-md border border-white/10 bg-black/20 p-3"><p className="text-xs text-slate-500">Impact</p><strong className="font-mono text-white">{article.impact}/100</strong></div>
                      <div className="rounded-md border border-white/10 bg-black/20 p-3"><p className="text-xs text-slate-500">Sentiment</p><strong className={article.sentiment === "Bullish" ? "text-emerald-300" : article.sentiment === "Bearish" ? "text-rose-300" : "text-slate-300"}>{article.sentiment}</strong></div>
                      <div className="rounded-md border border-white/10 bg-black/20 p-3"><p className="text-xs text-slate-500">Source</p><strong className="font-mono text-white">{article.source}</strong></div>
                    </div>
                    <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-3 text-sm leading-7 text-slate-300">
                      {insight.summaryParagraphs.map((paragraph) => <p key={paragraph} className="mb-2 last:mb-0">{paragraph}</p>)}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="rounded-md border border-rose-300/20 bg-rose-300/10 p-3 text-sm leading-6 text-rose-50"><b>Risk:</b> {insight.risk}</div>
                      <div className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-3 text-sm leading-6 text-emerald-50"><b>Action:</b> {insight.action}</div>
                    </div>
                    {article.url ? (
                      <a onClick={(event) => event.stopPropagation()} href={article.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/16">
                        <ExternalLink size={15} /> Open source
                      </a>
                    ) : null}
                  </div>
                ) : null}
                </div>
              </article>
            );
          })}
        </div>
        </div>
      </Panel>
      <Panel className="overflow-hidden p-0 ring-1 ring-purple-300/10">
        <div className="border-b border-purple-300/15 bg-purple-300/[0.04] p-4">
          <h3 className="font-semibold text-white">News Controls</h3>
        </div>
        <div className="p-4">
        <div className="space-y-3">
          <Metric label="Articles" value={`${filtered.length}`} delta="filtered" tone="neutral" />
          <Metric label="High impact" value={`${highImpact.length}`} delta="impact 75+" tone={highImpact.length ? "up" : "neutral"} />
          <Metric label="Bull / Bear" value={`${bullishCount}/${bearishCount}`} delta="sentiment" tone={bullishCount >= bearishCount ? "up" : "down"} />
          <Metric label="Neutral" value={`${neutralCount}`} delta="watch" tone="neutral" />
          <Metric label="Source score" value={`${sourceQuality}/100`} delta={source} tone={sourceQuality >= 85 ? "up" : "neutral"} />
          <Metric label="Bookmarks" value={`${bookmarks.length}`} delta="saved" tone="up" />
          <Metric label="Provider" value={provider} delta="watchlist only" tone={provider.includes("yahoo") ? "up" : "neutral"} />
        </div>
        <div className="mt-5 rounded-lg border border-purple-300/25 bg-purple-300/10 p-3 ring-1 ring-purple-300/10">
          <p className="text-xs uppercase tracking-[0.16em] text-purple-200">AI Prompt Controls</p>
          <p className="mt-2 text-sm leading-6 text-purple-50">Depth: {depth} · Focus: {focus} · Alert: {sentimentAlert ? "เปิด" : "ปิด"}</p>
          <div className="mt-3 space-y-2 text-xs text-purple-50">
            {[
              "คำถามต่อยอด: ข่าวนี้เปลี่ยน investment thesis หรือไม่?",
              "คำถามต่อยอด: sentiment ขัดกับ price action หรือไม่?",
              "คำถามต่อยอด: หุ้น peer ตัวไหนได้ประโยชน์/เสียประโยชน์?",
              "คำถามต่อยอด: จุด invalidation ของ thesis อยู่ตรงไหน?"
            ].map((item) => <p key={item} className="rounded border border-purple-200/20 bg-black/20 px-2 py-1.5">{item}</p>)}
          </div>
        </div>
        <div className="mt-5 rounded-lg border border-white/15 bg-black/30 p-3 ring-1 ring-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">สรุปภาพรวม</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            ข่าวที่กรองอยู่มี {filtered.length} รายการ, high impact {highImpact.length} รายการ และ sentiment ฝั่งบวก/ลบอยู่ที่ {bullishCount}/{bearishCount}. ใช้หน้านี้คัดข่าวก่อน แล้วเปิดรายละเอียดเพื่อดู checklist, risk และ action ต่อหุ้น
          </p>
        </div>
        <div className="mt-5 rounded-lg border border-cyan-300/18 bg-black/30 p-3 ring-1 ring-white/[0.04]">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ticker ที่มีข่าวมาก</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTickers.map(([symbol, count]) => (
              <span key={symbol} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-mono text-cyan-100">{symbol} · {count}</span>
            ))}
          </div>
        </div>
        </div>
      </Panel>
    </div>
  );
}

function MiniTrendPanel({ title, rows, positiveLabel, negativeLabel }: { title: string; rows: Array<[string, number]>; positiveLabel: string; negativeLabel: string }) {
  const max = Math.max(1, ...rows.map(([, value]) => Math.abs(value)));
  return (
    <div className="rounded-md border border-white/10 bg-black/20 p-3">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-3 flex h-24 items-end gap-1">
        {rows.length ? rows.map(([dateLabel, value]) => (
          <div key={dateLabel} title={`${dateLabel}: ${value}`} className="flex flex-1 flex-col items-center gap-1">
            <div className={`w-full rounded-t ${value >= 0 ? "bg-emerald-300/70" : "bg-rose-300/70"}`} style={{ height: `${Math.max(8, (Math.abs(value) / max) * 74)}px` }} />
            <span className="max-w-10 truncate text-[9px] text-slate-500">{dateLabel.slice(5)}</span>
          </div>
        )) : <p className="text-xs text-slate-500">ไม่มีข้อมูลในช่วงที่เลือก</p>}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-slate-500">
        <span>{negativeLabel}</span>
        <span>{positiveLabel}</span>
      </div>
    </div>
  );
}

function NewsDetailModal({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const quote = watchlist.find((item) => item.ticker === article.ticker) ?? watchlist[0];
  const sentimentTone = article.sentiment === "Bullish" ? "text-emerald-300" : article.sentiment === "Bearish" ? "text-rose-300" : "text-slate-300";
  const insight = buildExpandedNewsInsight(article);
  const research = buildTickerResearch(quote);
  const relatedNews = [...news, ...generatedNews].filter((item) => item.id !== article.id && (item.ticker === article.ticker || item.category === article.category)).slice(0, 5);

  return createPortal(
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-white/10 bg-[#101010] p-5 text-slate-100 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <StockLogo quote={quote} size="lg" />
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold text-cyan-200">{article.ticker} · {article.source}</p>
              <h3 className="mt-1 text-xl font-semibold leading-7 text-white">{article.title}</h3>
            </div>
          </div>
          <button onClick={onClose} title="Close" className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
          <StatusPill tone="info">{article.category}</StatusPill>
          <span className="font-mono text-xs text-slate-500">{article.date} {article.time}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-slate-500">Impact</p>
            <strong className="font-mono text-white">{article.impact}/100</strong>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-slate-500">Sentiment</p>
            <strong className={sentimentTone}>{article.sentiment}</strong>
          </div>
          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs text-slate-500">Ticker</p>
            <strong className="font-mono text-white">{article.ticker}</strong>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Quick read</p>
          <div className="mt-3 grid gap-2 text-sm leading-6 text-cyan-50 md:grid-cols-2">
            {insight.points.slice(0, 6).map((point) => (
              <div key={point} className="rounded-md border border-cyan-300/15 bg-black/20 px-3 py-2">{point}</div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">สรุปข่าวภาษาไทย</p>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
            {insight.summaryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200">Fundamental Table</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-cyan-50">
              <span>Revenue: <b>{research.revenue}</b></span>
              <span>Growth: <b>{research.growth}</b></span>
              <span>Market Share: <b>{research.marketShare}</b></span>
              <span>Analyst: <b>{research.analystRating}</b></span>
              <span>Price Target: <b>{research.priceTarget}</b></span>
              <span>Upside: <b>{research.targetUpside}</b></span>
            </div>
            <p className="mt-3 text-sm leading-6 text-cyan-50">{research.thesis}</p>
          </div>
          <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-amber-200">Technical / Risk Indicators</p>
            <p className="mt-3 text-sm leading-6 text-amber-50">{research.technical}</p>
            <p className="mt-2 text-sm leading-6 text-amber-50">Risk Score {research.riskScore}/100 · Source Credibility {sourceCredibility(article.source)}/100</p>
            <div className="mt-3 h-2 rounded-full bg-black/30"><div className="h-full rounded-full bg-amber-300" style={{ width: `${research.riskScore}%` }} /></div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Key points</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              {insight.points.map((point) => <li key={point}>• {point}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Trader checklist</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
              {insight.checklist.map((point) => <li key={point}>• {point}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Related News Context</p>
          <div className="mt-3 grid gap-2">
            {relatedNews.map((item) => (
              <a key={item.id} href={item.url ?? "#"} target="_blank" rel="noreferrer" className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-300 hover:border-cyan-300/30">
                <span className="font-mono text-cyan-100">{item.ticker}</span> · {item.title}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-rose-300/20 bg-rose-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-rose-200">Risk</p>
            <p className="mt-2 text-sm leading-6 text-rose-50">{insight.risk}</p>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Action</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50">{insight.action}</p>
          </div>
        </div>

        <div className="mt-5 h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} />
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {article.url ? (
            <a href={article.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/16">
              <ExternalLink size={15} /> เปิดข่าวต้นทาง
            </a>
          ) : null}
          <button onClick={onClose} className="rounded-md border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06]">ปิด</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function CalendarPage() {
  const [impact, setImpact] = useState("All");
  const rows = economicEvents.filter((event) => impact === "All" || event.impact === impact);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <Panel className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">Economic & Earnings Calendar</h2>
          <select value={impact} onChange={(event) => setImpact(event.target.value)} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100">
            {["All", "High", "Medium"].map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((event) => (
            <div key={event.event} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white">{event.event}</h3>
                <StatusPill tone={event.impact === "High" ? "down" : "neutral"}>{event.impact}</StatusPill>
              </div>
              <p className="mt-2 text-sm text-slate-400">{event.date} · Forecast {event.forecast}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{calendarEventNote}</p>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-4">
        <CalendarDays className="text-cyan-300" />
        <h3 className="mt-3 font-semibold text-white">How to read calendar</h3>
        <div className="mt-3 space-y-3 text-sm leading-6 text-slate-400">
          <p>CPI/FED: {calendarGuide.cpi}</p>
          <p>Earnings: {calendarGuide.earnings}</p>
          <p>GDP/NFP: {calendarGuide.gdp}</p>
        </div>
      </Panel>
    </div>
  );
}

export function SettingsPageFull() {
  const { appTheme, setAppTheme } = useMarketStore();
  const [values, setValues] = useState({ theme: appTheme, currency: "USD", language: "TH", refresh: "15s", density: "Compact", risk: "Balanced" });
  const [toggles, setToggles] = useState({ price: true, rsi: true, earnings: true, news: true, pwa: true, api: false });

  useEffect(() => {
    setValues((current) => ({ ...current, theme: appTheme }));
  }, [appTheme]);

  function chooseOption(key: keyof typeof settingsOptions, option: string) {
    setValues((current) => ({ ...current, [key]: option }));
    if (key === "theme") setAppTheme(option as AppTheme);
  }

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Settings ศูนย์ตั้งค่าระบบ</h2>
        <button className="flex items-center gap-2 rounded-md bg-cyan-300 px-4 py-2 font-medium text-slate-950"><Save size={16} />Save Settings</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(Object.keys(settingsOptions) as Array<keyof typeof settingsOptions>).map((key) => (
          <div key={key} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{key}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {settingsOptions[key].map((option) => (
                <button key={option} onClick={() => chooseOption(key, option)} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${values[key] === option ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>
                  {key === "theme" ? (
                    <span className="flex overflow-hidden rounded-full border border-white/20">
                      {themeSwatches[option as AppTheme].map((color) => <span key={color} className="h-3 w-3" style={{ backgroundColor: color }} />)}
                    </span>
                  ) : null}
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(Object.keys(toggles) as Array<keyof typeof toggles>).map((key) => (
          <button key={key} onClick={() => setToggles((current) => ({ ...current, [key]: !current[key] }))} className={`settings-toggle-card rounded-md border p-4 text-left ${toggles[key] ? "is-enabled" : "is-disabled"}`} style={toggles[key] ? settingsAlertThemeStyles[appTheme].enabled : settingsAlertThemeStyles[appTheme].disabled}>
            <Settings size={16} className="settings-toggle-icon" style={toggles[key] ? settingsAlertThemeStyles[appTheme].iconEnabled : settingsAlertThemeStyles[appTheme].iconDisabled} />
            <p className="mt-2 font-semibold text-white" style={settingsAlertThemeStyles[appTheme].title}>{key.toUpperCase()} Alerts</p>
            <p className="text-sm text-slate-400" style={toggles[key] ? settingsAlertThemeStyles[appTheme].statusEnabled : settingsAlertThemeStyles[appTheme].statusDisabled}>{toggles[key] ? "Enabled" : "Disabled"}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}
