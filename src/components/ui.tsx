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
  const color = tone === "up" ? "text-[#37e47b]" : tone === "down" ? "text-[#ff7a92]" : "text-[#9db7ff]";

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
    up: "border-[#22c55e]/24 bg-[#22c55e]/14 text-[#b5ffd2]",
    down: "border-[#fb7185]/24 bg-[#fb7185]/15 text-[#ffc0ca]",
    neutral: "border-slate-400/18 bg-slate-400/12 text-slate-200",
    info: "border-[#2962ff]/28 bg-[#2962ff]/18 text-[#b9c8ff]"
  };

  return <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-extrabold leading-tight ${styles[tone]}`}>{children}</span>;
}
