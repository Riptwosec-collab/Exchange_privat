"use client";

import { Search, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-[#101116]/88 px-4 py-3 backdrop-blur-xl lg:ml-[292px] lg:px-6">
      <div className="mobile-header-wrap flex flex-wrap items-center gap-3">
        <div className="min-w-[180px] flex-1">
          <div className="mobile-eyebrow flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.16em] text-violet-300">
            <Sparkles size={14} />
            AI Market Intelligence
          </div>
          <h1 className="neon-text mobile-app-title mt-1 text-2xl font-black text-white md:text-3xl">AstraQuant</h1>
        </div>
        <div className="mobile-search order-3 flex h-11 w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#18191f] px-3 text-slate-400 md:order-none md:w-[360px]">
          <Search size={18} />
          <input className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" placeholder="Search ticker, news, strategy..." />
        </div>
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mobile-status-pill flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-2 text-sm font-bold text-emerald-300"
        >
          <Wifi size={15} />
          Live
        </motion.div>
        <div className="mobile-status-pill flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/18 px-3 py-2 text-sm font-bold text-violet-200">
          <ShieldCheck size={15} />
          Protected
        </div>
      </div>
    </header>
  );
}
