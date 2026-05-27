"use client";

import { AdvancedChart } from "@/components/advanced-chart";
import {
  AIBriefing,
  AllocationDonut,
  MarketOverview,
  MoversPanel,
  NewsFeed,
  ScreenerPanel,
  WatchlistPanel
} from "@/components/dashboard-widgets";
import { Header } from "@/components/header";
import { MarketTicker } from "@/components/market-ticker";
import { MarketIntelligenceCenter } from "@/components/market-intelligence-center";
import { Bot, ChartCandlestick, Home, ListChecks, Newspaper } from "lucide-react";
import {
  EnhancedCopilotPageFull,
  EnhancedHeatmapPage,
  EnhancedHeatmapPanel,
  EnhancedPortfolioPage,
  EnhancedScreenerPage
} from "@/components/enhanced-market-pages";
import { MultiChartAdvancedPage } from "@/components/multi-chart-advanced";
import { NineChartGridPage } from "@/components/nine-chart-grid";
import { Sidebar } from "@/components/sidebar";
import {
  NewsPage,
  SettingsPageFull,
} from "@/components/section-pages";
import { TopMoversPage } from "@/components/top-movers-page";
import { Metric } from "@/components/ui";
import { useMarketStore } from "@/store/market-store";

const mobileSections = ["Dashboard", "Watchlist", "Charts", "Top Movers", "News AI", "Portfolio", "Heatmap", "Copilot"];
const bottomNav = [
  { label: "Dashboard", icon: Home, shortLabel: "หน้าแรก" },
  { label: "Watchlist", icon: ListChecks, shortLabel: "หุ้น" },
  { label: "Charts", icon: ChartCandlestick, shortLabel: "กราฟ" },
  { label: "News AI", icon: Newspaper, shortLabel: "ข่าว" },
  { label: "Copilot", icon: Bot, shortLabel: "AI" }
];

function DashboardView() {
  return (
    <div className="grid gap-4 2xl:grid-cols-[390px_minmax(0,1fr)_360px]">
      <aside className="space-y-4 2xl:sticky 2xl:top-4 2xl:self-start">
        <WatchlistPanel />
      </aside>
      <section className="min-w-0">
        <div className="mb-4">
          <MarketOverview />
        </div>
        <AdvancedChart />
        <div className="min-w-0 space-y-4">
          <EnhancedHeatmapPanel />
          <ScreenerPanel />
        </div>
      </section>
      <aside className="min-w-0 space-y-4">
        <AIBriefing />
        <NewsFeed />
        <MoversPanel />
        <AllocationDonut />
      </aside>
    </div>
  );
}

function WatchlistView() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <WatchlistPanel />
      <aside className="space-y-4">
        <MarketOverview />
        <MoversPanel />
      </aside>
    </div>
  );
}

function SectionView() {
  const activeSection = useMarketStore((state) => state.activeSection);

  switch (activeSection) {
    case "Watchlist":
      return <WatchlistView />;
    case "Charts":
      return <AdvancedChart fillViewport />;
    case "Multi Chart":
      return <MultiChartAdvancedPage />;
    case "9 Charts":
      return <NineChartGridPage />;
    case "Top Movers":
      return <TopMoversPage />;
    case "News AI":
      return <NewsPage />;
    case "Portfolio":
      return <EnhancedPortfolioPage />;
    case "Screener":
      return <EnhancedScreenerPage />;
    case "Heatmap":
      return <EnhancedHeatmapPage />;
    case "Market Intelligence Center":
      return <MarketIntelligenceCenter />;
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
    <main className="terminal-grid min-h-screen pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-8">
      <Sidebar />
      <Header />
      <MarketTicker />
      <div className="mobile-app-shell px-4 py-4 lg:ml-[102px] lg:px-6">
        <div className="mobile-workspace-card mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{activeSection}</h2>
          </div>
          <div className="mobile-feed-metric flex gap-2">
            <Metric label="Feed" value={liveMode === "provider" ? "Real" : "Mock"} delta={lastUpdated ?? "syncing"} tone={liveMode === "provider" ? "up" : "neutral"} />
          </div>
        </div>
        <div className="mobile-section-pills mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileSections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-extrabold ${activeSection === section ? "border-[#00e889]/45 bg-[#00e889]/16 text-white shadow-[0_0_18px_rgba(0,232,137,.12)]" : "border-white/10 bg-white/[0.035] text-slate-200"}`}
            >
              {section}
            </button>
          ))}
        </div>
        <SectionView />
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#101010]/94 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-20px_48px_rgba(0,0,0,.42)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {bottomNav.map((item) => {
            const active = activeSection === item.label;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActiveSection(item.label)}
                className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-black transition ${
                  active
                    ? "border-[#00e889]/38 bg-[#00e889]/15 text-white"
                    : "border-transparent text-slate-400"
                }`}
              >
                <item.icon size={21} strokeWidth={2.6} />
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
