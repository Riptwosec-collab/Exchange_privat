"use client";

import { useEffect, useState } from "react";
import { Bell, Bookmark, CalendarDays, ExternalLink, RefreshCw, Save, Search, Settings, X } from "lucide-react";
import { economicEvents, generatedNews, news, watchlist } from "@/lib/mock-data";
import { allStockSymbols, stockUniverse } from "@/lib/market-utils";
import type { NewsArticle } from "@/lib/types";
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
  theme: ["Calm Dark", "Cyan", "Emerald"],
  currency: ["USD", "THB"],
  language: ["TH", "EN"],
  refresh: ["5s", "15s", "30s"],
  density: ["Compact", "Comfortable"],
  risk: ["Balanced", "Aggressive"]
};

function sentimentThai(sentiment: NewsArticle["sentiment"]) {
  if (sentiment === "Bullish") return "บวก";
  if (sentiment === "Bearish") return "ลบ";
  return "กลาง";
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
    return search.includes(query.toLowerCase());
  });
  const highImpact = filtered.filter((article) => article.impact >= 75);
  const bullishCount = filtered.filter((article) => article.sentiment === "Bullish").length;
  const bearishCount = filtered.filter((article) => article.sentiment === "Bearish").length;
  const topTickers = Array.from(
    filtered.reduce((acc, article) => acc.set(article.ticker, (acc.get(article.ticker) ?? 0) + 1), new Map<string, number>())
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <Panel className="p-4">
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
        {lineStatus ? <p className="mt-3 rounded-md border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-slate-300">{lineStatus}</p> : null}
        <div className="mt-4 grid gap-3 md:grid-cols-5">
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
        <div className="mt-4 space-y-3">
          {filtered.slice(0, 100).map((article) => {
            const quote = watchlist.find((item) => item.ticker === article.ticker) ?? watchlist[0];
            const insight = buildExpandedNewsInsight(article);
            return (
              <article
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="cursor-pointer rounded-md border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/35 hover:bg-white/[0.055]"
              >
                <div className="flex flex-wrap items-center gap-2">
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
                <h3 className="mt-3 text-base font-semibold text-white">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{insight.fullSummary}</p>
                <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
                  {insight.points.slice(1).map((point) => (
                    <span key={point} className="rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-slate-400">{point}</span>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-50">
                  {insight.action}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} /></div>
                  <span className="font-mono text-xs text-slate-400">Impact {article.impact}</span>
                </div>
              </article>
            );
          })}
        </div>
        {selectedArticle ? <NewsDetailModal article={selectedArticle} onClose={() => setSelectedArticle(null)} /> : null}
      </Panel>
      <Panel className="p-4">
        <h3 className="font-semibold text-white">News Controls</h3>
        <div className="mt-4 space-y-3">
          <Metric label="Articles" value={`${filtered.length}`} delta="filtered" tone="neutral" />
          <Metric label="High impact" value={`${highImpact.length}`} delta="impact 75+" tone={highImpact.length ? "up" : "neutral"} />
          <Metric label="Bull / Bear" value={`${bullishCount}/${bearishCount}`} delta="sentiment" tone={bullishCount >= bearishCount ? "up" : "down"} />
          <Metric label="Bookmarks" value={`${bookmarks.length}`} delta="saved" tone="up" />
          <Metric label="Provider" value={provider} delta="watchlist only" tone={provider.includes("yahoo") ? "up" : "neutral"} />
        </div>
        <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">สรุปภาพรวม</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            ข่าวที่กรองอยู่มี {filtered.length} รายการ, high impact {highImpact.length} รายการ และ sentiment ฝั่งบวก/ลบอยู่ที่ {bullishCount}/{bearishCount}. ใช้หน้านี้คัดข่าวก่อน แล้วเปิดรายละเอียดเพื่อดู checklist, risk และ action ต่อหุ้น
          </p>
        </div>
        <div className="mt-5 rounded-md border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Ticker ที่มีข่าวมาก</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTickers.map(([symbol, count]) => (
              <span key={symbol} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-mono text-cyan-100">{symbol} · {count}</span>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}

function NewsDetailModal({ article, onClose }: { article: NewsArticle; onClose: () => void }) {
  const quote = watchlist.find((item) => item.ticker === article.ticker) ?? watchlist[0];
  const sentimentTone = article.sentiment === "Bullish" ? "text-emerald-300" : article.sentiment === "Bearish" ? "text-rose-300" : "text-slate-300";
  const insight = buildExpandedNewsInsight(article);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
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
    </div>
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
  const [values, setValues] = useState({ theme: "Calm Dark", currency: "USD", language: "TH", refresh: "15s", density: "Compact", risk: "Balanced" });
  const [toggles, setToggles] = useState({ price: true, rsi: true, earnings: true, news: true, pwa: true, api: false });
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
                <button key={option} onClick={() => setValues((current) => ({ ...current, [key]: option }))} className={`rounded-md px-3 py-2 text-sm ${values[key] === option ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>{option}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(Object.keys(toggles) as Array<keyof typeof toggles>).map((key) => (
          <button key={key} onClick={() => setToggles((current) => ({ ...current, [key]: !current[key] }))} className={`rounded-md border p-4 text-left ${toggles[key] ? "border-emerald-300/30 bg-emerald-300/10" : "border-white/10 bg-white/[0.03]"}`}>
            <Settings size={16} className="text-cyan-300" />
            <p className="mt-2 font-semibold text-white">{key.toUpperCase()} Alerts</p>
            <p className="text-sm text-slate-400">{toggles[key] ? "Enabled" : "Disabled"}</p>
          </button>
        ))}
      </div>
    </Panel>
  );
}
