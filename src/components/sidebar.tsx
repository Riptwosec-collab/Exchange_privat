"use client";

import type { CSSProperties } from "react";
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
import { useMarketStore, type AppTheme } from "@/store/market-store";

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

const brandThemeStyles: Record<AppTheme, {
  card: CSSProperties;
  mark: CSSProperties;
  eyebrow: CSSProperties;
  title: CSSProperties;
  notify: CSSProperties;
}> = {
  Technology: {
    card: { background: "linear-gradient(135deg, rgba(0,184,255,.24), rgba(45,248,200,.12)), #0b1424", borderColor: "rgba(0,184,255,.42)", color: "#b8eeff", boxShadow: "0 16px 38px rgba(0,184,255,.16)" },
    mark: { background: "rgba(0,184,255,.16)", color: "#b8eeff" },
    eyebrow: { color: "#b8eeff" },
    title: { color: "#effaff" },
    notify: { background: "rgba(0,184,255,.16)", borderColor: "rgba(0,184,255,.32)", color: "#b8eeff" }
  },
  Space: {
    card: { background: "linear-gradient(135deg, rgba(56,189,248,.22), rgba(245,158,11,.1)), #071225", borderColor: "rgba(56,189,248,.38)", color: "#d9f4ff", boxShadow: "0 16px 42px rgba(56,189,248,.14)" },
    mark: { background: "rgba(248,250,252,.11)", color: "#d9f4ff" },
    eyebrow: { color: "#d9f4ff" },
    title: { color: "#eef6ff" },
    notify: { background: "rgba(56,189,248,.15)", borderColor: "rgba(56,189,248,.3)", color: "#d9f4ff" }
  },
  Luxury: {
    card: { background: "linear-gradient(135deg, rgba(214,168,79,.25), rgba(127,29,29,.18)), #1e140b", borderColor: "rgba(214,168,79,.45)", color: "#fff2c6", boxShadow: "0 18px 44px rgba(214,168,79,.16)" },
    mark: { background: "rgba(214,168,79,.16)", color: "#fff2c6" },
    eyebrow: { color: "#fff2c6" },
    title: { color: "#fff7df" },
    notify: { background: "rgba(214,168,79,.16)", borderColor: "rgba(214,168,79,.32)", color: "#fff2c6" }
  },
  Obsidian: {
    card: { background: "linear-gradient(135deg, rgba(250,204,21,.18), rgba(0,255,136,.1)), #070707", borderColor: "rgba(250,204,21,.36)", color: "#fff3a3", boxShadow: "0 18px 48px rgba(250,204,21,.13)" },
    mark: { background: "rgba(250,204,21,.14)", color: "#fff3a3" },
    eyebrow: { color: "#fff3a3" },
    title: { color: "#f8fafc" },
    notify: { background: "rgba(250,204,21,.14)", borderColor: "rgba(250,204,21,.3)", color: "#fff3a3" }
  },
  Pearl: {
    card: { background: "linear-gradient(135deg, rgba(194,122,25,.16), rgba(4,120,87,.08)), #fff7e8", borderColor: "rgba(117,89,50,.28)", color: "#7a4310", boxShadow: "0 16px 38px rgba(117,89,50,.16)" },
    mark: { background: "rgba(117,89,50,.08)", color: "#7a4310" },
    eyebrow: { color: "#7a4310" },
    title: { color: "#1f2933" },
    notify: { background: "rgba(194,122,25,.12)", borderColor: "rgba(117,89,50,.24)", color: "#7a4310" }
  }
};

export function Sidebar() {
  const { activeSection, appTheme, setActiveSection } = useMarketStore();
  const brandStyle = brandThemeStyles[appTheme];

  function openSection(section: string) {
    setActiveSection(section);
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.set("section", section);
    url.searchParams.delete("menu");
    window.history.replaceState(null, "", url);
  }

  return (
    <aside className="glass fixed left-4 top-4 z-40 hidden h-[calc(100vh-32px)] w-[260px] rounded-2xl p-4 lg:flex lg:flex-col">
      <div className="brand-card flex items-center gap-3 rounded-2xl border p-3" style={brandStyle.card}>
        <div className="brand-mark flex h-11 w-11 items-center justify-center rounded-xl" style={brandStyle.mark}>
          <Globe2 size={23} />
        </div>
        <div className="min-w-0">
          <p className="brand-eyebrow text-xs font-black uppercase tracking-[0.14em]" style={brandStyle.eyebrow}>AstraQuant</p>
          <p className="truncate text-sm font-extrabold text-white" style={brandStyle.title}>Market App</p>
        </div>
      </div>
      <nav className="mt-5 flex flex-1 flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
        {nav.map((item, index) => {
          const active = activeSection === item.label;
          return (
          <motion.button
            key={item.label}
            onClick={() => openSection(item.label)}
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
        <button title="Notification center" className="flex h-11 items-center justify-center rounded-xl border transition" style={brandStyle.notify}>
          <Bell size={18} />
        </button>
      </div>
    </aside>
  );
}
