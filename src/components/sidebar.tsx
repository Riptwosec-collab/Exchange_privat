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
    <aside className="glass fixed left-4 top-4 z-40 hidden h-[calc(100vh-32px)] w-[260px] rounded-2xl p-4 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 rounded-2xl border border-violet-400/18 bg-violet-500/14 p-3 text-violet-200">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black/20">
          <Globe2 size={23} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-300">AstraQuant</p>
          <p className="truncate text-sm font-extrabold text-white">Market App</p>
        </div>
      </div>
      <nav className="mt-5 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
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
            className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-sm font-bold transition ${
              active
                ? "border-violet-400/28 bg-violet-500/22 text-white"
                : "border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.045] hover:text-white"
            }`}
          >
            <item.icon size={20} />
            <span className="truncate">{item.label}</span>
          </motion.button>
          );
        })}
      </nav>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
        <button title="Secure dashboard" className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.07]">
          <Lock size={18} />
        </button>
        <button title="Notification center" className="flex h-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/16 text-violet-200 transition hover:bg-violet-500/22">
          <Bell size={18} />
        </button>
      </div>
    </aside>
  );
}
