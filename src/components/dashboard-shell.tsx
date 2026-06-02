"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import {
  Bot,
  ChartCandlestick,
  Flame,
  Gauge,
  Grid3X3,
  Home,
  LayoutGrid,
  LineChart,
  ListChecks,
  Newspaper,
  Radar,
  Settings,
  WalletCards,
  X
} from "lucide-react";
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

const mobileSections = ["Dashboard", "Watchlist", "Charts", "Multi Chart", "9 Charts", "Top Movers", "News AI", "Portfolio", "Screener", "Heatmap", "Market Intelligence Center", "Copilot", "Settings"];
const bottomNav = [
  { label: "Dashboard", icon: Home, shortLabel: "\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01" },
  { label: "Watchlist", icon: ListChecks, shortLabel: "\u0e2b\u0e38\u0e49\u0e19" },
  { label: "Charts", icon: ChartCandlestick, shortLabel: "\u0e01\u0e23\u0e32\u0e1f" },
  { label: "News AI", icon: Newspaper, shortLabel: "\u0e02\u0e48\u0e32\u0e27" },
  { label: "Menu", icon: LayoutGrid, shortLabel: "\u0e40\u0e21\u0e19\u0e39" }
];
const mobileMenuItems = [
  { label: "Dashboard", icon: Home, thai: "\u0e2b\u0e19\u0e49\u0e32\u0e41\u0e23\u0e01" },
  { label: "Watchlist", icon: ListChecks, thai: "\u0e2b\u0e38\u0e49\u0e19\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14" },
  { label: "Charts", icon: ChartCandlestick, thai: "\u0e01\u0e23\u0e32\u0e1f\u0e2b\u0e25\u0e31\u0e01" },
  { label: "Multi Chart", icon: LineChart, thai: "\u0e2b\u0e25\u0e32\u0e22\u0e01\u0e23\u0e32\u0e1f" },
  { label: "9 Charts", icon: Grid3X3, thai: "9 \u0e01\u0e23\u0e32\u0e1f" },
  { label: "Top Movers", icon: Gauge, thai: "\u0e2b\u0e38\u0e49\u0e19\u0e02\u0e36\u0e49\u0e19\u0e25\u0e07" },
  { label: "News AI", icon: Newspaper, thai: "\u0e02\u0e48\u0e32\u0e27 AI" },
  { label: "Portfolio", icon: WalletCards, thai: "\u0e1e\u0e2d\u0e23\u0e4c\u0e15" },
  { label: "Screener", icon: Radar, thai: "\u0e2a\u0e41\u0e01\u0e19\u0e2b\u0e38\u0e49\u0e19" },
  { label: "Heatmap", icon: Flame, thai: "Heatmap" },
  { label: "Market Intelligence Center", icon: Gauge, thai: "Market Intel" },
  { label: "Copilot", icon: Bot, thai: "AI Copilot" },
  { label: "Settings", icon: Settings, thai: "\u0e15\u0e31\u0e49\u0e07\u0e04\u0e48\u0e32" }
];

function DashboardView() {
  return (
    <div className="space-y-4">
      <section className="min-w-0 space-y-4">
        <MarketOverview />
        <AdvancedChart />
      </section>
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 space-y-4">
          <WatchlistPanel />
          <EnhancedHeatmapPanel />
          <ScreenerPanel />
        </section>
        <aside className="min-w-0 space-y-4 2xl:sticky 2xl:top-4 2xl:self-start">
          <AIBriefing />
          <NewsFeed />
          <MoversPanel />
          <AllocationDonut />
        </aside>
      </div>
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
  const { activeSection, appTheme, setActiveSection, setAppTheme, liveMode, lastUpdated } = useMarketStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("astraquant-theme");
    if (savedTheme === "Technology" || savedTheme === "Space" || savedTheme === "Luxury" || savedTheme === "Obsidian" || savedTheme === "Pearl") {
      setAppTheme(savedTheme);
    }
  }, [setAppTheme]);

  useEffect(() => {
    window.localStorage.setItem("astraquant-theme", appTheme);
  }, [appTheme]);

  useEffect(() => {
    const section = searchParams.get("section");
    const menu = searchParams.get("menu");

    if (section && mobileSections.includes(section)) {
      setActiveSection(section);
      setMobileMenuOpen(false);
    } else if (menu === "1") {
      setMobileMenuOpen(true);
    }
  }, [searchParams, setActiveSection]);

  const openSection = useCallback((section: string) => {
    if (section === "Menu") {
      setMobileMenuOpen(true);
      return;
    }
    setActiveSection(section);
    setMobileMenuOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set("section", section);
    url.searchParams.delete("menu");
    window.history.replaceState(null, "", url);
  }, [setActiveSection]);

  useEffect(() => {
    function handleNativeMobileNav(event: Event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest<HTMLElement>("[data-mobile-section]");
      if (!trigger) return;
      const section = trigger.dataset.mobileSection;
      if (!section) return;

      event.preventDefault();
      event.stopPropagation();
      openSection(section);
    }

    document.addEventListener("touchend", handleNativeMobileNav, { capture: true, passive: false });
    document.addEventListener("pointerup", handleNativeMobileNav, { capture: true });
    document.addEventListener("click", handleNativeMobileNav, { capture: true });
    return () => {
      document.removeEventListener("touchend", handleNativeMobileNav, { capture: true });
      document.removeEventListener("pointerup", handleNativeMobileNav, { capture: true });
      document.removeEventListener("click", handleNativeMobileNav, { capture: true });
    };
  }, [openSection]);

  function handleTouchSection(section: string) {
    openSection(section);
  }

  return (
    <main data-theme={appTheme.toLowerCase()} className="terminal-grid min-h-screen pb-[calc(92px+env(safe-area-inset-bottom))] lg:pb-8">
      <Sidebar />
      <Header />
      <MarketTicker />
      <div className="mobile-app-shell px-4 py-4 lg:ml-[292px] lg:px-6">
        <div className="mobile-workspace-card mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/8 bg-[#1a1b22]/86 p-4 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Active workspace</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{activeSection}</h2>
          </div>
          <div className="mobile-feed-metric flex gap-2">
            <Metric label="Feed" value={liveMode === "provider" ? "Real" : "Mock"} delta={lastUpdated ?? "syncing"} tone={liveMode === "provider" ? "up" : "neutral"} />
          </div>
          <div className="mobile-page-select hidden w-full">
            <select
              value={activeSection}
              onChange={(event) => openSection(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#14151a] px-4 text-sm font-black text-white outline-none"
              aria-label="\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e2b\u0e19\u0e49\u0e32"
            >
              {mobileMenuItems.map((item) => (
                <option key={item.label} value={item.label}>{item.thai} - {item.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mobile-section-pills mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {mobileSections.map((section) => (
            <button
              key={section}
              type="button"
              data-mobile-section={section}
              onPointerUp={() => handleTouchSection(section)}
              onClick={() => openSection(section)}
              className={`mobile-nav-trigger shrink-0 rounded-full border px-4 py-2.5 text-sm font-extrabold ${activeSection === section ? "border-violet-400/35 bg-violet-500/26 text-white" : "border-white/10 bg-white/[0.045] text-slate-300"}`}
            >
              {section}
            </button>
          ))}
        </div>
        <SectionView />
      </div>
      <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#202124]/96 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_42px_rgba(0,0,0,.28)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {bottomNav.map((item) => {
            const active = activeSection === item.label;
            return (
              <a
                key={item.label}
                href={item.label === "Menu" ? "/?menu=1" : `/?section=${encodeURIComponent(item.label)}`}
                data-mobile-section={item.label}
                onPointerUp={() => handleTouchSection(item.label)}
                onClick={() => openSection(item.label)}
                className={`mobile-nav-trigger flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-black transition ${
                  active || (item.label === "Menu" && mobileMenuOpen)
                    ? "border-violet-400/28 bg-violet-500/20 text-white"
                    : "border-transparent text-slate-500"
                }`}
              >
                <item.icon size={21} strokeWidth={2.6} />
                <span>{item.shortLabel}</span>
              </a>
            );
          })}
        </div>
      </nav>
      {mobileMenuOpen ? (
        <div className="mobile-menu-overlay fixed inset-0 z-[60] bg-black/64 p-3 backdrop-blur-md lg:hidden">
          <div className="ml-auto flex h-full max-h-[calc(100vh-24px)] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#15161b] shadow-[0_24px_80px_rgba(0,0,0,.5)]">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-300">AstraQuant</p>
                <h3 className="text-xl font-black text-white">\u0e40\u0e21\u0e19\u0e39\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14</h3>
              </div>
              <button
                type="button"
                onPointerUp={() => setMobileMenuOpen(false)}
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-nav-trigger flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white"
                aria-label="\u0e1b\u0e34\u0e14\u0e40\u0e21\u0e19\u0e39"
              >
                <X size={22} />
              </button>
            </div>
            <div className="grid flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto p-4">
              {mobileMenuItems.map((item) => {
                const active = activeSection === item.label;
                return (
                  <a
                    key={item.label}
                    href={`/?section=${encodeURIComponent(item.label)}`}
                    data-mobile-section={item.label}
                    onPointerUp={() => handleTouchSection(item.label)}
                    onClick={() => openSection(item.label)}
                    className={`mobile-nav-trigger flex min-h-[86px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-violet-400/35 bg-violet-500/22 text-white"
                        : "border-white/10 bg-white/[0.045] text-slate-300"
                    }`}
                  >
                    <item.icon size={22} strokeWidth={2.6} />
                    <span className="text-sm font-black">{item.thai}</span>
                    <span className="text-[11px] font-bold text-slate-500">{item.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
