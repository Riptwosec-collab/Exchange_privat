"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bell, Bot, CalendarDays, ChevronRight, Flame, Network, Radar, Sparkles } from "lucide-react";
import { useMarketStore } from "@/store/market-store";
import type { StockQuote } from "@/lib/types";
import { Panel, StatusPill } from "./ui";

const marketBar = [
  { label: "Nasdaq Futures", value: "+0.62%", tone: "up", status: "Risk ON" },
  { label: "S&P 500 Futures", value: "+0.34%", tone: "up", status: "Broad bid" },
  { label: "VIX", value: "14.8", tone: "down", status: "Vol ต่ำ" },
  { label: "DXY", value: "104.2", tone: "neutral", status: "ทรงตัว" },
  { label: "US10Y Yield", value: "4.41%", tone: "down", status: "หนุน growth" },
  { label: "BTC", value: "+1.9%", tone: "up", status: "Crypto bid" },
  { label: "AI Sentiment", value: "Bullish", tone: "up", status: "Infrastructure lead" },
  { label: "Market Mode", value: "Risk ON", tone: "up", status: "Smart money active" }
];

const calendarEvents = [
  {
    date: "May 28",
    title: "NVDA Earnings",
    type: "Earnings Calendar",
    forecast: "Data center revenue + guidance",
    countdown: "อีก 3 วัน",
    impact: "Critical",
    related: ["NVDA", "MU", "AMD", "AVGO", "TSM"],
    volatility: "สูงมาก",
    sentiment: "Bullish แต่เสี่ยง sell-the-news",
    summary: "ตลาดกำลัง price-in ดีมานด์ AI inference และ data center หาก guidance สูงกว่าคาดจะหนุน semiconductor ทั้งกลุ่ม",
    risk: "ถ้า margin หรือ supply outlook อ่อนกว่าคาด หุ้น AI megacap อาจถูกขายทำกำไรเร็ว"
  },
  {
    date: "Jun 01",
    title: "US CPI",
    type: "Economic Calendar",
    forecast: "Core CPI 0.3% MoM",
    countdown: "อีก 7 วัน",
    impact: "Critical",
    related: ["NVDA", "AMD", "SOFI", "BTC"],
    volatility: "สูง",
    sentiment: "Neutral/Risk sensitive",
    summary: "หาก CPI สูงกว่าคาด หุ้นกลุ่ม AI และ Nasdaq อาจถูกแรงขายระยะสั้นจาก bond yield ที่ดีดขึ้น",
    risk: "เงินเฟ้อเหนียวจะกด valuation ของ growth stocks และทำให้ liquidity ลดลง"
  },
  {
    date: "Jun 05",
    title: "FOMC Minutes",
    type: "Economic Calendar",
    forecast: "ท่าที Fed ต่อ rate cuts",
    countdown: "อีก 11 วัน",
    impact: "High",
    related: ["QQQ", "SOFI", "RKLB", "CRWV"],
    volatility: "กลาง-สูง",
    sentiment: "ขึ้นกับภาษา Fed",
    summary: "ตลาดจะอ่านถ้อยคำเรื่อง inflation และ liquidity หาก Fed dovish จะหนุน Risk ON และหุ้น high beta",
    risk: "ถ้า Fed hawkish จะกด multiple ของ AI cloud และ fintech"
  },
  {
    date: "Jun 07",
    title: "AI Cloud Earnings",
    type: "Earnings Calendar",
    forecast: "Demand visibility / capex backlog",
    countdown: "อีก 13 วัน",
    impact: "High",
    related: ["CRWV", "NBIS", "GOOG", "MSFT"],
    volatility: "สูง",
    sentiment: "Bullish thematic",
    summary: "ตลาดกำลังหมุนเงินจาก megacap AI ไปยัง AI cloud infrastructure ที่มี growth สูงและ supply constrained",
    risk: "valuation ตึงมาก หาก backlog ไม่โตตามคาดจะเกิด de-risking"
  },
  {
    date: "Jun 10",
    title: "Non-Farm Payroll",
    type: "Economic Calendar",
    forecast: "Jobs +180K",
    countdown: "อีก 16 วัน",
    impact: "High",
    related: ["SPY", "QQQ", "DXY", "BTC"],
    volatility: "กลาง",
    sentiment: "Macro pivot",
    summary: "ตัวเลขแรงงานมีผลต่อ yield, USD และ risk appetite โดยตรง หุ้น growth ต้องการตัวเลขที่ไม่ร้อนเกินไป",
    risk: "jobs แข็งเกินคาดอาจทำให้ตลาดเลื่อนความหวัง rate cut"
  },
  {
    date: "Jun 12",
    title: "Semiconductor Guidance",
    type: "Earnings Calendar",
    forecast: "AI chip orders / HBM supply",
    countdown: "อีก 18 วัน",
    impact: "Medium",
    related: ["MU", "AVGO", "TSM", "AMD"],
    volatility: "กลาง-สูง",
    sentiment: "Bullish rotation",
    summary: "คำแนะนำยอดสั่งซื้อชิปและ HBM จะบอกว่า AI cycle ยังขยายหรือเริ่มชะลอ",
    risk: "หาก lead time สั้นลงเร็ว ตลาดจะตีความว่า demand peak กำลังใกล้เข้ามา"
  }
];

const whaleFlows = [
  { type: "Institutional Flow", ticker: "NVDA", amount: "+$820M", score: 86, signal: "Accumulation", color: "blue", analysis: "พบแรงสะสมจากสถาบันก่อนงบ ตลาดตีความว่า positioning ยังเอียงฝั่ง Bullish" },
  { type: "Hedge Fund 13F", ticker: "AVGO", amount: "+$310M", score: 74, signal: "Accumulation", color: "blue", analysis: "กองทุนเพิ่มน้ำหนัก semiconductor quality trade และมอง AVGO เป็น AI infrastructure proxy" },
  { type: "CEO Transaction", ticker: "RKLB", amount: "-$12M", score: 42, signal: "Distribution", color: "purple", analysis: "ธุรกรรมผู้บริหารเป็นแรงกด sentiment ระยะสั้น แต่ต้องเทียบกับขนาด position และ liquidity" },
  { type: "Congress Trade", ticker: "SOFI", amount: "+$3.4M", score: 61, signal: "Watch", color: "orange", analysis: "flow จากกลุ่มการเมืองเริ่มกลับมาใน fintech แต่ยังต้องรอ volume confirmation" },
  { type: "Options Sweep", ticker: "MU", amount: "+$450M", score: 82, signal: "Accumulation", color: "green", analysis: "call sweep ขนาดใหญ่สะท้อน momentum bet ก่อน semiconductor guidance" },
  { type: "Dark Pool", ticker: "AMD", amount: "+$260M", score: 69, signal: "Accumulation", color: "black", analysis: "Dark Pool inflow เพิ่มขึ้น แต่ราคาเริ่ม lag peer จึงต้องระวัง absorption ก่อน breakout" }
];

const linkedTimeline = [
  { date: "May 28", event: "NVDA Earnings", flow: "Options Sweep +$450M", detail: "call buying หนาแน่นก่อนงบ", ai: "AI มองบวกต่อ MU / AVGO / AMD หาก guidance แข็งแรง" },
  { date: "Jun 01", event: "US CPI", flow: "Dark Pool hedging เพิ่ม", detail: "สถาบันลด beta บางส่วนก่อน macro event", ai: "ถ้า CPI ต่ำกว่าคาด Nasdaq มีโอกาส squeeze ขึ้น" },
  { date: "Jun 07", event: "AI Cloud Earnings", flow: "Hedge Fund 13F เพิ่ม CRWV/NBIS", detail: "เงินไหลเข้า AI cloud นอก megacap", ai: "ธีม infrastructure ยังเป็น sector rotation หลัก" },
  { date: "Jun 12", event: "Semiconductor Guidance", flow: "Dark Pool Inflow AMD/MU", detail: "สะสมก่อน guidance แต่ยังมี resistance ด้านบน", ai: "ต้องดู RVOL และ breakout เหนือแนวต้านยืนยัน" }
];

const sectorHeatmap = [
  { sector: "AI Infrastructure", score: 88, tone: "up" },
  { sector: "Semiconductor", score: 78, tone: "up" },
  { sector: "Cloud", score: 71, tone: "up" },
  { sector: "Cybersecurity", score: 58, tone: "neutral" },
  { sector: "Fintech", score: 46, tone: "down" },
  { sector: "Space", score: 64, tone: "up" },
  { sector: "Energy", score: 39, tone: "down" },
  { sector: "Crypto", score: 69, tone: "up" }
];

const alerts = [
  "CPI Incoming: ความผันผวน Nasdaq อาจเพิ่มขึ้น",
  "Earnings Incoming: NVDA มี expected move สูง",
  "Whale Trade > $100M: MU Options Sweep",
  "Dark Pool Spike: AMD inflow เพิ่ม",
  "Stock Move >5%: CRWV/NBIS ต้องจับตา"
];

function toneClass(tone: string) {
  if (tone === "up") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (tone === "down") return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  return "border-cyan-300/25 bg-cyan-300/10 text-cyan-100";
}

function impactTone(impact: string) {
  if (impact === "Critical") return "border-rose-400/45 bg-rose-400/15 text-rose-100 shadow-[0_0_24px_rgba(251,113,133,.14)]";
  if (impact === "High") return "border-purple-300/40 bg-purple-400/12 text-purple-100 shadow-[0_0_24px_rgba(216,180,254,.12)]";
  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function flowTone(color: string) {
  const tones: Record<string, string> = {
    blue: "border-sky-300/30 bg-sky-300/10 text-sky-100",
    purple: "border-purple-300/30 bg-purple-300/10 text-purple-100",
    orange: "border-orange-300/30 bg-orange-300/10 text-orange-100",
    green: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
    black: "border-white/15 bg-black/45 text-slate-100 shadow-[0_0_22px_rgba(255,255,255,.08)]"
  };
  return tones[color] ?? tones.blue;
}

function quoteSummary(quote: StockQuote) {
  const expectedMove = Math.max(2.2, Math.min(9.8, Math.abs(quote.changePercent) * 1.4 + quote.rsi / 25));
  const support = quote.price * (1 - expectedMove / 100);
  const resistance = quote.price * (1 + expectedMove / 100);
  return {
    expectedMove,
    support,
    resistance,
    flow: quote.changePercent >= 0 ? "Accumulation bias" : "Distribution watch",
    summary: quote.isAiStock
      ? "อยู่ในธีม AI/Infrastructure ต้องดูว่าวอลุ่มยืนยัน breakout หรือเป็นเพียงแรงเก็งกำไรก่อน event"
      : "ต้องเทียบกับ sector และ macro sensitivity เพราะ relative strength ยังเป็นตัวตัดสินคุณภาพสัญญาณ"
  };
}

export function MarketIntelligenceCenter() {
  const { quotes, selectedTicker, setSelectedTicker } = useMarketStore();
  const [activeTicker, setActiveTicker] = useState(selectedTicker);
  const watchlist = ["NVDA", "MU", "AMD", "AVGO", "TSM", "SOFI", "RKLB", "ASTS", "CRWV", "NBIS"];
  const selected = quotes.find((quote) => quote.ticker === activeTicker) ?? quotes[0];
  const selectedSummary = useMemo(() => quoteSummary(selected), [selected]);
  const selectedEvents = calendarEvents.filter((event) => event.related.includes(selected.ticker)).slice(0, 3);
  const selectedFlows = whaleFlows.filter((flow) => flow.ticker === selected.ticker || selectedEvents.some((event) => event.related.includes(flow.ticker))).slice(0, 3);

  function chooseTicker(ticker: string) {
    setActiveTicker(ticker);
    setSelectedTicker(ticker);
  }

  return (
    <div className="space-y-4">
      <Panel className="overflow-hidden p-3">
        <div className="flex flex-wrap items-center gap-2">
          {marketBar.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
              className={`relative min-w-[150px] flex-1 rounded-md border px-3 py-2 ${toneClass(item.tone)}`}
            >
              <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-current" />
              <p className="text-[10px] uppercase tracking-[0.16em] opacity-70">{item.label}</p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <strong className="font-mono text-sm">{item.value}</strong>
                <span className="text-[11px] opacity-80">{item.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Market Intelligence Center</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Economic Calendar + Earnings Calendar</h2>
                <p className="mt-1 text-sm text-slate-400">ดู event สำคัญพร้อมผลกระทบต่อหุ้นที่เกี่ยวข้องในหน้าเดียว</p>
              </div>
              <StatusPill tone="info">Calendar Events</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-2">
              {calendarEvents.map((event, index) => (
                <motion.article
                  key={event.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: index * 0.04 }}
                  whileHover={{ y: -3 }}
                  className={`group rounded-lg border bg-white/[0.035] p-4 transition hover:bg-white/[0.055] ${impactTone(event.impact)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <CalendarDays size={16} className="text-cyan-200" />
                        <span className="font-mono text-sm text-white">{event.date}</span>
                        <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-[10px] text-slate-300">{event.type}</span>
                      </div>
                      <h3 className="mt-2 text-base font-semibold text-white">{event.title}</h3>
                    </div>
                    <span className="rounded-md border border-current/25 px-2 py-1 text-xs font-semibold">{event.impact}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                    <span className="rounded-md border border-white/10 bg-black/20 p-2 text-slate-300">Forecast <b className="block text-slate-100">{event.forecast}</b></span>
                    <span className="rounded-md border border-white/10 bg-black/20 p-2 text-slate-300">Countdown <b className="block text-amber-100">{event.countdown}</b></span>
                    <span className="rounded-md border border-white/10 bg-black/20 p-2 text-slate-300">Expected Vol <b className="block text-cyan-100">{event.volatility}</b></span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{event.summary}</p>
                  <p className="mt-2 rounded-md border border-rose-300/20 bg-rose-300/10 p-2 text-xs leading-5 text-rose-50">{event.risk}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">Related:</span>
                    {event.related.map((ticker) => (
                      <button key={ticker} onClick={() => chooseTicker(ticker)} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 font-mono text-xs text-cyan-100 hover:border-cyan-200/60">{ticker}</button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                    <span>Market Sentiment: <b className="text-slate-100">{event.sentiment}</b></span>
                    <ChevronRight size={15} className="transition group-hover:translate-x-1" />
                  </div>
                </motion.article>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-purple-300">Whale / Insider Tracking</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Institutional Flow, Insider, Dark Pool, Options Sweep</h2>
              </div>
              <StatusPill tone="up">Smart Money Live</StatusPill>
            </div>
            <div className="mt-4 grid gap-3 xl:grid-cols-3">
              {whaleFlows.map((flow, index) => {
                const quote = quotes.find((item) => item.ticker === flow.ticker) ?? quotes[index % quotes.length];
                return (
                  <motion.article
                    key={flow.type}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.035 }}
                    whileHover={{ scale: 1.015 }}
                    className={`rounded-lg border p-4 ${flowTone(flow.color)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] opacity-70">{flow.type}</p>
                        <button onClick={() => chooseTicker(flow.ticker)} className="mt-1 font-mono text-lg font-bold text-white">{flow.ticker}</button>
                      </div>
                      <StatusPill tone={flow.signal === "Accumulation" ? "up" : flow.signal === "Distribution" ? "down" : "neutral"}>{flow.signal}</StatusPill>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <span className="rounded-md border border-white/10 bg-black/20 p-2">Current <b className="block font-mono text-white">${quote.price.toFixed(2)}</b></span>
                      <span className="rounded-md border border-white/10 bg-black/20 p-2">Previous <b className="block font-mono text-white">${quote.previousClose.toFixed(2)}</b></span>
                      <span className="rounded-md border border-white/10 bg-black/20 p-2">Flow Amount <b className="block font-mono text-white">{flow.amount}</b></span>
                      <span className="rounded-md border border-white/10 bg-black/20 p-2">Score <b className="block font-mono text-white">{flow.score}/100</b></span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-black/30">
                      <div className="h-full rounded-full bg-current shadow-[0_0_18px_currentColor]" style={{ width: `${flow.score}%` }} />
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-200">{flow.analysis}</p>
                  </motion.article>
                );
              })}
            </div>
          </Panel>

          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <Panel className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Event-linked Whale Timeline</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Event → Whale Flow → AI Read-through</h2>
                </div>
                <Network className="text-purple-200" />
              </div>
              <div className="mt-5 space-y-4">
                {linkedTimeline.map((item, index) => (
                  <motion.div
                    key={`${item.date}-${item.event}`}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="relative grid gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4 md:grid-cols-[92px_1fr]"
                  >
                    <div className="absolute bottom-[-18px] left-10 top-12 hidden w-px bg-gradient-to-b from-cyan-300/70 to-transparent md:block" />
                    <div className="font-mono text-sm text-cyan-100">{item.date}</div>
                    <div>
                      <h3 className="font-semibold text-white">{item.event}</h3>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-2 text-xs text-emerald-100">{item.flow}</span>
                        <span className="rounded-md border border-white/10 bg-black/20 p-2 text-xs text-slate-300">{item.detail}</span>
                        <span className="rounded-md border border-purple-300/20 bg-purple-300/10 p-2 text-xs text-purple-100">{item.ai}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Panel>

            <Panel className="p-4">
              <div className="flex items-center gap-2">
                <Bot className="text-cyan-200" />
                <h3 className="font-semibold text-white">AI Market Analysis</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p className="rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-50">ตลาดยังอยู่ในโหมด Risk ON จากแรงซื้อหุ้น AI Infrastructure แต่ event risk จาก CPI และงบ NVDA ทำให้ volatility มีโอกาสขยาย</p>
                <p className="rounded-md border border-purple-300/20 bg-purple-300/10 p-3 text-purple-50">Smart Money ยังสะสมใน NVDA, MU, AVGO และ AMD ผ่าน Institutional Flow, Options Sweep และ Dark Pool inflow แต่ต้องระวัง sell-the-news หลัง event ใหญ่</p>
                <p className="rounded-md border border-amber-300/20 bg-amber-300/10 p-3 text-amber-50">Fed Impact: หาก yield ลดลง หุ้น growth/AI จะได้ valuation tailwind แต่ถ้า CPI ร้อนกว่าคาด risk-off จะกลับมาเร็ว</p>
              </div>
            </Panel>
          </div>
        </div>

        <aside className="space-y-4 2xl:sticky 2xl:top-4 2xl:self-start">
          <Panel className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">AI Assistant Radar</h3>
              <Sparkles size={18} className="text-purple-200" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {[
                ["ตลาดวันนี้", "Risk ON แต่ event-heavy"],
                ["Smart Money", "AI infra accumulation"],
                ["Risk", "CPI / Earnings"],
                ["AI Sector", "Leader"],
                ["Fed Impact", "Yield sensitive"],
                ["Earnings Impact", "NVDA เป็น trigger"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.035] p-2">
                  <p className="text-slate-500">{label}</p>
                  <b className="mt-1 block text-slate-100">{value}</b>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-emerald-200" />
              <h3 className="font-semibold text-white">Sector Heatmap</h3>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {sectorHeatmap.map((item) => (
                <motion.div
                  key={item.sector}
                  animate={{ opacity: [0.82, 1, 0.82] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className={`rounded-md border p-3 ${toneClass(item.tone)}`}
                >
                  <p className="text-xs">{item.sector}</p>
                  <b className="font-mono text-lg">{item.score}</b>
                </motion.div>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-white">Watchlist Intelligence</h3>
              <Radar size={18} className="text-cyan-200" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {watchlist.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => chooseTicker(ticker)}
                  className={`rounded-md border px-2 py-2 text-left font-mono text-sm transition ${activeTicker === ticker ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100" : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-300/30"}`}
                >
                  {ticker}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between">
                <b className="font-mono text-white">{selected.ticker}</b>
                <span className={selected.changePercent >= 0 ? "font-mono text-emerald-300" : "font-mono text-rose-300"}>{selected.changePercent >= 0 ? "+" : ""}{selected.changePercent.toFixed(2)}%</span>
              </div>
              <div className="mt-3 grid gap-2 text-xs">
                <span>Upcoming Events: <b className="text-slate-100">{selectedEvents.map((event) => event.title).join(", ") || "ไม่มี event ใกล้ตัว"}</b></span>
                <span>Whale Flow: <b className="text-slate-100">{selectedSummary.flow}</b></span>
                <span>Dark Pool: <b className="text-slate-100">{selectedFlows.find((flow) => flow.type === "Dark Pool")?.amount ?? "ยังไม่มี spike ตรง"}</b></span>
                <span>Support / Resistance: <b className="text-slate-100">${selectedSummary.support.toFixed(2)} / ${selectedSummary.resistance.toFixed(2)}</b></span>
                <span>Expected Move: <b className="text-slate-100">{selectedSummary.expectedMove.toFixed(1)}%</b></span>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{selectedSummary.summary}</p>
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-amber-200" />
              <h3 className="font-semibold text-white">Alerts System</h3>
            </div>
            <div className="mt-3 space-y-2">
              {alerts.map((alert, index) => (
                <motion.div
                  key={alert}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-2 rounded-md border border-amber-300/20 bg-amber-300/10 p-2 text-xs leading-5 text-amber-50"
                >
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                  {alert}
                </motion.div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
