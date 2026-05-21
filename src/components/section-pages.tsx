"use client";

import { useEffect, useState } from "react";
import { Bell, Bookmark, CalendarDays, RefreshCw, Save, Search, Settings } from "lucide-react";
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
          {filtered.slice(0, 60).map((article) => {
            const quote = watchlist.find((item) => item.ticker === article.ticker) ?? watchlist[0];
            return (
              <article key={article.id} className="rounded-md border border-white/10 bg-white/[0.035] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StockLogo quote={quote} size="sm" />
                  <span className="font-mono text-sm font-semibold text-white">{article.ticker}</span>
                  <StatusPill tone={article.sentiment === "Bullish" ? "up" : article.sentiment === "Bearish" ? "down" : "neutral"}>{article.sentiment}</StatusPill>
                  <StatusPill tone="info">{article.category}</StatusPill>
                  <span className="font-mono text-xs text-slate-500">{article.source} · {article.date} {article.time}</span>
                  <button onClick={() => setBookmarks((current) => current.includes(article.id) ? current.filter((id) => id !== article.id) : [...current, article.id])} title="Bookmark" className="ml-auto text-slate-400 hover:text-cyan-200">
                    <Bookmark size={16} fill={bookmarks.includes(article.id) ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3 className="mt-3 text-base font-semibold text-white">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{article.summaryTh}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-purple-400" style={{ width: `${article.impact}%` }} /></div>
                  <span className="font-mono text-xs text-slate-400">Impact {article.impact}</span>
                </div>
              </article>
            );
          })}
        </div>
      </Panel>
      <Panel className="p-4">
        <h3 className="font-semibold text-white">News Controls</h3>
        <div className="mt-4 space-y-3">
          <Metric label="Articles" value={`${filtered.length}`} delta="filtered" tone="neutral" />
          <Metric label="Bookmarks" value={`${bookmarks.length}`} delta="saved" tone="up" />
          <Metric label="Provider" value={provider} delta="watchlist only" tone={provider.includes("yahoo") ? "up" : "neutral"} />
        </div>
      </Panel>
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
