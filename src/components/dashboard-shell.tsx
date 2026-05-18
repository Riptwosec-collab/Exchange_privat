"use client";

import { Activity, Bell, Mic, Palette, Shield, Smartphone, Zap } from "lucide-react";
import { AdvancedChart } from "@/components/advanced-chart";
import {
  AIBriefing,
  AllocationDonut,
  CalendarAndFlows,
  CopilotWidget,
  HeatmapPanel,
  MarketOverview,
  MoversPanel,
  MultiChartPanel,
  NewsFeed,
  PortfolioPanel,
  ScreenerPanel,
  WatchlistPanel
} from "@/components/dashboard-widgets";
import { Header } from "@/components/header";
import { MarketTicker } from "@/components/market-ticker";
import { Sidebar } from "@/components/sidebar";
import { Metric, Panel, StatusPill } from "@/components/ui";
import { useMarketStore } from "@/store/market-store";

const mobileSections = ["Dashboard", "Charts", "News AI", "Portfolio", "Screener", "Heatmap", "Copilot"];

function DashboardView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <MarketOverview />
        <div className="grid gap-4 2xl:grid-cols-[1.7fr_1fr]">
          <AdvancedChart />
          <div className="space-y-4">
            <AIBriefing />
            <MoversPanel />
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <PortfolioPanel />
          <HeatmapPanel />
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ScreenerPanel />
          <MultiChartPanel />
        </div>
        <CalendarAndFlows />
      </div>
      <aside className="space-y-4">
        <WatchlistPanel />
        <NewsFeed />
        <AllocationDonut />
      </aside>
    </div>
  );
}

function CopilotPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-300">AI Stock Copilot</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">ถาม AI เรื่องหุ้นเป็นภาษาไทย</h2>
          </div>
          <StatusPill tone="info">Chat memory ready</StatusPill>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {["วิเคราะห์ NVDA พร้อมแนวรับแนวต้าน", "สรุปข่าว RKLB วันนี้", "พอร์ตนี้เสี่ยงเกินไปไหม", "หุ้น AI ตัวไหน momentum ดี"].map((prompt) => (
            <button key={prompt} className="rounded-md border border-white/10 bg-white/[0.035] p-4 text-left text-slate-200 hover:border-purple-300/40">
              {prompt}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Mic size={16} />
            Voice input placeholder
          </div>
          <textarea className="mt-3 min-h-32 w-full resize-none rounded-md border border-white/10 bg-white/[0.03] p-3 text-slate-100 outline-none" placeholder="ถามเช่น: หุ้นไหนกำลัง breakout และความเสี่ยงคืออะไร..." />
          <button className="mt-3 rounded-md bg-cyan-300 px-4 py-2 font-medium text-slate-950">Ask Copilot</button>
        </div>
      </Panel>
      <div className="space-y-4">
        <AIBriefing />
        <NewsFeed />
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {[
        { icon: Palette, title: "Theme", text: "Dark, light, cyan, blue, purple accent presets" },
        { icon: Bell, title: "Notifications", text: "Price, RSI, volume spike, earnings and AI alerts" },
        { icon: Shield, title: "Security", text: "JWT, encrypted keys, protected dashboard and rate limits" },
        { icon: Smartphone, title: "PWA", text: "Mobile-ready layout and installable app shell" },
        { icon: Zap, title: "Integrations", text: "Finnhub, Polygon, TwelveData, NewsAPI and OpenAI" },
        { icon: Activity, title: "Performance", text: "Lazy loading, cache layer, skeletons and fast rendering" }
      ].map((item) => (
        <Panel key={item.title} className="p-5">
          <item.icon className="text-cyan-300" />
          <h3 className="mt-4 font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
        </Panel>
      ))}
    </div>
  );
}

function SectionView() {
  const activeSection = useMarketStore((state) => state.activeSection);

  switch (activeSection) {
    case "Charts":
      return <AdvancedChart />;
    case "Multi Chart":
      return <MultiChartPanel />;
    case "News AI":
      return <NewsFeed />;
    case "Portfolio":
      return (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <PortfolioPanel />
          <AllocationDonut />
        </div>
      );
    case "Screener":
      return <ScreenerPanel />;
    case "Heatmap":
      return <HeatmapPanel />;
    case "Calendar":
    case "Whales":
      return <CalendarAndFlows />;
    case "Copilot":
      return <CopilotPage />;
    case "Settings":
      return <SettingsPage />;
    default:
      return <DashboardView />;
  }
}

export function DashboardShell() {
  const { activeSection, setActiveSection, liveMode, lastUpdated } = useMarketStore();

  return (
    <main className="terminal-grid min-h-screen pb-8">
      <Sidebar />
      <Header />
      <MarketTicker />
      <div className="px-4 py-4 lg:ml-[102px] lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{activeSection}</h2>
          </div>
          <div className="flex gap-2">
            <Metric label="Feed" value={liveMode === "provider" ? "Real" : "Mock"} delta={lastUpdated ?? "syncing"} tone={liveMode === "provider" ? "up" : "neutral"} />
          </div>
        </div>
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileSections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-full border px-3 py-2 text-sm ${activeSection === section ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100" : "border-white/10 text-slate-300"}`}
            >
              {section}
            </button>
          ))}
        </div>
        <SectionView />
      </div>
      <CopilotWidget />
    </main>
  );
}
