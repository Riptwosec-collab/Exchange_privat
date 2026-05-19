import type { ReactNode } from "react";

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass rounded-lg ${className}`}>{children}</section>;
}

export function Metric({
  label,
  value,
  delta,
  tone = "neutral"
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "up" | "down" | "neutral";
}) {
  const color = tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-cyan-100";

  return (
    <div className="metric-card min-w-0 rounded-md border border-white/10 bg-white/[0.035] p-3">
      <p className="truncate text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <div className="mt-2 flex min-w-0 flex-wrap items-end justify-between gap-2">
        <strong className="metric-value min-w-0 max-w-full font-mono text-white">{value}</strong>
        {delta ? <span className={`metric-delta min-w-0 max-w-full font-mono ${color}`}>{delta}</span> : null}
      </div>
    </div>
  );
}

export function StatusPill({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "up" | "down" | "neutral" | "info";
}) {
  const styles = {
    up: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    down: "border-rose-300/30 bg-rose-400/10 text-rose-200",
    neutral: "border-slate-300/20 bg-slate-400/10 text-slate-200",
    info: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100"
  };

  return <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-xs leading-tight ${styles[tone]}`}>{children}</span>;
}
