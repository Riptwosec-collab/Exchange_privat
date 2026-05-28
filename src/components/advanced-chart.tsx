"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries, LineStyle, LineType, type Time } from "lightweight-charts";
import { Activity, BarChart3, Bot, ChevronDown, ChevronUp, Maximize2, PenLine, RefreshCw, Share2, TrendingDown, TrendingUp, Waves, type LucideIcon } from "lucide-react";
import { allStockSymbols, stockUniverse } from "@/lib/market-utils";
import { candles as fallbackCandles } from "@/lib/mock-data";
import { calculateTechnicals, formatIndicator } from "@/lib/technical-indicators";
import type { Candle } from "@/lib/types";
import { useMarketStore } from "@/store/market-store";

const timeframes = ["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"];
const chartModes = [
  { key: "Candles", label: "Candles" },
  { key: "Bars", label: "Bars" },
  { key: "Line", label: "Line" },
  { key: "Area", label: "Area" },
  { key: "Baseline", label: "Baseline" },
  { key: "Smooth", label: "Smooth" },
  { key: "Step", label: "Step" },
  { key: "Hollow", label: "Hollow" },
  { key: "Trend", label: "Trend" },
  { key: "Volume", label: "Volume" }
] as const;

type ChartMode = (typeof chartModes)[number]["key"];
type IndicatorKey = "levels" | "ad" | "rsi" | "macd" | "ema" | "volume" | "atr" | "adx";
type IndicatorVisibility = Record<IndicatorKey, boolean>;
const tradingThaiFont = "\"Noto Sans Thai\", \"IBM Plex Sans Thai\", \"LINE Seed Sans TH\", Inter, \"Segoe UI\", Arial, sans-serif";
const freshGreen = "#68df7c";
const chartRed = "#f385ad";
const freshGreenSoft = "rgba(104, 223, 124, 0.28)";
const freshGreenFaint = "rgba(104, 223, 124, 0.08)";
const afterHoursLine = "rgba(185, 140, 255, 0.96)";
const afterHoursTop = "rgba(185, 140, 255, 0.22)";
const afterHoursBottom = "rgba(185, 140, 255, 0.04)";

const defaultIndicatorVisibility: IndicatorVisibility = {
  levels: true,
  ad: true,
  rsi: true,
  macd: true,
  ema: true,
  volume: true,
  atr: true,
  adx: true
};

function visibleRangePadding(pointCount: number) {
  if (pointCount <= 8) return 0.5;
  if (pointCount <= 24) return 1;
  return Math.min(8, Math.max(2, pointCount * 0.03));
}

function formatCompact(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: value >= 1000 ? 1 : 0 }).format(value);
}

function signed(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function toneClass(value: number) {
  if (value > 0) return "text-[#18e08a]";
  if (value < 0) return "text-[#ff2f55]";
  return "text-slate-300";
}

function badgeClass(value: number) {
  if (value > 0) return "border-[#18e08a]/35 bg-[#18e08a]/12 text-[#9ff7c9]";
  if (value < 0) return "border-[#ff2f55]/35 bg-[#ff2f55]/12 text-[#ff9db6]";
  return "border-white/10 bg-white/[0.045] text-slate-300";
}

function statusTone(score: number, inverse = false) {
  const high = inverse ? score <= 35 : score >= 65;
  const low = inverse ? score >= 65 : score <= 35;
  if (high) return "text-[#18e08a]";
  if (low) return "text-[#ff2f55]";
  return "text-amber-200";
}

function latestAfterHours(symbol: string, close: number, trendPercent: number) {
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const direction = trendPercent >= 0 ? 1 : seed % 2 === 0 ? 1 : -1;
  const percent = Number((direction * (0.11 + (seed % 8) * 0.09)).toFixed(2));
  return { percent, price: Number((close * (1 + percent / 100)).toFixed(2)) };
}

function nextAfterHoursTime(time: Candle["time"], step: number): Time {
  if (typeof time === "number") return (time + step * 30 * 60) as Time;
  const date = new Date(time);
  if (!Number.isNaN(date.getTime())) {
    date.setDate(date.getDate() + step);
    return date.toISOString().slice(0, 10) as Time;
  }
  return time as Time;
}

function buildAfterHoursSeries(candles: Candle[], symbol: string) {
  const latest = candles.at(-1);
  const first = candles[0] ?? latest;
  if (!latest || !first) return [];
  const trendPercent = ((latest.close - first.close) / Math.max(0.01, first.close)) * 100;
  const afterHours = latestAfterHours(symbol, latest.close, trendPercent);
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return Array.from({ length: 9 }, (_, index) => {
    if (index === 0) return { time: latest.time as Time, value: latest.close };
    const progress = index / 8;
    const wave = Math.sin(index + seed) * latest.close * 0.0012;
    const value = latest.close + (afterHours.price - latest.close) * progress + wave;
    return { time: nextAfterHoursTime(latest.time, index), value: Number(value.toFixed(2)) };
  });
}

function calculateAtr(candles: Candle[], period = 14) {
  if (candles.length < 2) return null;
  const trueRanges = candles.slice(1).map((candle, index) => {
    const previousClose = candles[index].close;
    return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
  });
  const recent = trueRanges.slice(-period);
  return recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : null;
}

function calculateStochastic(candles: Candle[], period = 14) {
  const recent = candles.slice(-period);
  const latest = candles.at(-1);
  if (!recent.length || !latest) return null;
  const high = Math.max(...recent.map((candle) => candle.high));
  const low = Math.min(...recent.map((candle) => candle.low));
  if (high === low) return 50;
  return ((latest.close - low) / (high - low)) * 100;
}

function calculateEmaValue(candles: Candle[], period = 20) {
  if (!candles.length) return null;
  const multiplier = 2 / (period + 1);
  return candles.reduce((ema, candle, index) => (index === 0 ? candle.close : candle.close * multiplier + ema * (1 - multiplier)), candles[0].close);
}

function calculateEmaSeries(values: number[], period: number) {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const series: number[] = [];
  values.forEach((value, index) => {
    series.push(index === 0 ? value : value * multiplier + series[index - 1] * (1 - multiplier));
  });
  return series;
}

function calculateRsiSeries(candles: Candle[], period = 14) {
  const closes = candles.map((candle) => candle.close);
  return closes.map((close, index) => {
    if (index < period) return null;
    const changes = closes.slice(index - period + 1, index + 1).map((value, changeIndex, values) => changeIndex === 0 ? 0 : value - values[changeIndex - 1]).slice(1);
    const gains = changes.map((change) => Math.max(0, change));
    const losses = changes.map((change) => Math.max(0, -change));
    const averageGain = gains.reduce((sum, value) => sum + value, 0) / gains.length;
    const averageLoss = losses.reduce((sum, value) => sum + value, 0) / losses.length;
    if (averageLoss === 0) return 100;
    const rs = averageGain / averageLoss;
    return 100 - 100 / (1 + rs);
  });
}

function calculateMacdSeries(candles: Candle[]) {
  const closes = candles.map((candle) => candle.close);
  const ema12 = calculateEmaSeries(closes, 12);
  const ema26 = calculateEmaSeries(closes, 26);
  const macd = closes.map((_, index) => ema12[index] - ema26[index]);
  const signal = calculateEmaSeries(macd, 9);
  const histogram = macd.map((value, index) => value - signal[index]);
  return { macd, signal, histogram };
}

function calculateAtrSeries(candles: Candle[], period = 14) {
  return candles.map((candle, index) => {
    if (index === 0) return null;
    const previousClose = candles[index - 1].close;
    const recent = candles.slice(Math.max(1, index - period + 1), index + 1).map((row, rowIndex, rows) => {
      const absoluteIndex = index - rows.length + rowIndex + 1;
      const prevClose = candles[absoluteIndex - 1]?.close ?? previousClose;
      return Math.max(row.high - row.low, Math.abs(row.high - prevClose), Math.abs(row.low - prevClose));
    });
    return recent.reduce((sum, value) => sum + value, 0) / recent.length;
  });
}

function calculateAdxSeries(candles: Candle[], period = 14) {
  return candles.map((_, index) => index < period + 1 ? null : calculateAdx(candles.slice(0, index + 1), period));
}

function calculateAccumulationDistribution(candles: Candle[]) {
  if (!candles.length) return { value: null, previous: null };
  let running = 0;
  const series = candles.map((candle) => {
    const range = candle.high - candle.low;
    const moneyFlowMultiplier = range === 0 ? 0 : ((candle.close - candle.low) - (candle.high - candle.close)) / range;
    running += moneyFlowMultiplier * candle.volume;
    return running;
  });
  return { value: series.at(-1) ?? null, previous: series.at(-6) ?? series.at(-2) ?? null };
}

function calculateAccumulationDistributionSeries(candles: Candle[]) {
  let running = 0;
  return candles.map((candle) => {
    const range = candle.high - candle.low;
    const moneyFlowMultiplier = range === 0 ? 0 : ((candle.close - candle.low) - (candle.high - candle.close)) / range;
    running += moneyFlowMultiplier * candle.volume;
    return running;
  });
}

function calculateAdx(candles: Candle[], period = 14) {
  if (candles.length <= period + 1) return null;
  const rows = candles.slice(1).map((candle, index) => {
    const previous = candles[index];
    const upMove = candle.high - previous.high;
    const downMove = previous.low - candle.low;
    const plusDm = upMove > downMove && upMove > 0 ? upMove : 0;
    const minusDm = downMove > upMove && downMove > 0 ? downMove : 0;
    const trueRange = Math.max(candle.high - candle.low, Math.abs(candle.high - previous.close), Math.abs(candle.low - previous.close));
    return { plusDm, minusDm, trueRange };
  });
  const recent = rows.slice(-period);
  const tr = recent.reduce((sum, row) => sum + row.trueRange, 0);
  if (tr === 0) return null;
  const plusDi = 100 * (recent.reduce((sum, row) => sum + row.plusDm, 0) / tr);
  const minusDi = 100 * (recent.reduce((sum, row) => sum + row.minusDm, 0) / tr);
  const totalDi = plusDi + minusDi;
  return totalDi === 0 ? 0 : (Math.abs(plusDi - minusDi) / totalDi) * 100;
}

function describeAdx(value: number | null) {
  if (value === null) return "รอข้อมูล";
  if (value >= 40) return "Trend แข็งแรงมาก";
  if (value >= 25) return "Trend แข็งแรง";
  if (value >= 20) return "เริ่มมี trend";
  return "Trend ยังอ่อน";
}

function calculateDashboardMetrics(candles: Candle[], symbol: string) {
  const latest = candles.at(-1);
  const previous = candles.at(-2) ?? latest;
  const first = candles[0] ?? latest;
  const recent = candles.slice(-20);
  const previousRecent = candles.slice(-40, -20);
  const averageVolume = recent.length ? recent.reduce((sum, candle) => sum + candle.volume, 0) / recent.length : 0;
  const previousAverageVolume = previousRecent.length ? previousRecent.reduce((sum, candle) => sum + candle.volume, 0) / previousRecent.length : averageVolume;
  const currentVolume = latest?.volume ?? 0;
  const rvol = averageVolume ? currentVolume / averageVolume : 0;
  const upVolume = recent.filter((candle) => candle.close >= candle.open).reduce((sum, candle) => sum + candle.volume, 0);
  const totalVolume = Math.max(1, recent.reduce((sum, candle) => sum + candle.volume, 0));
  const buyPressure = (upVolume / totalVolume) * 100;
  const sellPressure = 100 - buyPressure;
  const dayChange = latest && previous ? latest.close - previous.close : 0;
  const trendPercent = latest && first ? ((latest.close - first.close) / Math.max(0.01, first.close)) * 100 : 0;
  const afterHours = latest ? latestAfterHours(symbol, latest.close, trendPercent) : { price: 0, percent: 0 };
  const atr = calculateAtr(candles);
  const stochastic = calculateStochastic(candles);
  const ema20 = calculateEmaValue(candles, 20);
  const ema50 = calculateEmaValue(candles, 50);
  const ad = calculateAccumulationDistribution(candles);
  const adx = calculateAdx(candles);
  const volumeSpike = rvol >= 1.8;
  const unusualVolume = previousAverageVolume ? currentVolume / previousAverageVolume >= 1.5 : false;
  const darkPoolVolume = Math.round(currentVolume * (0.11 + (symbol.length % 5) * 0.018));
  const volumeScore = Math.min(100, Math.round(rvol * 36 + Math.abs(buyPressure - 50) * 0.7));
  const momentumScore = Math.max(0, Math.min(100, Math.round(50 + trendPercent * 4 + dayChange * 1.5)));
  const breakoutProbability = Math.max(5, Math.min(95, Math.round(volumeScore * 0.42 + momentumScore * 0.4 + (rvol > 1.4 ? 12 : 0))));
  const riskLevel = Math.max(5, Math.min(95, Math.round((atr && latest ? (atr / latest.close) * 900 : 25) + (sellPressure > 55 ? 18 : 4))));
  const smartMoneyFlow = Math.max(0, Math.min(100, Math.round(buyPressure * 0.58 + Math.min(40, rvol * 12))));

  return {
    latest,
    previous,
    currentVolume,
    averageVolume,
    buyPressure,
    sellPressure,
    rvol,
    volumeSpike,
    unusualVolume,
    darkPoolVolume,
    atr,
    stochastic,
    ema20,
    ema50,
    ad,
    adx,
    afterHours,
    trendStrength: Math.max(0, Math.min(100, Math.round(Math.abs(trendPercent) * 6 + volumeScore * 0.35))),
    momentumScore,
    breakoutProbability,
    riskLevel,
    smartMoneyFlow
  };
}

type AiMetric = {
  label: string;
  value: string;
  score: number;
  inverse: boolean;
  Icon: LucideIcon;
};

type AdvancedIndicatorItem = {
  key: string;
  title: string;
  value: string;
  detail: string;
  tone: string;
};

type HoverQuote = {
  x: number;
  y: number;
  dateTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

function timeKey(time: Time | string | number | undefined) {
  if (time === undefined) return "";
  if (typeof time === "string" || typeof time === "number") return String(time);
  return `${time.year}-${String(time.month).padStart(2, "0")}-${String(time.day).padStart(2, "0")}`;
}

function formatCandleDateTime(time: string | number | Time | undefined) {
  if (time === undefined) return "-";
  const date =
    typeof time === "number"
      ? new Date(time * 1000)
      : typeof time === "string"
        ? new Date(time)
        : new Date(time.year, time.month - 1, time.day);
  if (Number.isNaN(date.getTime())) return String(time);
  return date.toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  });
}

function candleDate(time: string | number | Time | undefined) {
  if (time === undefined) return null;
  const date =
    typeof time === "number"
      ? new Date(time * 1000)
      : typeof time === "string"
        ? new Date(time)
        : new Date(time.year, time.month - 1, time.day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildTimeAxis(candles: Candle[]) {
  const count = Math.min(8, candles.length);
  if (!count) return [];
  const indexes = Array.from({ length: count }, (_, index) => Math.round((index / Math.max(1, count - 1)) * (candles.length - 1)));
  return Array.from(new Set(indexes)).map((index) => {
    const date = candleDate(candles[index]?.time);
    if (!date) return null;
    const isYearStart = index === 0 || date.getMonth() === 0;
    return {
      key: `${index}-${date.getTime()}`,
      label: isYearStart ? date.toLocaleDateString("th-TH", { year: "numeric", timeZone: "Asia/Bangkok" }) : date.toLocaleDateString("th-TH", { month: "short", timeZone: "Asia/Bangkok" }),
      full: date.toLocaleString("th-TH", { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })
    };
  }).filter((item): item is { key: string; label: string; full: string } => Boolean(item));
}

function buildPolyline(values: Array<number | null>, width: number, height: number, min?: number, max?: number) {
  const finite = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (!finite.length) return "";
  const low = min ?? Math.min(...finite);
  const high = max ?? Math.max(...finite);
  const range = Math.max(0.0001, high - low);
  return values
    .map((value, index) => {
      if (value === null || !Number.isFinite(value)) return "";
      const x = (index / Math.max(1, values.length - 1)) * width;
      const y = height - ((value - low) / range) * height;
      return `${index === 0 || values[index - 1] === null ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .filter(Boolean)
    .join(" ");
}

function latestFinitePoint(values: Array<number | null>, width: number, height: number, min?: number, max?: number) {
  const finite = values
    .map((value, index) => ({ value, index }))
    .filter((point): point is { value: number; index: number } => point.value !== null && Number.isFinite(point.value));
  if (!finite.length) return null;
  const latest = finite.at(-1);
  if (!latest) return null;
  const low = min ?? Math.min(...finite.map((point) => point.value));
  const high = max ?? Math.max(...finite.map((point) => point.value));
  const range = Math.max(0.0001, high - low);
  return {
    x: (latest.index / Math.max(1, values.length - 1)) * width,
    y: height - ((latest.value - low) / range) * height,
    value: latest.value
  };
}

function EndValueLabel({ values, label, color, width = 1000, height = 150, min, max, formatter = (value) => formatIndicator(value, 2) }: { values: Array<number | null>; label: string; color: string; width?: number; height?: number; min?: number; max?: number; formatter?: (value: number) => string }) {
  const point = latestFinitePoint(values, width, height, min, max);
  if (!point) return null;
  const y = Math.max(12, Math.min(height - 12, point.y));
  return (
    <g>
      <circle cx={point.x} cy={y} r="4" fill={color} stroke="#0b0d0f" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <rect x="878" y={y - 10} width="118" height="20" rx="4" fill={color} opacity="0.92" />
      <text x="884" y={y + 4} fill={color === "#facc15" || color === "#f59e0b" || color === "#22d3ee" ? "#020617" : "#ffffff"} fontSize="11" fontFamily="monospace">{label} {formatter(point.value)}</text>
    </g>
  );
}

function IndicatorPane({ title, rightLabels, children, height = 150 }: { title: string; rightLabels: Array<{ label: string; className: string }>; children: ReactNode; height?: number }) {
  return (
    <div className="relative overflow-hidden border-t border-white/10 bg-[#0b0d0f]" style={{ height }}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:64px_36px]" />
      <div className="absolute left-2 top-2 z-10 font-mono text-[11px] text-slate-400">{title}</div>
      <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col items-end gap-1">
        {rightLabels.map((item) => (
          <span key={item.label} className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${item.className}`}>{item.label}</span>
        ))}
      </div>
      <svg viewBox="0 0 1000 150" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        {children}
      </svg>
    </div>
  );
}

function ExactTradingGraph({ candles, symbol, compact = false }: { candles: Candle[]; symbol: string; compact?: boolean }) {
  const width = 1000;
  const mainHeight = compact ? 310 : 430;
  const rsiHeight = compact ? 0 : 170;
  const pmoHeight = compact ? 0 : 170;
  const totalHeight = mainHeight + rsiHeight + pmoHeight;
  const values = candles.map((candle) => candle.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(0.01, (max - min) * 0.14);
  const low = min - pad;
  const high = max + pad;
  const latest = candles.at(-1);
  const previous = candles.at(-2) ?? latest;
  const change = latest && previous ? latest.close - previous.close : 0;
  const up = change >= 0;
  const lineColor = up ? "#56c7a4" : "#f08aad";
  const areaColor = up ? "rgba(86,199,164,.18)" : "rgba(240,138,173,.20)";
  const linePath = buildPolyline(values, width, mainHeight, low, high);
  const areaPath = `${linePath} L ${width} ${mainHeight} L 0 ${mainHeight} Z`;
  const volumeMax = Math.max(1, ...candles.map((candle) => candle.volume));
  const rsi = calculateRsiSeries(candles);
  const rsiMa = calculateEmaSeries(rsi.map((value) => value ?? 50), 9);
  const pmo = calculateMacdSeries(candles);
  const pmoMax = Math.max(0.01, ...pmo.macd.map(Math.abs), ...pmo.signal.map(Math.abs));
  const latestRsi = rsi.at(-1) ?? 0;
  const latestRsiMa = rsiMa.at(-1) ?? 0;
  const latestPmo = pmo.macd.at(-1) ?? 0;
  const latestSignal = pmo.signal.at(-1) ?? 0;
  const priceLabels = [high, latest?.high ?? max, latest?.close ?? max, latest?.low ?? min, low]
    .map((value) => Number(value.toFixed(2)))
    .filter((value, index, rows) => rows.indexOf(value) === index);

  return (
    <div className="exact-trading-graph overflow-hidden rounded-[28px] border border-white/8 bg-black">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">{symbol.slice(0, 1)}</span>
            <h3 className="truncate text-xl font-black text-slate-200">{stockUniverse.find((item) => item.ticker === symbol)?.name ?? symbol}</h3>
          </div>
          <p className="mt-1 font-mono text-sm text-teal-300">
            {latest ? `${latest.close.toFixed(2)} ${change >= 0 ? "+" : ""}${change.toFixed(2)} (${((change / Math.max(0.01, previous?.close ?? latest.close)) * 100).toFixed(2)}%)` : "-"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 font-mono text-xs">
          <span className="rounded bg-slate-700/85 px-2 py-1 text-white">High {latest?.high.toFixed(2) ?? "-"}</span>
          <span className="rounded bg-teal-500/85 px-2 py-1 text-white">{latest?.close.toFixed(2) ?? "-"}</span>
          <span className="rounded bg-rose-500/85 px-2 py-1 text-white">Ask {(latest ? latest.close * 0.992 : 0).toFixed(2)}</span>
          <span className="rounded bg-blue-600/85 px-2 py-1 text-white">Bid {(latest ? latest.close * 0.986 : 0).toFixed(2)}</span>
        </div>
      </div>
      <div className="exact-trading-graph-scroll overflow-x-auto overflow-y-hidden">
      <svg viewBox={`0 0 ${width} ${totalHeight}`} preserveAspectRatio="xMidYMid meet" className={compact ? "h-auto min-w-[560px] w-full" : "h-auto min-w-[820px] w-full"}>
        <defs>
          <linearGradient id={`exact-fill-${symbol}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={areaColor} />
            <stop offset="62%" stopColor={areaColor} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>
        {Array.from({ length: 9 }, (_, index) => <line key={`v-${index}`} x1={index * (width / 8)} x2={index * (width / 8)} y1="0" y2={totalHeight} stroke="rgba(255,255,255,.055)" strokeWidth="1" />)}
        {Array.from({ length: compact ? 8 : 15 }, (_, index) => <line key={`h-${index}`} x1="0" x2={width} y1={index * (totalHeight / (compact ? 7 : 14))} y2={index * (totalHeight / (compact ? 7 : 14))} stroke="rgba(255,255,255,.055)" strokeWidth="1" />)}
        {priceLabels.map((value) => {
          const y = mainHeight - ((value - low) / Math.max(0.01, high - low)) * mainHeight;
          return <text key={value} x="965" y={Math.max(18, Math.min(mainHeight - 8, y))} fill="#a8a8b2" fontSize="19" fontFamily="monospace">{value.toFixed(2)}</text>;
        })}
        <path d={areaPath} fill={`url(#exact-fill-${symbol})`} />
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {candles.map((candle, index) => {
          const x = (index / Math.max(1, candles.length - 1)) * width;
          const height = Math.max(3, (candle.volume / volumeMax) * 62);
          return <rect key={index} x={x} y={mainHeight - height} width={Math.max(1.3, width / candles.length - 2)} height={height} fill={candle.close >= candle.open ? "rgba(86,199,164,.18)" : "rgba(240,138,173,.18)"} />;
        })}
        {!compact ? (
          <>
            <g transform={`translate(0 ${mainHeight})`}>
              <rect x="0" y="0" width={width} height={rsiHeight} fill="rgba(20,16,35,.56)" />
              <text x="24" y="34" fill="#b8b8c2" fontSize="22" fontFamily="monospace">RSI 14 close</text>
              <line x1="0" x2={width} y1="44" y2="44" stroke="rgba(255,255,255,.38)" strokeDasharray="9 9" />
              <line x1="0" x2={width} y1="126" y2="126" stroke="rgba(255,255,255,.38)" strokeDasharray="9 9" />
              <path d={buildPolyline(rsi, width, rsiHeight, 0, 100)} fill="none" stroke="#9b7cf8" strokeWidth="2.1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={buildPolyline(rsiMa, width, rsiHeight, 0, 100)} fill="none" stroke="#f3db57" strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <rect x="780" y="12" width="190" height="28" rx="4" fill="#7c5ac7" />
              <text x="794" y="33" fill="#fff" fontSize="20" fontFamily="monospace">RSI {latestRsi.toFixed(2)}</text>
              <rect x="730" y="46" width="240" height="28" rx="4" fill="#f7dc4f" />
              <text x="744" y="67" fill="#111" fontSize="20" fontFamily="monospace">RSI-based MA {latestRsiMa.toFixed(2)}</text>
            </g>
            <g transform={`translate(0 ${mainHeight + rsiHeight})`}>
              <text x="24" y="34" fill="#b8b8c2" fontSize="22" fontFamily="monospace">PMO close 35 20 10</text>
              <line x1="0" x2={width} y1={pmoHeight / 2} y2={pmoHeight / 2} stroke="rgba(255,255,255,.38)" strokeDasharray="9 9" />
              <path d={buildPolyline(pmo.macd, width, pmoHeight, -pmoMax, pmoMax)} fill="none" stroke="#4f7dff" strokeWidth="2.1" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <path d={buildPolyline(pmo.signal, width, pmoHeight, -pmoMax, pmoMax)} fill="none" stroke="#ff8a3d" strokeWidth="1.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              <rect x="778" y="12" width="192" height="28" rx="4" fill="#2f6dff" />
              <text x="794" y="33" fill="#fff" fontSize="20" fontFamily="monospace">PMO {latestPmo.toFixed(2)}</text>
              <rect x="748" y="46" width="222" height="28" rx="4" fill="#ff7d22" />
              <text x="762" y="67" fill="#fff" fontSize="20" fontFamily="monospace">Signal {latestSignal.toFixed(2)}</text>
            </g>
          </>
        ) : null}
      </svg>
      </div>
    </div>
  );
}

function AdvancedIndicatorVisuals({ candles, metrics, visible }: { candles: Candle[]; metrics: ReturnType<typeof calculateDashboardMetrics>; visible: IndicatorVisibility }) {
  const width = 1000;
  const height = 150;
  const rsi = calculateRsiSeries(candles);
  const rsiMa = calculateEmaSeries(rsi.map((value) => value ?? 50), 9);
  const macd = calculateMacdSeries(candles);
  const ad = calculateAccumulationDistributionSeries(candles);
  const atr = calculateAtrSeries(candles);
  const adx = calculateAdxSeries(candles);
  const latestRsi = rsi.at(-1) ?? null;
  const latestRsiMa = rsiMa.at(-1) ?? null;
  const latestMacd = macd.macd.at(-1) ?? null;
  const latestSignal = macd.signal.at(-1) ?? null;
  const latestAd = ad.at(-1) ?? null;
  const latestAtr = atr.at(-1) ?? null;
  const latestAdx = adx.at(-1) ?? null;
  const macdMax = Math.max(0.01, ...macd.macd.map(Math.abs), ...macd.signal.map(Math.abs), ...macd.histogram.map(Math.abs));
  const volumeMax = Math.max(1, ...candles.map((candle) => candle.volume));

  return (
    <div className="overflow-hidden rounded-b-md border-t border-white/10">
      {visible.rsi ? <IndicatorPane
        title={`RSI 14 close  ${formatIndicator(latestRsi, 2)}  ${formatIndicator(latestRsiMa, 2)}`}
        rightLabels={[
          { label: "RSI", className: "bg-violet-500 text-white" },
          { label: "RSI-based MA", className: "bg-yellow-400 text-slate-950" }
        ]}
      >
        <rect x="0" y="35" width={width} height="80" fill="rgba(124, 58, 237, 0.12)" />
        <line x1="0" x2={width} y1="35" y2="35" stroke="rgba(226,232,240,.34)" strokeDasharray="4 5" />
        <line x1="0" x2={width} y1="75" y2="75" stroke="rgba(226,232,240,.18)" strokeDasharray="4 5" />
        <line x1="0" x2={width} y1="115" y2="115" stroke="rgba(226,232,240,.34)" strokeDasharray="4 5" />
        <path d={buildPolyline(rsi, width, height, 0, 100)} fill="none" stroke="#9b7cff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={buildPolyline(rsiMa, width, height, 0, 100)} fill="none" stroke="#ffd400" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <EndValueLabel values={rsi} label="RSI" color="#7c5ac7" min={0} max={100} />
        <EndValueLabel values={rsiMa} label="MA" color="#facc15" min={0} max={100} />
      </IndicatorPane> : null}

      {visible.macd ? <IndicatorPane
        title={`MACD close 12 26 9  ${formatIndicator(latestMacd, 4)}  ${formatIndicator(latestSignal, 4)}`}
        rightLabels={[
          { label: "MACD", className: "bg-blue-600 text-white" },
          { label: "Signal", className: "bg-orange-500 text-white" }
        ]}
      >
        <line x1="0" x2={width} y1="75" y2="75" stroke="rgba(226,232,240,.28)" strokeDasharray="4 5" />
        {macd.histogram.map((value, index) => {
          const x = (index / Math.max(1, macd.histogram.length - 1)) * width;
          const barHeight = Math.abs(value / macdMax) * 56;
          const y = value >= 0 ? 75 - barHeight : 75;
          return <rect key={index} x={x} y={y} width={Math.max(1.5, width / macd.histogram.length - 1)} height={barHeight} fill={value >= 0 ? "rgba(0,150,136,.45)" : "rgba(239,51,64,.45)"} />;
        })}
        <path d={buildPolyline(macd.macd, width, height, -macdMax, macdMax)} fill="none" stroke="#2f7bff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path d={buildPolyline(macd.signal, width, height, -macdMax, macdMax)} fill="none" stroke="#ff8a1f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <EndValueLabel values={macd.macd} label="MACD" color="#2563eb" min={-macdMax} max={macdMax} formatter={(value) => formatIndicator(value, 3)} />
        <EndValueLabel values={macd.signal} label="SIG" color="#f97316" min={-macdMax} max={macdMax} formatter={(value) => formatIndicator(value, 3)} />
        <EndValueLabel values={macd.histogram} label="HIST" color={(latestMacd ?? 0) >= (latestSignal ?? 0) ? "#18e08a" : "#ef3340"} min={-macdMax} max={macdMax} formatter={(value) => formatIndicator(value, 3)} />
      </IndicatorPane> : null}

      {visible.ad || visible.atr || visible.adx ? <div className="grid border-t border-white/10 md:grid-cols-3">
        {visible.ad ? <IndicatorPane
          title={`A/D  ${formatCompact(latestAd)}`}
          rightLabels={[{ label: "A/D", className: (metrics.ad.value ?? 0) >= (metrics.ad.previous ?? 0) ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white" }]}
          height={108}
        >
          <path d={buildPolyline(ad, width, height)} fill="none" stroke={(metrics.ad.value ?? 0) >= (metrics.ad.previous ?? 0) ? "#00e889" : "#ff2f55"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <EndValueLabel values={ad} label="A/D" color={(metrics.ad.value ?? 0) >= (metrics.ad.previous ?? 0) ? "#18e08a" : "#ef3340"} height={height} formatter={(value) => formatCompact(value)} />
        </IndicatorPane> : null}
        {visible.atr ? <IndicatorPane
          title={`ATR 14  ${formatIndicator(latestAtr)}`}
          rightLabels={[{ label: "ATR", className: "bg-amber-400 text-slate-950" }]}
          height={108}
        >
          <path d={buildPolyline(atr, width, height)} fill="none" stroke="#ffb020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <EndValueLabel values={atr} label="ATR" color="#f59e0b" height={height} />
        </IndicatorPane> : null}
        {visible.adx ? <IndicatorPane
          title={`ADX 14  ${formatIndicator(latestAdx, 2)} · ${describeAdx(latestAdx)}`}
          rightLabels={[{ label: "ADX", className: "bg-cyan-400 text-slate-950" }]}
          height={108}
        >
          <line x1="0" x2={width} y1="75" y2="75" stroke="rgba(226,232,240,.3)" strokeDasharray="4 5" />
          <path d={buildPolyline(adx, width, height, 0, 60)} fill="none" stroke="#25e6ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <EndValueLabel values={adx} label="ADX" color="#22d3ee" min={0} max={60} height={height} />
        </IndicatorPane> : null}
      </div> : null}

      <div className="grid gap-px bg-white/10 md:grid-cols-4">
        {[
          visible.levels ? ["Auto Key Levels", `S ${formatIndicator(metrics.latest ? metrics.latest.close - (metrics.atr ?? 0) : null)} · R ${formatIndicator(metrics.latest ? metrics.latest.close + (metrics.atr ?? 0) : null)}`] : null,
          visible.ema ? ["EMA", `EMA20 ${formatIndicator(metrics.ema20)} · EMA50 ${formatIndicator(metrics.ema50)}`] : null,
          visible.volume ? ["Volume", `Vol ${formatCompact(metrics.currentVolume)} · RVOL ${metrics.rvol.toFixed(2)}x`] : null,
          visible.adx ? ["Trend Strength", describeAdx(metrics.adx)] : null
        ].filter((item): item is string[] => Boolean(item)).map(([label, value]) => (
          <div key={label} className="bg-[#0b0d0f] px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
            <p className="mt-1 font-mono text-xs text-slate-100">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdvancedChart({ fillViewport = false, symbolOverride, compact = false }: { fillViewport?: boolean; symbolOverride?: string; compact?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedTicker, setSelectedTicker, timeframe, setTimeframe, requestRefresh } = useMarketStore();
  const activeTicker = symbolOverride ?? selectedTicker;
  const [chartData, setChartData] = useState<Candle[]>(fallbackCandles);
  const [provider, setProvider] = useState("mock");
  const [compare, setCompare] = useState("AMD");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("Area");
  const [hoverQuote, setHoverQuote] = useState<HoverQuote | null>(null);
  const [showAdvancedIndicators, setShowAdvancedIndicators] = useState(false);
  const [indicatorVisibility, setIndicatorVisibility] = useState<IndicatorVisibility>(defaultIndicatorVisibility);
  const technicals = useMemo(() => calculateTechnicals(chartData), [chartData]);
  const marketMetrics = useMemo(() => calculateDashboardMetrics(chartData, activeTicker), [chartData, activeTicker]);
  const advancedIndicatorItems = useMemo<AdvancedIndicatorItem[]>(() => {
    const adChange = marketMetrics.ad.value !== null && marketMetrics.ad.previous !== null ? marketMetrics.ad.value - marketMetrics.ad.previous : 0;
    const emaTrend = marketMetrics.latest && marketMetrics.ema20 !== null ? marketMetrics.latest.close - marketMetrics.ema20 : 0;
    const atrPercent = marketMetrics.latest && marketMetrics.atr ? (marketMetrics.atr / marketMetrics.latest.close) * 100 : null;
    const supportGap = marketMetrics.latest && technicals.support ? ((marketMetrics.latest.close - technicals.support) / marketMetrics.latest.close) * 100 : null;
    const resistanceGap = marketMetrics.latest && technicals.resistance ? ((technicals.resistance - marketMetrics.latest.close) / marketMetrics.latest.close) * 100 : null;

    return [
      {
        key: "levels",
        title: "Auto Key Levels",
        value: `${formatIndicator(technicals.support)} / ${formatIndicator(technicals.resistance)}`,
        detail: `แนวรับห่าง ${supportGap === null ? "-" : supportGap.toFixed(1)}% · แนวต้านห่าง ${resistanceGap === null ? "-" : resistanceGap.toFixed(1)}%`,
        tone: "text-cyan-100"
      },
      {
        key: "ad",
        title: "Accumulation/Distribution (A/D)",
        value: formatCompact(marketMetrics.ad.value),
        detail: adChange >= 0 ? "เส้นขึ้น: มีการสะสมหุ้น" : "เส้นลง: มีแรงขายออก",
        tone: adChange >= 0 ? "text-[#18e08a]" : "text-[#ff3366]"
      },
      {
        key: "rsi",
        title: "RSI",
        value: formatIndicator(technicals.rsi, 1),
        detail: technicals.rsi === null ? "รอข้อมูล" : technicals.rsi >= 70 ? "หุ้นร้อนเกินไป / Overbought" : technicals.rsi <= 30 ? "ลงแรงเกินไป / Oversold" : "แรงซื้อขายยังสมดุล",
        tone: technicals.rsi !== null && technicals.rsi >= 70 ? "text-[#ff3366]" : technicals.rsi !== null && technicals.rsi <= 30 ? "text-[#18e08a]" : "text-slate-100"
      },
      {
        key: "macd",
        title: "MACD",
        value: `${formatIndicator(technicals.macd, 2)} / ${formatIndicator(technicals.macdSignal, 2)}`,
        detail: `MACD Line · Signal Line · Histogram ${formatIndicator(technicals.macdHistogram, 2)}`,
        tone: (technicals.macdHistogram ?? 0) >= 0 ? "text-[#18e08a]" : "text-[#ff3366]"
      },
      {
        key: "ema",
        title: "EMA",
        value: `${formatIndicator(marketMetrics.ema20)} / ${formatIndicator(marketMetrics.ema50)}`,
        detail: emaTrend >= 0 ? "ราคาอยู่เหนือ EMA20: แนวโน้มบวก" : "ราคาอยู่ใต้ EMA20: แนวโน้มอ่อน",
        tone: emaTrend >= 0 ? "text-[#18e08a]" : "text-[#ff3366]"
      },
      {
        key: "volume",
        title: "Volume",
        value: `${formatCompact(marketMetrics.currentVolume)} · RVOL ${marketMetrics.rvol.toFixed(2)}x`,
        detail: marketMetrics.rvol >= 1.4 ? "แรงซื้อขายสูงกว่าปกติ" : "แรงซื้อขายปกติ",
        tone: marketMetrics.rvol >= 1.4 ? "text-amber-100" : "text-slate-100"
      },
      {
        key: "atr",
        title: "ATR",
        value: formatIndicator(marketMetrics.atr),
        detail: atrPercent === null ? "รอข้อมูล" : atrPercent >= 3 ? "ATR สูง: หุ้นแกว่งแรง" : "ATR ต่ำ: หุ้นนิ่งกว่า",
        tone: atrPercent !== null && atrPercent >= 3 ? "text-amber-100" : "text-slate-100"
      },
      {
        key: "adx",
        title: "ADX",
        value: formatIndicator(marketMetrics.adx, 1),
        detail: `${describeAdx(marketMetrics.adx)} · ADX บอกความแรงของ trend ไม่บอกทิศทาง`,
        tone: marketMetrics.adx !== null && marketMetrics.adx >= 25 ? "text-[#18e08a]" : "text-slate-100"
      }
    ];
  }, [marketMetrics, technicals]);
  const indicatorCards = useMemo(
    () => [
      { label: "RSI", title: "Overbought / Oversold", value: formatIndicator(technicals.rsi, 1), detail: technicals.rsi === null ? "รอข้อมูล" : technicals.rsi >= 70 ? "Overbought / ซื้อหนาแน่น" : technicals.rsi <= 30 ? "Oversold / ขายหนาแน่น" : "สมดุล" },
      { label: "MACD", title: "Momentum trend", value: `${formatIndicator(technicals.macd, 2)} / ${formatIndicator(technicals.macdSignal, 2)}`, detail: `Histogram ${formatIndicator(technicals.macdHistogram, 2)}` },
      { label: "Stochastic", title: "จังหวะกลับตัว", value: formatIndicator(marketMetrics.stochastic, 1), detail: (marketMetrics.stochastic ?? 50) >= 80 ? "ใกล้โซนกลับตัวลง" : (marketMetrics.stochastic ?? 50) <= 20 ? "ใกล้โซนรีบาวด์" : "ยังอยู่กลางกรอบ" },
      { label: "ATR", title: "ความผันผวน", value: formatIndicator(marketMetrics.atr), detail: "ช่วงแกว่งเฉลี่ยล่าสุด" },
      { label: "MA20", title: "ค่าเฉลี่ย 20 วัน", value: formatIndicator(technicals.ma20), detail: "แนวโน้มระยะสั้น" },
      { label: "MA50", title: "ค่าเฉลี่ย 50 วัน", value: formatIndicator(technicals.ma50), detail: "แนวโน้มหลัก" },
      { label: "VWAP", title: "ราคาเฉลี่ยถ่วงน้ำหนัก", value: formatIndicator(technicals.vwap), detail: "อิงราคาและวอลุ่ม" },
      { label: "Support", title: "แนวรับ", value: formatIndicator(technicals.support), detail: "ต่ำสุดช่วงล่าสุด" },
      { label: "Resistance", title: "แนวต้าน", value: formatIndicator(technicals.resistance), detail: "สูงสุดช่วงล่าสุด" }
    ],
    [marketMetrics.atr, marketMetrics.stochastic, technicals]
  );
  const visibleAdvancedIndicatorItems = useMemo(
    () => advancedIndicatorItems.filter((item) => indicatorVisibility[item.key as IndicatorKey]),
    [advancedIndicatorItems, indicatorVisibility]
  );
  const visibleIndicatorCards = useMemo(
    () =>
      indicatorCards.filter((item) => {
        if (item.label === "RSI") return indicatorVisibility.rsi;
        if (item.label === "MACD") return indicatorVisibility.macd;
        if (item.label === "ATR") return indicatorVisibility.atr;
        if (item.label === "MA20" || item.label === "MA50" || item.label === "VWAP") return indicatorVisibility.ema;
        if (item.label === "Support" || item.label === "Resistance") return indicatorVisibility.levels;
        return true;
      }),
    [indicatorCards, indicatorVisibility]
  );
  const chartHeightClass = compact
    ? "h-[240px]"
    : isFullscreen
      ? "h-[calc(100vh-190px)] min-h-[390px]"
      : fillViewport
        ? "h-[calc(100vh-300px)] min-h-[390px]"
        : "h-[420px]";

  const symbolOptions = useMemo(
    () => stockUniverse.filter((stock) => `${stock.ticker} ${stock.name} ${stock.sector}`.toLowerCase().includes(symbolSearch.toLowerCase())).slice(0, stockUniverse.length),
    [symbolSearch]
  );

  const ma20 = useMemo(
    () =>
      chartData.map((candle, index) => ({
        time: candle.time,
        value: Number((chartData.slice(Math.max(0, index - 19), index + 1).reduce((sum, row) => sum + row.close, 0) / Math.min(index + 1, 20)).toFixed(2))
      })),
    [chartData]
  );

  async function refreshCandles() {
    const response = await fetch(`/api/candles?symbol=${encodeURIComponent(activeTicker)}&timeframe=${encodeURIComponent(timeframe)}`, { cache: "no-store" });
    const data = (await response.json()) as { provider: string; candles: Candle[] };
    setChartData(data.candles.length ? data.candles : fallbackCandles);
    setProvider(data.provider);
  }

  useEffect(() => {
    refreshCandles().catch(() => {
      setChartData(fallbackCandles);
      setProvider("mock");
    });
  }, [activeTicker, timeframe]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chartElement = containerRef.current;
    const chart = createChart(containerRef.current, {
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: "#a3a3ad", fontFamily: tradingThaiFont },
      grid: { vertLines: { color: "rgba(255, 255, 255, 0.06)" }, horzLines: { color: "rgba(255, 255, 255, 0.06)" } },
      rightPriceScale: { borderColor: "rgba(255, 255, 255, 0.1)", scaleMargins: { top: 0.08, bottom: chartMode === "Volume" ? 0.34 : 0.22 } },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        rightOffset: 0,
        barSpacing: chartData.length <= 30 ? 18 : 10,
        minBarSpacing: 4
      },
      crosshair: {
        vertLine: { color: "rgba(226, 232, 240, 0.34)", style: LineStyle.Dashed, labelBackgroundColor: "#2a173c" },
        horzLine: { color: "rgba(226, 232, 240, 0.24)", style: LineStyle.Dotted, labelBackgroundColor: "#2a173c" }
      },
      width: chartElement.clientWidth,
      height: chartElement.clientHeight
    });
    const normalizedCandles = chartData.map((candle) => ({ ...candle, time: candle.time as Time }));
    const closeSeriesData = normalizedCandles.map((candle) => ({ time: candle.time, value: candle.close }));
    const afterHoursSeriesData = buildAfterHoursSeries(chartData, activeTicker);
    const candleByTime = new Map(normalizedCandles.map((candle) => [timeKey(candle.time), candle]));
    const firstClose = normalizedCandles[0]?.close ?? 0;
    const lastClose = normalizedCandles.at(-1)?.close ?? firstClose;
    const isUpTrend = lastClose >= firstClose;
    const lineColor = isUpTrend ? freshGreen : chartRed;
    const softLineColor = isUpTrend ? "#8df0a0" : "#ff9ab9";
    const upFill = freshGreenSoft;
    const downFill = "rgba(243, 133, 173, 0.38)";
    const transparentFill = "rgba(15, 16, 20, 0)";

    const addLineSeries = (lineType: LineType, color = lineColor, width: 2 | 3 | 4 = 4) => {
      const series = chart.addSeries(LineSeries, { color, lineWidth: width, lineType, lineStyle: LineStyle.Solid, crosshairMarkerVisible: true, pointMarkersVisible: chartMode === "Trend" });
      series.setData(closeSeriesData);
      return series;
    };

    const addAreaSeries = (color = lineColor, topColor = isUpTrend ? upFill : downFill) => {
      const series = chart.addSeries(AreaSeries, {
        lineColor: color,
        topColor,
        bottomColor: transparentFill,
        lineWidth: 3,
        lineType: chartMode === "Smooth" ? LineType.Curved : LineType.Simple,
        crosshairMarkerVisible: true,
        priceLineColor: color
      });
      series.setData(closeSeriesData);
      return series;
    };

    let primarySeries: any = null;

    if (chartMode === "Bars") {
      const series = chart.addSeries(BarSeries, { upColor: freshGreen, downColor: chartRed, openVisible: true, thinBars: false });
      series.setData(normalizedCandles);
      primarySeries = series;
    } else if (chartMode === "Line") {
      primarySeries = addLineSeries(LineType.Simple);
    } else if (chartMode === "Area") {
      primarySeries = addAreaSeries();
    } else if (chartMode === "Baseline") {
      const series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: firstClose },
        topLineColor: freshGreen,
        topFillColor1: "rgba(104, 223, 124, 0.34)",
        topFillColor2: freshGreenFaint,
        bottomLineColor: chartRed,
        bottomFillColor1: "rgba(243, 133, 173, 0.08)",
        bottomFillColor2: "rgba(243, 133, 173, 0.5)",
        lineWidth: 3
      });
      series.setData(closeSeriesData);
      primarySeries = series;
    } else if (chartMode === "Smooth") {
      primarySeries = addAreaSeries(softLineColor, isUpTrend ? "rgba(0, 232, 137, 0.46)" : "rgba(255, 92, 122, 0.46)");
    } else if (chartMode === "Step") {
      primarySeries = addLineSeries(LineType.WithSteps, isUpTrend ? freshGreen : "#ff5c7a", 4);
    } else if (chartMode === "Hollow") {
      const series = chart.addSeries(CandlestickSeries, { upColor: "rgba(15, 23, 42, 0)", downColor: chartRed, borderVisible: true, borderUpColor: freshGreen, borderDownColor: chartRed, wickUpColor: freshGreen, wickDownColor: chartRed });
      series.setData(normalizedCandles);
      primarySeries = series;
    } else if (chartMode === "Trend") {
      primarySeries = addAreaSeries(lineColor, isUpTrend ? "rgba(0, 232, 137, 0.3)" : "rgba(255, 47, 85, 0.3)");
      if (indicatorVisibility.ema) {
        const trendSeries = chart.addSeries(LineSeries, { color: "#ffd400", lineWidth: 3, lineStyle: LineStyle.Dashed, lineType: LineType.Curved, priceLineVisible: false, lastValueVisible: false });
        trendSeries.setData(ma20.map((point) => ({ ...point, time: point.time as Time })));
      }
    } else if (chartMode === "Volume") {
      primarySeries = addAreaSeries(lineColor, isUpTrend ? "rgba(0, 232, 137, 0.26)" : "rgba(255, 47, 85, 0.26)");
    } else {
      const series = chart.addSeries(CandlestickSeries, { upColor: freshGreen, downColor: chartRed, borderVisible: false, wickUpColor: freshGreen, wickDownColor: chartRed });
      series.setData(normalizedCandles);
      primarySeries = series;
    }

    if (indicatorVisibility.levels && primarySeries) {
      if (technicals.support !== null) {
        primarySeries.createPriceLine({ price: technicals.support, color: "#22d3ee", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
      }
      if (technicals.resistance !== null) {
        primarySeries.createPriceLine({ price: technicals.resistance, color: "#f472b6", lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: false, title: "" });
      }
    }

    if (indicatorVisibility.volume) {
      const volumeSeries = chart.addSeries(HistogramSeries, { color: "rgba(104, 223, 124, 0.24)", priceFormat: { type: "volume" }, priceScaleId: "", priceLineVisible: false, lastValueVisible: false });
      volumeSeries.setData(
        chartData.map((candle) => ({
          time: candle.time as Time,
          value: candle.volume,
          color: candle.close >= candle.open ? (chartMode === "Volume" ? "rgba(104,223,124,.82)" : "rgba(104,223,124,.34)") : chartMode === "Volume" ? "rgba(243,133,173,.78)" : "rgba(243,133,173,.42)"
        }))
      );
    }

    if (indicatorVisibility.ema && !["Trend", "Volume"].includes(chartMode)) {
      const maSeries = chart.addSeries(LineSeries, { color: "#ffd400", lineWidth: 3, lineStyle: LineStyle.Dotted, lineType: LineType.Curved, priceLineVisible: false, lastValueVisible: false });
      maSeries.setData(ma20.map((point) => ({ ...point, time: point.time as Time })));
    }

    if (afterHoursSeriesData.length > 1) {
      const afterHoursSeries = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: lastClose },
        topLineColor: afterHoursLine,
        topFillColor1: afterHoursTop,
        topFillColor2: afterHoursBottom,
        bottomLineColor: afterHoursLine,
        bottomFillColor1: afterHoursBottom,
        bottomFillColor2: afterHoursTop,
        lineWidth: 4,
        crosshairMarkerVisible: true,
        priceLineVisible: false,
        lastValueVisible: false,
        priceLineColor: afterHoursLine,
        title: ""
      });
      afterHoursSeries.setData(afterHoursSeriesData);
    }

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0 || param.point.x > chartElement.clientWidth || param.point.y > chartElement.clientHeight) {
        setHoverQuote(null);
        return;
      }
      const candle = candleByTime.get(timeKey(param.time));
      if (!candle) {
        setHoverQuote(null);
        return;
      }
      setHoverQuote({
        x: param.point.x,
        y: param.point.y,
        dateTime: formatCandleDateTime(candle.time),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      });
    });

    const fitChartToFullWidth = () => {
      if (normalizedCandles.length > 1) {
        const padding = visibleRangePadding(normalizedCandles.length);
        const afterHoursPadding = afterHoursSeriesData.length > 1 ? afterHoursSeriesData.length - 1 : 0;
        chart.timeScale().setVisibleLogicalRange({ from: -padding, to: normalizedCandles.length - 1 + afterHoursPadding + padding });
      } else {
        chart.timeScale().fitContent();
      }
    };
    fitChartToFullWidth();

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      chart.applyOptions({ width: Math.floor(width), height: Math.floor(height) });
      fitChartToFullWidth();
    });
    resizeObserver.observe(chartElement);

    return () => {
      resizeObserver.disconnect();
      setHoverQuote(null);
      chart.remove();
    };
  }, [chartData, chartMode, indicatorVisibility, isFullscreen, ma20, technicals.resistance, technicals.support]);

  const activeChartMode = chartModes.find((mode) => mode.key === chartMode)?.label ?? "Area";
  const timeAxis = buildTimeAxis(chartData);
  const priceChange = marketMetrics.latest && marketMetrics.previous ? marketMetrics.latest.close - marketMetrics.previous.close : 0;
  const priceChangePercent = marketMetrics.previous ? (priceChange / Math.max(0.01, marketMetrics.previous.close)) * 100 : 0;
  const latestDateTime = formatCandleDateTime(marketMetrics.latest?.time);
  const refreshedAt = new Date().toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok"
  });
  const chartLevelBadges = [
    indicatorVisibility.levels && technicals.resistance !== null
      ? { label: "Resistance", value: formatIndicator(technicals.resistance), className: "border-pink-300/55 bg-pink-300/16 text-pink-50", dot: "#f472b6" }
      : null,
    indicatorVisibility.ema
      ? { label: "EMA20", value: formatIndicator(marketMetrics.ema20), className: "border-yellow-300/55 bg-yellow-300/16 text-yellow-50", dot: "#facc15" }
      : null,
    indicatorVisibility.levels && technicals.support !== null
      ? { label: "Support", value: formatIndicator(technicals.support), className: "border-cyan-300/55 bg-cyan-300/16 text-cyan-50", dot: "#22d3ee" }
      : null,
    { label: "After-hours", value: formatIndicator(marketMetrics.afterHours.price), className: "border-slate-200/45 bg-slate-200/14 text-slate-50", dot: "#cbd5e1" },
    indicatorVisibility.volume
      ? { label: "Volume", value: formatCompact(marketMetrics.currentVolume), className: "border-[#18e08a]/50 bg-[#18e08a]/16 text-[#d5ffe7]", dot: freshGreen }
      : null
  ].filter((item): item is { label: string; value: string; className: string; dot: string } => Boolean(item));
  const aiSummary =
    marketMetrics.breakoutProbability >= 70
      ? "AI มองว่ามีโอกาส breakout สูง เพราะโมเมนตัมและวอลุ่มหนุนราคา"
      : marketMetrics.riskLevel >= 65
        ? "AI มองว่าควรลดขนาดไม้ เพราะความผันผวนและแรงขายเริ่มสูง"
        : "AI มองว่าแนวโน้มยังต้องรอ confirmation จากวอลุ่มและราคาเหนือแนวต้าน";
  const aiMetrics: AiMetric[] = [
    { label: "Trend Strength", value: `${marketMetrics.trendStrength}/100`, score: marketMetrics.trendStrength, inverse: false, Icon: TrendingUp },
    { label: "Momentum", value: `${marketMetrics.momentumScore}/100`, score: marketMetrics.momentumScore, inverse: false, Icon: Waves },
    { label: "Breakout Probability", value: `${marketMetrics.breakoutProbability}%`, score: marketMetrics.breakoutProbability, inverse: false, Icon: TrendingUp },
    { label: "Risk Level", value: `${marketMetrics.riskLevel}%`, score: marketMetrics.riskLevel, inverse: true, Icon: TrendingDown },
    { label: "Smart Money Flow", value: `${marketMetrics.smartMoneyFlow}/100`, score: marketMetrics.smartMoneyFlow, inverse: false, Icon: Activity },
    { label: "Volume Analysis", value: marketMetrics.rvol >= 1.4 ? "วอลุ่มหนุน" : "วอลุ่มปกติ", score: Math.min(100, marketMetrics.rvol * 45), inverse: false, Icon: BarChart3 }
  ];

  return (
    <div className={`aq-chart-card glass flex ${fillViewport || isFullscreen ? "h-full min-h-[calc(100vh-190px)]" : ""} flex-col ${compact ? "p-3" : "p-4"} ${isFullscreen ? "fixed inset-3 z-50 min-h-0 overflow-auto" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Advanced Chart · {provider.toUpperCase()}</p>
          <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
            <h2 className={`${compact ? "text-2xl" : "text-4xl"} font-black tracking-tight text-white`}>{activeTicker}</h2>
            <span className={`font-mono text-lg font-black ${toneClass(priceChange)}`}>
              {marketMetrics.latest ? `$${marketMetrics.latest.close.toFixed(2)} ${signed(priceChange)} (${signed(priceChangePercent)}%)` : "-"}
            </span>
            <span className={`rounded-full border px-3 py-1 font-mono text-xs font-black ${badgeClass(marketMetrics.afterHours.percent)}`}>
              หลังตลาดปิด ${marketMetrics.afterHours.price.toFixed(2)} {signed(marketMetrics.afterHours.percent)}%
            </span>
          </div>
        </div>
        <div className={`flex flex-wrap items-center gap-2 ${compact ? "hidden" : ""}`}>
          <input value={symbolSearch} onChange={(event) => setSymbolSearch(event.target.value)} className="h-10 w-36 rounded-2xl border border-white/10 bg-[#15161b] px-3 text-sm text-slate-100 outline-none" placeholder="Search watchlist" />
          <select value={selectedTicker} onChange={(event) => setSelectedTicker(event.target.value)} className="h-10 w-44 rounded-2xl border border-white/10 bg-[#15161b] px-3 text-sm text-slate-100 outline-none">
            {symbolOptions.map((stock) => <option key={stock.ticker} value={stock.ticker}>{stock.ticker} - {stock.name}</option>)}
          </select>
          <select value={chartMode} onChange={(event) => setChartMode(event.target.value as ChartMode)} className="h-10 w-32 rounded-2xl border border-violet-400/25 bg-[#15161b] px-3 text-sm text-slate-100 outline-none hover:border-violet-400/60" title="Chart style">
            {chartModes.map((mode) => <option key={mode.key} value={mode.key}>{mode.label}</option>)}
          </select>
          {timeframes.map((item) => (
            <button key={item} onClick={() => setTimeframe(item)} className={`h-10 rounded-full px-4 text-sm font-black transition ${timeframe === item ? "bg-violet-600 text-white" : "border border-white/10 text-slate-300 hover:border-violet-400/40"}`}>{item}</button>
          ))}
          <button title="Refresh chart" onClick={() => { requestRefresh(); refreshCandles(); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><RefreshCw size={16} /></button>
          <button title="Drawing tools" onClick={() => setShowTools((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><PenLine size={16} /></button>
          <button title="Compare stocks" onClick={() => setCompare(allStockSymbols[(allStockSymbols.indexOf(compare) + 1) % allStockSymbols.length] ?? "AMD")} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Share2 size={16} /></button>
          <button title="Fullscreen chart" onClick={() => setIsFullscreen((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Maximize2 size={16} /></button>
        </div>
      </div>
      {showTools ? (
        <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
          {["Trendline ready", "Fibonacci ready", "Support/Resistance", `Compare: ${compare}`].map((item) => <button key={item} className="rounded-md border border-[#18e08a]/20 bg-[#18e08a]/10 px-3 py-2 text-left">{item}</button>)}
        </div>
      ) : null}
      <div className="mt-2 flex min-h-7 flex-wrap items-center gap-1 rounded-md border border-white/10 bg-black/20 px-2 py-1">
        {chartLevelBadges.map((badge) => (
          <span key={badge.label} className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-bold leading-3 shadow-[0_8px_24px_rgba(0,0,0,.28)] [font-family:var(--font-mono)] ${badge.className}`}>
            <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: badge.dot }} />
            {badge.label} {badge.value}
          </span>
        ))}
      </div>
      <div className={`relative w-full shrink-0 ${compact ? "mt-3" : "mt-4"}`}>
        <ExactTradingGraph candles={chartData} symbol={activeTicker} compact={compact} />
        {hoverQuote ? (
          <div
            className="pointer-events-none absolute z-20 w-[230px] rounded-md border border-white/15 bg-[#101318]/95 p-3 text-xs text-slate-300 shadow-[0_18px_44px_rgba(0,0,0,.38)]"
            style={{
              left: Math.min(Math.max(8, hoverQuote.x + 14), Math.max(8, (containerRef.current?.clientWidth ?? 260) - 238)),
              top: Math.min(Math.max(8, hoverQuote.y + 14), Math.max(8, (containerRef.current?.clientHeight ?? 160) - 150))
            }}
          >
            <div className="mb-2 border-b border-white/10 pb-2 font-mono text-[11px] text-slate-100">{hoverQuote.dateTime}</div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <span className="text-slate-400">Open</span><strong className="text-right font-mono text-slate-100">${hoverQuote.open.toFixed(2)}</strong>
              <span className="text-slate-400">High</span><strong className="text-right font-mono text-[#18e08a]">${hoverQuote.high.toFixed(2)}</strong>
              <span className="text-slate-400">Low</span><strong className="text-right font-mono text-[#ff3366]">${hoverQuote.low.toFixed(2)}</strong>
              <span className="text-slate-400">Close</span><strong className="text-right font-mono text-slate-100">${hoverQuote.close.toFixed(2)}</strong>
              <span className="text-slate-400">Volume</span><strong className="text-right font-mono text-slate-100">{formatCompact(hoverQuote.volume)}</strong>
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-slate-400">
        <span>วันที่/เวลาแท่งล่าสุด: <span className="font-mono text-slate-100">{latestDateTime}</span></span>
        <span>อัปเดตหน้าจอ: <span className="font-mono text-slate-100">{refreshedAt}</span></span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 overflow-x-auto border-t border-white/10 bg-[#0b0d0f] px-3 py-2 font-mono text-[11px] text-slate-500">
        {timeAxis.map((item) => (
          <span key={item.key} title={item.full} className="shrink-0">{item.label}</span>
        ))}
      </div>
      <section className="mt-3 overflow-hidden rounded-lg border border-cyan-300/25 bg-cyan-300/[0.035] ring-1 ring-cyan-300/10">
        <button
          type="button"
          onClick={() => setShowAdvancedIndicators((value) => !value)}
          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Activity size={16} className="shrink-0 text-[#18e08a]" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">Advanced Chart · YAHOO Indicators</span>
              <span className="block truncate text-xs text-slate-500">Auto Key Levels, A/D, RSI, MACD, EMA, Volume, ATR, ADX</span>
            </span>
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 text-slate-300">
            {showAdvancedIndicators ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>
        {showAdvancedIndicators ? (
          <>
            <div className="flex flex-wrap gap-2 border-t border-cyan-300/15 bg-black/25 px-3 py-3">
              {advancedIndicatorItems.map((item) => {
                const active = indicatorVisibility[item.key as IndicatorKey];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIndicatorVisibility((current) => ({ ...current, [item.key as IndicatorKey]: !current[item.key as IndicatorKey] }))}
                    className={`rounded-md border px-2.5 py-1.5 text-xs transition ${active ? "border-[#18e08a]/45 bg-[#18e08a]/12 text-[#b6ffd8]" : "border-white/10 bg-white/[0.035] text-slate-500"}`}
                    title={`${active ? "ซ่อน" : "แสดง"} ${item.title}`}
                  >
                    {active ? "ON" : "OFF"} {item.title}
                  </button>
                );
              })}
            </div>
            <AdvancedIndicatorVisuals candles={chartData} metrics={marketMetrics} visible={indicatorVisibility} />
            <div className={`grid gap-3 border-t border-cyan-300/15 bg-black/20 p-3 text-xs sm:grid-cols-2 ${compact ? "" : "xl:grid-cols-4"}`}>
              {visibleAdvancedIndicatorItems.map((item) => (
                <article key={item.key} className="min-h-[92px] rounded-lg border border-cyan-300/18 bg-[#090d12] p-3 shadow-[0_14px_34px_rgba(0,0,0,.28)] ring-1 ring-white/[0.04]">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[12px] font-semibold text-slate-100">{item.title}</h3>
                    <span className={`font-mono text-[11px] ${item.tone}`}>{item.value}</span>
                  </div>
                  <p className="mt-2 leading-5 text-slate-400">{item.detail}</p>
                </article>
              ))}
            </div>
          </>
        ) : null}
      </section>
      <div className={`mt-3 grid gap-3 ${compact ? "lg:grid-cols-1 2xl:grid-cols-3" : "xl:grid-cols-[1.05fr_1.2fr_1.15fr]"}`}>
        {indicatorVisibility.volume ? <section className="rounded-lg border border-cyan-300/18 bg-[#090d12] p-3 ring-1 ring-white/[0.04]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><BarChart3 size={16} className="text-[#18e08a]" />Volume Panel</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              ["Volume รายวัน", formatCompact(marketMetrics.currentVolume)],
              ["Avg Volume", formatCompact(marketMetrics.averageVolume)],
              ["RVOL", `${marketMetrics.rvol.toFixed(2)}x`],
              ["Dark Pool est.", formatCompact(marketMetrics.darkPoolVolume)]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-cyan-300/14 bg-black/25 p-2">
                <span className="block text-slate-500">{label}</span>
                <strong className="mt-1 block font-mono text-sm text-slate-100">{value}</strong>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400"><span>Buy/Sell Pressure</span><span className="font-mono text-[#8ef7ad]">{marketMetrics.buyPressure.toFixed(0)}% / {marketMetrics.sellPressure.toFixed(0)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-[#ff3366]/20"><div className="h-full bg-[#18e08a]" style={{ width: `${marketMetrics.buyPressure}%` }} /></div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-md border px-2 py-1 ${marketMetrics.volumeSpike ? "border-amber-300/35 bg-amber-300/12 text-amber-100" : "border-white/10 bg-white/[0.035] text-slate-400"}`}>Volume Spike Detection</span>
              <span className={`rounded-md border px-2 py-1 ${marketMetrics.unusualVolume ? "border-fuchsia-300/35 bg-fuchsia-300/12 text-fuchsia-100" : "border-white/10 bg-white/[0.035] text-slate-400"}`}>Unusual Volume</span>
            </div>
          </div>
        </section> : null}
        {visibleIndicatorCards.length ? <section className="rounded-lg border border-amber-300/18 bg-[#090d12] p-3 ring-1 ring-white/[0.04]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Activity size={16} className="text-amber-200" />Technical Indicators</div>
          <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
            {visibleIndicatorCards.map((item) => (
              <div key={item.label} className="min-h-[76px] rounded-md border border-amber-300/14 bg-black/25 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-amber-100">{item.label}</span>
                  <span className="truncate text-[11px] text-slate-500">{item.title}</span>
                </div>
                <strong className="mt-2 block truncate font-mono text-sm text-slate-100">{item.value}</strong>
                <span className="mt-1 block truncate text-slate-500">{item.detail}</span>
              </div>
            ))}
          </div>
        </section> : null}
        <section className="rounded-lg border border-cyan-300/18 bg-[#090d12] p-3 ring-1 ring-white/[0.04]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Bot size={16} className="text-cyan-200" />AI Analysis</div>
          <div className="mt-3 grid gap-2 text-xs">
            {aiMetrics.map(({ label, value, score, inverse, Icon }) => (
              <div key={label} className="rounded-md border border-cyan-300/14 bg-black/25 p-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-slate-400"><Icon size={14} />{label}</span>
                  <strong className={`font-mono ${statusTone(score, inverse)}`}>{value}</strong>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-md border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-50">{aiSummary}</p>
        </section>
      </div>
    </div>
  );
}
