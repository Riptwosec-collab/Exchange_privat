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
    card: { background: "linear-gradient(135deg, rgba(193,18,31,.30), rgba(216,180,106,.12)), #1a0b10", borderColor: "rgba(216,180,106,.42)", color: "#ffd6d3", boxShadow: "0 16px 42px rgba(193,18,31,.18)" },
    mark: { background: "rgba(193,18,31,.18)", color: "#ffd6d3" },
    eyebrow: { color: "#ffd6d3" },
    title: { color: "#fff3f0" },
    notify: { background: "rgba(193,18,31,.16)", borderColor: "rgba(216,180,106,.3)", color: "#ffd6d3" }
  },
  Space: {
    card: { background: "linear-gradient(135deg, rgba(37,99,235,.28), rgba(125,211,252,.10)), #071326", borderColor: "rgba(96,165,250,.44)", color: "#bfdbfe", boxShadow: "0 16px 44px rgba(37,99,235,.18)" },
    mark: { background: "rgba(37,99,235,.18)", color: "#bfdbfe" },
    eyebrow: { color: "#bfdbfe" },
    title: { color: "#eff6ff" },
    notify: { background: "rgba(37,99,235,.16)", borderColor: "rgba(96,165,250,.34)", color: "#bfdbfe" }
  },
  Luxury: {
    card: { background: "linear-gradient(135deg, rgba(214,168,79,.25), rgba(127,29,29,.18)), #1e140b", borderColor: "rgba(214,168,79,.45)", color: "#fff2c6", boxShadow: "0 18px 44px rgba(214,168,79,.16)" },
    mark: { background: "rgba(214,168,79,.16)", color: "#fff2c6" },
    eyebrow: { color: "#fff2c6" },
    title: { color: "#fff7df" },
    notify: { background: "rgba(214,168,79,.16)", borderColor: "rgba(214,168,79,.32)", color: "#fff2c6" }
  },
  Obsidian: {
    card: { background: "linear-gradient(135deg, rgba(245,158,11,.22), rgba(254,243,199,.08)), #080706", borderColor: "rgba(245,158,11,.42)", color: "#fde68a", boxShadow: "0 18px 48px rgba(245,158,11,.15)" },
    mark: { background: "rgba(245,158,11,.16)", color: "#fde68a" },
    eyebrow: { color: "#fde68a" },
    title: { color: "#fff7df" },
    notify: { background: "rgba(245,158,11,.14)", borderColor: "rgba(245,158,11,.32)", color: "#fde68a" }
  },
  Pearl: {
    card: { background: "linear-gradient(135deg, rgba(168,98,18,.14), rgba(15,107,80,.07)), #ead9bd", borderColor: "rgba(93,72,45,.28)", color: "#5f3410", boxShadow: "0 16px 38px rgba(93,72,45,.18)" },
    mark: { background: "rgba(93,72,45,.1)", color: "#5f3410" },
    eyebrow: { color: "#5f3410" },
    title: { color: "#1f2933" },
    notify: { background: "rgba(168,98,18,.1)", borderColor: "rgba(93,72,45,.24)", color: "#5f3410" }
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
