"use client";

import { AdvancedChart } from "@/components/advanced-chart";
import {
  AIBriefing,
  AllocationDonut,
  MarketOverview,
  MoversPanel,
  ScreenerPanel,
  WatchlistPanel
} from "@/components/dashboard-widgets";
import { Header } from "@/components/header";
import { MarketTicker } from "@/components/market-ticker";
import {
  EnhancedCopilotPageFull,
  EnhancedHeatmapPage,
  EnhancedHeatmapPanel,
  EnhancedMultiChartPage,
  EnhancedPortfolioPage,
  EnhancedScreenerPage,
  EnhancedWhalesPage
} from "@/components/enhanced-market-pages";
import { NineChartGridPage } from "@/components/nine-chart-grid";
import { Sidebar } from "@/components/sidebar";
import {
  CalendarPage,
  NewsPage,
  SettingsPageFull,
} from "@/components/section-pages";
import { Metric } from "@/components/ui";
import { useMarketStore } from "@/store/market-store";

const mobileSections = ["Dashboard", "Charts", "Multi Chart", "9 Charts", "News AI", "Portfolio", "Screener", "Heatmap", "Calendar", "Copilot"];

function DashboardView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4 xl:col-span-2">
        <MarketOverview />
        <AdvancedChart />
      </div>
      <div className="space-y-4">
        <EnhancedHeatmapPanel />
        <div className="grid min-w-0 items-start gap-4 2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 max-h-[620px] overflow-auto">
            <ScreenerPanel />
          </div>
          <div className="min-w-0">
            <EnhancedMultiChartPage />
          </div>
        </div>
      </div>
      <aside className="space-y-4">
        <WatchlistPanel />
        <AIBriefing />
        <MoversPanel />
        <AllocationDonut />
      </aside>
    </div>
  );
}

function SectionView() {
  const activeSection = useMarketStore((state) => state.activeSection);

  switch (activeSection) {
    case "Charts":
      return <AdvancedChart fillViewport />;
    case "Multi Chart":
      return <EnhancedMultiChartPage />;
    case "9 Charts":
      return <NineChartGridPage />;
    case "News AI":
      return <NewsPage />;
    case "Portfolio":
      return <EnhancedPortfolioPage />;
    case "Screener":
      return <EnhancedScreenerPage />;
    case "Heatmap":
      return <EnhancedHeatmapPage />;
    case "Calendar":
      return <CalendarPage />;
    case "Whales":
      return <EnhancedWhalesPage />;
    case "Copilot":
      return <EnhancedCopilotPageFull />;
    case "Settings":
      return <SettingsPageFull />;
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
    </main>
  );
}
