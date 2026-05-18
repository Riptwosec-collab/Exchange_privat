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

export default function Home() {
  return (
    <main className="terminal-grid min-h-screen pb-8">
      <Sidebar />
      <Header />
      <MarketTicker />
      <div className="px-4 py-5 lg:ml-[102px] lg:px-6">
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
      </div>
      <CopilotWidget />
    </main>
  );
}
