import type { ReactNode } from "react";

export function Panel({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`glass rounded-xl text-slate-200 ${className}`}>{children}</section>;
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
  const color = tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-violet-200";

  return (
    <div className="metric-card min-w-0 rounded-xl border p-3.5">
      <p className="truncate text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
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
    up: "border-emerald-400/20 bg-emerald-400/13 text-emerald-300",
    down: "border-rose-400/20 bg-rose-400/16 text-rose-300",
    neutral: "border-slate-400/18 bg-slate-400/12 text-slate-200",
    info: "border-violet-400/24 bg-violet-500/22 text-violet-200"
  };

  return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-extrabold leading-tight ${styles[tone]}`}>{children}</span>;
}
