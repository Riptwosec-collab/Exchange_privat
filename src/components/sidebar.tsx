"use client";

import {
  Bell,
  Bot,
  ChartCandlestick,
  Flame,
  Gauge,
  Globe2,
  Grid3X3,
  LayoutDashboard,
  ListChecks,
  LineChart,
  Lock,
  Newspaper,
  Radar,
  Settings,
  WalletCards
} from "lucide-react";
import { motion } from "framer-motion";
import { useMarketStore } from "@/store/market-store";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Watchlist", icon: ListChecks },
  { label: "Charts", icon: ChartCandlestick },
  { label: "Multi Chart", icon: LineChart },
  { label: "9 Charts", icon: Grid3X3 },
  { label: "Top Movers", icon: Gauge },
  { label: "News AI", icon: Newspaper },
  { label: "Portfolio", icon: WalletCards },
  { label: "Screener", icon: Radar },
  { label: "Heatmap", icon: Flame },
  { label: "Market Intelligence Center", icon: Gauge },
  { label: "Copilot", icon: Bot },
  { label: "Settings", icon: Settings }
];

export function Sidebar() {
  const { activeSection, setActiveSection } = useMarketStore();

  return (
    <aside className="glass fixed left-3 top-3 z-40 hidden h-[calc(100vh-24px)] w-[78px] rounded-lg p-3 lg:flex lg:flex-col">
      <div className="flex h-12 items-center justify-center rounded-md bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/20">
        <Globe2 size={24} />
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {nav.map((item, index) => {
          const active = activeSection === item.label;
          return (
          <motion.button
            key={item.label}
            onClick={() => setActiveSection(item.label)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            title={item.label}
            className={`flex h-11 items-center justify-center rounded-md border text-slate-400 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 ${
              active ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100" : "border-transparent"
            }`}
          >
            <item.icon size={20} />
          </motion.button>
          );
        })}
      </nav>
      <button title="Secure dashboard" className="flex h-11 items-center justify-center rounded-md border border-white/10 text-slate-400">
        <Lock size={18} />
      </button>
      <button title="Notification center" className="mt-2 flex h-11 items-center justify-center rounded-md border border-purple-300/25 bg-purple-400/10 text-purple-100">
        <Bell size={18} />
      </button>
    </aside>
  );
}
