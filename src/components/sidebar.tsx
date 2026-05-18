"use client";

import { Bell, Bot, CalendarDays, ChartCandlestick, Flame, Globe2, LayoutDashboard, LineChart, Lock, Network, Newspaper, Radar, Settings, WalletCards } from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Charts", icon: ChartCandlestick },
  { label: "Multi Chart", icon: LineChart },
  { label: "News AI", icon: Newspaper },
  { label: "Portfolio", icon: WalletCards },
  { label: "Screener", icon: Radar },
  { label: "Heatmap", icon: Flame },
  { label: "Calendar", icon: CalendarDays },
  { label: "Whales", icon: Network },
  { label: "Copilot", icon: Bot },
  { label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="glass fixed left-3 top-3 z-40 hidden h-[calc(100vh-24px)] w-[78px] rounded-lg p-3 lg:flex lg:flex-col">
      <div className="flex h-12 items-center justify-center rounded-md bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/20"><Globe2 size={24} /></div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {nav.map((item, index) => (
          <motion.button key={item.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }} title={item.label} className={`flex h-11 items-center justify-center rounded-md border text-slate-400 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 ${index === 0 ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100" : "border-transparent"}`}>
            <item.icon size={20} />
          </motion.button>
        ))}
      </nav>
      <button title="Secure dashboard" className="flex h-11 items-center justify-center rounded-md border border-white/10 text-slate-400"><Lock size={18} /></button>
      <button title="Notification center" className="mt-2 flex h-11 items-center justify-center rounded-md border border-purple-300/25 bg-purple-400/10 text-purple-100"><Bell size={18} /></button>
    </aside>
  );
}
