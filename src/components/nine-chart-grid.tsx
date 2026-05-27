"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BaselineSeries, ColorType, createChart, HistogramSeries, LineStyle, type Time } from "lightweight-charts";
import type { Candle, StockQuote } from "@/lib/types";
import { candles as fallbackCandles } from "@/lib/mock-data";
import { useMarketStore } from "@/store/market-store";
import { Panel } from "./ui";

type GridSize = number | "all";
type IndicatorKey = "levels" | "ad" | "rsi" | "macd" | "ema" | "volume" | "atr" | "adx";
type IndicatorVisibility = Record<IndicatorKey, boolean>;

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

const indicatorLabels: Array<{ key: IndicatorKey; label: string }> = [
  { key: "levels", label: "Auto Key Levels" },
  { key: "ad", label: "A/D" },
  { key: "rsi", label: "RSI" },
  { key: "macd", label: "MACD" },
  { key: "ema", label: "EMA" },
  { key: "volume", label: "Volume" },
  { key: "atr", label: "ATR" },
  { key: "adx", label: "ADX" }
];
const tradingThaiFont = "\"Noto Sans Thai\", \"IBM Plex Sans Thai\", \"LINE Seed Sans TH\", Inter, \"Segoe UI\", Arial, sans-serif";
const gridGreen = "#00e889";
const gridRed = "#ff2f55";
const afterHoursLine = "rgba(245, 248, 255, 0.98)";
const afterHoursTop = "rgba(203, 213, 225, 0.3)";
const afterHoursBottom = "rgba(203, 213, 225, 0.06)";

function signed(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function formatCompact(value: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
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
  const seed = symbol.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const direction = trendPercent >= 0 ? 1 : seed % 2 === 0 ? 1 : -1;
  const afterPrice = latest.close * (1 + direction * (0.0014 + (seed % 7) * 0.00045));
  return Array.from({ length: 7 }, (_, index) => {
    if (index === 0) return { time: latest.time as Time, value: latest.close };
    const progress = index / 6;
    const wave = Math.sin(index + seed) * latest.close * 0.001;
    return { time: nextAfterHoursTime(latest.time, index), value: Number((latest.close + (afterPrice - latest.close) * progress + wave).toFixed(2)) };
  });
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function calcRsi(candles: Candle[], period = 14) {
  if (candles.length <= period) return null;
  const closes = candles.map((candle) => candle.close);
  const changes = closes.slice(-period - 1).slice(1).map((close, index, rows) => close - (index === 0 ? closes.at(-period - 1)! : rows[index - 1]));
  const gains = changes.map((change) => Math.max(0, change));
  const losses = changes.map((change) => Math.max(0, -change));
  const avgGain = average(gains) ?? 0;
  const avgLoss = average(losses) ?? 0;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function emaSeries(values: number[], period: number) {
  const multiplier = 2 / (period + 1);
  const series: number[] = [];
  values.forEach((value, index) => series.push(index === 0 ? value : value * multiplier + series[index - 1] * (1 - multiplier)));
  return series;
}

function calcMacd(candles: Candle[]) {
  const closes = candles.map((candle) => candle.close);
  if (closes.length < 26) return { macd: null, signal: null, histogram: null };
  const ema12 = emaSeries(closes, 12);
  const ema26 = emaSeries(closes, 26);
  const macdSeries = closes.map((_, index) => ema12[index] - ema26[index]);
  const signalSeries = emaSeries(macdSeries, 9);
  const macd = macdSeries.at(-1) ?? null;
  const signal = signalSeries.at(-1) ?? null;
  return { macd, signal, histogram: macd !== null && signal !== null ? macd - signal : null };
}

function calcAtr(candles: Candle[], period = 14) {
  if (candles.length < 2) return null;
  const ranges = candles.slice(1).map((candle, index) => {
    const previousClose = candles[index].close;
    return Math.max(candle.high - candle.low, Math.abs(candle.high - previousClose), Math.abs(candle.low - previousClose));
  });
  return average(ranges.slice(-period));
}

function calcStochastic(candles: Candle[], period = 14) {
  const recent = candles.slice(-period);
  const latest = candles.at(-1);
  if (!recent.length || !latest) return null;
  const high = Math.max(...recent.map((candle) => candle.high));
  const low = Math.min(...recent.map((candle) => candle.low));
  return high === low ? 50 : ((latest.close - low) / (high - low)) * 100;
}

function calcAdx(candles: Candle[], period = 14) {
  if (candles.length <= period + 1) return null;
  const recent = candles.slice(-period - 1);
  const rows = recent.slice(1).map((candle, index) => {
    const previous = recent[index];
    const upMove = candle.high - previous.high;
    const downMove = previous.low - candle.low;
    const plusDm = upMove > downMove && upMove > 0 ? upMove : 0;
    const minusDm = downMove > upMove && downMove > 0 ? downMove : 0;
    const trueRange = Math.max(candle.high - candle.low, Math.abs(candle.high - previous.close), Math.abs(candle.low - previous.close));
    return { plusDm, minusDm, trueRange };
  });
  const tr = rows.reduce((sum, row) => sum + row.trueRange, 0);
  if (tr === 0) return null;
  const plusDi = 100 * (rows.reduce((sum, row) => sum + row.plusDm, 0) / tr);
  const minusDi = 100 * (rows.reduce((sum, row) => sum + row.minusDm, 0) / tr);
  return plusDi + minusDi === 0 ? 0 : Math.abs(plusDi - minusDi) / (plusDi + minusDi) * 100;
}

function calcMiniAnalytics(candles: Candle[]) {
  const latest = candles.at(-1);
  const recent = candles.slice(-20);
  const closes = candles.map((candle) => candle.close);
  const avgVolume = average(recent.map((candle) => candle.volume)) ?? 0;
  const currentVolume = latest?.volume ?? 0;
  const upVolume = recent.filter((candle) => candle.close >= candle.open).reduce((sum, candle) => sum + candle.volume, 0);
  const totalVolume = Math.max(1, recent.reduce((sum, candle) => sum + candle.volume, 0));
  const buyPressure = upVolume / totalVolume * 100;
  const rvol = avgVolume ? currentVolume / avgVolume : 0;
  const macd = calcMacd(candles);
  const rsi = calcRsi(candles);
  const atr = calcAtr(candles);
  const stochastic = calcStochastic(candles);
  const adx = calcAdx(candles);
  const ema20 = closes.length ? emaSeries(closes, 20).at(-1) ?? null : null;
  const ema50 = closes.length ? emaSeries(closes, 50).at(-1) ?? null : null;
  const support = recent.length ? Math.min(...recent.map((candle) => candle.low)) : null;
  const resistance = recent.length ? Math.max(...recent.map((candle) => candle.high)) : null;
  let adRunning = 0;
  const adSeries = candles.map((candle) => {
    const range = candle.high - candle.low;
    const multiplier = range === 0 ? 0 : ((candle.close - candle.low) - (candle.high - candle.close)) / range;
    adRunning += multiplier * candle.volume;
    return adRunning;
  });
  const ad = adSeries.at(-1) ?? null;
  const adPrevious = adSeries.at(-6) ?? adSeries.at(-2) ?? null;
  const trendStrength = Math.min(100, Math.round((adx ?? 0) * 1.7));
  const momentum = Math.max(0, Math.min(100, Math.round(50 + (macd.histogram ?? 0) * 10)));
  const breakout = Math.max(5, Math.min(95, Math.round(rvol * 28 + trendStrength * 0.38 + (buyPressure > 55 ? 14 : 0))));
  const risk = Math.max(5, Math.min(95, Math.round((atr && latest ? atr / latest.close * 900 : 20) + (buyPressure < 45 ? 15 : 4))));
  return { currentVolume, avgVolume, buyPressure, rvol, rsi, macd, atr, stochastic, adx, ema20, ema50, support, resistance, ad, adPrevious, trendStrength, momentum, breakout, risk, smartMoney: Math.round(buyPressure * 0.62 + Math.min(38, rvol * 12)) };
}

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
  const count = Math.min(6, candles.length);
  if (!count) return [];
  const indexes = Array.from({ length: count }, (_, index) => Math.round((index / Math.max(1, count - 1)) * (candles.length - 1)));
  return Array.from(new Set(indexes)).map((index) => {
    const date = candleDate(candles[index]?.time);
    if (!date) return null;
    return {
      key: `${index}-${date.getTime()}`,
      label: index === 0 || date.getMonth() === 0 ? date.toLocaleDateString("th-TH", { year: "numeric", timeZone: "Asia/Bangkok" }) : date.toLocaleDateString("th-TH", { month: "short", timeZone: "Asia/Bangkok" }),
      full: date.toLocaleString("th-TH", { weekday: "short", day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })
    };
  }).filter((item): item is { key: string; label: string; full: string } => Boolean(item));
}

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

function MiniYahooStyleChart({ quote, timeframe, refreshNonce, indicators }: { quote: StockQuote; timeframe: string; refreshNonce: number; indicators: IndicatorVisibility }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [candles, setCandles] = useState<Candle[]>(fallbackCandles);
  const [provider, setProvider] = useState("mock");
  const [hoverQuote, setHoverQuote] = useState<HoverQuote | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/candles?symbol=${encodeURIComponent(quote.ticker)}&timeframe=${encodeURIComponent(timeframe)}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { provider: string; candles: Candle[] }) => {
        if (cancelled) return;
        setCandles(data.candles?.length ? data.candles : fallbackCandles);
        setProvider(data.provider ?? "mock");
      })
      .catch(() => {
        if (cancelled) return;
        setCandles(fallbackCandles);
        setProvider("mock");
      });
    return () => {
      cancelled = true;
    };
  }, [quote.ticker, timeframe, refreshNonce]);

  const stats = useMemo(() => {
    const latest = candles.at(-1);
    const previous = candles.at(-2) ?? latest;
    const first = candles[0] ?? latest;
    const change = latest && previous ? latest.close - previous.close : quote.price - quote.previousClose;
    const changePercent = previous ? (change / Math.max(0.01, previous.close)) * 100 : quote.changePercent;
    const sessionPercent = latest && first ? ((latest.close - first.close) / Math.max(0.01, first.close)) * 100 : quote.changePercent;
    const volume = latest?.volume ?? 0;
    return { latest, first, change, changePercent, sessionPercent, volume };
  }, [candles, quote.changePercent, quote.previousClose, quote.price]);

  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    const normalized = candles.map((candle) => ({ ...candle, time: candle.time as Time }));
    const afterHoursSeriesData = buildAfterHoursSeries(candles, quote.ticker);
    const afterHoursPadding = afterHoursSeriesData.length > 1 ? afterHoursSeriesData.length - 1 : 0;
    const visiblePointCount = Math.max(2, normalized.length + afterHoursPadding);
    const visibleFrom = normalized.length > 1 ? -0.5 : 0;
    const visibleTo = normalized.length > 1 ? normalized.length - 0.5 + afterHoursPadding : 1;
    const applyFullWidthRange = () => {
      const width = Math.max(1, Math.floor(element.getBoundingClientRect().width));
      chart.applyOptions({
        width,
        height: Math.max(1, Math.floor(element.getBoundingClientRect().height)),
        timeScale: {
          barSpacing: Math.max(1, width / visiblePointCount),
          minBarSpacing: 1
        }
      });
      if (normalized.length > 1) {
        chart.timeScale().setVisibleLogicalRange({ from: visibleFrom, to: visibleTo });
      } else {
        chart.timeScale().fitContent();
      }
    };
    const chart = createChart(element, {
      layout: {
        background: { type: ColorType.Solid, color: "#0b0d0f" },
        textColor: "rgba(226, 232, 240, 0.88)",
        fontFamily: tradingThaiFont
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.042)" },
        horzLines: { color: "rgba(255, 255, 255, 0.052)" }
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.08, bottom: 0.22 }
      },
      timeScale: {
        borderVisible: false,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        rightOffset: 0,
        barSpacing: Math.max(1, Math.max(1, element.getBoundingClientRect().width) / visiblePointCount),
        minBarSpacing: 1
      },
      crosshair: {
        vertLine: { color: "rgba(226, 232, 240, 0.42)", style: LineStyle.Dashed, labelBackgroundColor: "#111827" },
        horzLine: { color: "rgba(239, 68, 68, 0.38)", style: LineStyle.Dotted, labelBackgroundColor: "#111827" }
      },
      width: Math.max(1, Math.floor(element.getBoundingClientRect().width)),
      height: Math.max(1, Math.floor(element.getBoundingClientRect().height))
    });

    const candleByTime = new Map(normalized.map((candle) => [timeKey(candle.time), candle]));
    const firstClose = normalized[0]?.close ?? quote.previousClose;
    const baseline = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: firstClose },
      topLineColor: gridGreen,
      topFillColor1: "rgba(0, 232, 137, 0.46)",
      topFillColor2: "rgba(0, 232, 137, 0.08)",
      bottomLineColor: gridRed,
      bottomFillColor1: "rgba(255, 47, 85, 0.08)",
      bottomFillColor2: "rgba(255, 47, 85, 0.48)",
      lineWidth: 3
    });
    baseline.setData(normalized.map((candle) => ({ time: candle.time, value: candle.close })));

    if (indicators.volume) {
      const volume = chart.addSeries(HistogramSeries, {
        priceScaleId: "",
        priceFormat: { type: "volume" },
        title: "Volume"
      });
      volume.setData(
        normalized.map((candle) => ({
          time: candle.time,
          value: candle.volume,
          color: candle.close >= candle.open ? "rgba(0, 232, 137, 0.78)" : "rgba(255, 47, 85, 0.72)"
        }))
      );
    }

    if (afterHoursSeriesData.length > 1) {
      const afterHours = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: stats.latest?.close ?? quote.price },
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
      afterHours.setData(afterHoursSeriesData);
    }

    applyFullWidthRange();
    const delayedResizeIds = [50, 180, 420].map((delay) => window.setTimeout(applyFullWidthRange, delay));

    chart.subscribeCrosshairMove((param) => {
      if (!param.point || !param.time || param.point.x < 0 || param.point.y < 0 || param.point.x > element.clientWidth || param.point.y > element.clientHeight) {
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

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      requestAnimationFrame(applyFullWidthRange);
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      delayedResizeIds.forEach((id) => window.clearTimeout(id));
      setHoverQuote(null);
      chart.remove();
    };
  }, [candles, indicators.volume, quote.previousClose, quote.ticker]);

  const up = stats.sessionPercent >= 0;
  const timeAxis = buildTimeAxis(candles);
  const analytics = useMemo(() => calcMiniAnalytics(candles), [candles]);
  const afterHoursValue = buildAfterHoursSeries(candles, quote.ticker).at(-1)?.value ?? stats.latest?.close ?? quote.price;
  const levelBadges = [
    indicators.levels && analytics.resistance !== null ? { label: "R", title: "Resistance", value: analytics.resistance.toFixed(2), className: "border-pink-300/55 bg-pink-300/16 text-pink-50" } : null,
    indicators.ema && analytics.ema20 !== null ? { label: "EMA20", title: "EMA20", value: analytics.ema20.toFixed(2), className: "border-yellow-300/55 bg-yellow-300/16 text-yellow-50" } : null,
    indicators.levels && analytics.support !== null ? { label: "S", title: "Support", value: analytics.support.toFixed(2), className: "border-cyan-300/55 bg-cyan-300/16 text-cyan-50" } : null,
    { label: "AH", title: "After-hours", value: afterHoursValue.toFixed(2), className: "border-slate-200/45 bg-slate-200/14 text-slate-50" },
    indicators.volume ? { label: "Vol", title: "Volume", value: formatCompact(stats.volume), className: "border-[#18e08a]/50 bg-[#18e08a]/16 text-[#d5ffe7]" } : null
  ].filter((item): item is { label: string; title: string; value: string; className: string } => Boolean(item));

  return (
    <article className="relative h-full overflow-hidden rounded-lg border border-cyan-300/20 bg-[#0b0d0f] shadow-[0_18px_46px_rgba(0,0,0,.34)] ring-1 ring-white/[0.06] transition hover:border-cyan-300/45 hover:ring-cyan-300/20">
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono font-semibold text-slate-100">{quote.ticker}</span>
        <span className={up ? "font-mono text-[#18e08a]" : "font-mono text-[#ef3340]"}>{signed(stats.sessionPercent)}%</span>
        <span className="font-mono text-slate-400">{provider.toUpperCase()}</span>
      </div>
      <div className="pointer-events-none absolute right-2 top-2 z-10 text-right font-mono text-xs">
        <p className="text-slate-100">${(stats.latest?.close ?? quote.price).toFixed(2)}</p>
        <p className={stats.change >= 0 ? "text-[#18e08a]" : "text-[#ef3340]"}>{signed(stats.change)} · {signed(stats.changePercent)}%</p>
      </div>
      <div className="pointer-events-none absolute left-2 top-7 z-10 flex max-w-[88%] flex-wrap items-center gap-1 rounded border border-white/10 bg-black/35 px-1.5 py-0.5 backdrop-blur-sm">
        {levelBadges.map((badge) => (
          <span key={badge.title} title={badge.title} className={`rounded-sm border px-1 py-[1px] text-[8px] font-black leading-3 shadow-[0_8px_20px_rgba(0,0,0,.35)] [font-family:var(--font-mono)] ${badge.className}`}>{badge.label} {badge.value}</span>
        ))}
      </div>
      <div className="pointer-events-none absolute right-2 top-[48%] z-10 rounded border border-white/10 bg-[#0b0d0f]/90 px-2 py-1 font-mono text-[10px] text-slate-100">
        Last ${(stats.latest?.close ?? quote.price).toFixed(2)}
      </div>
      <div ref={containerRef} className="h-[340px] w-full md:h-[380px] xl:h-[420px]" />
      <div className="flex items-center justify-between gap-2 border-y border-white/10 bg-black/30 px-2 py-1.5 font-mono text-[10px] text-slate-400">
        {timeAxis.map((item) => <span key={item.key} title={item.full} className="shrink-0">{item.label}</span>)}
      </div>
      <div className="grid gap-px bg-cyan-300/15 text-[10px] sm:grid-cols-3">
        {indicators.volume ? <section className="bg-[#0b0d0f] p-2.5">
          <p className="font-semibold text-slate-100">Volume Panel</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-300">
            <span>Vol {formatCompact(analytics.currentVolume)}</span>
            <span>Avg {formatCompact(analytics.avgVolume)}</span>
            <span>RVOL {analytics.rvol.toFixed(2)}x</span>
            <span>Buy {analytics.buyPressure.toFixed(0)}%</span>
            <span className={analytics.rvol >= 1.8 ? "text-amber-200" : "text-slate-400"}>Spike {analytics.rvol >= 1.8 ? "Yes" : "No"}</span>
            <span>Dark {formatCompact(analytics.currentVolume * 0.14)}</span>
          </div>
        </section> : null}
        {(indicators.rsi || indicators.macd || indicators.atr || indicators.adx || indicators.ema || indicators.ad || indicators.levels) ? <section className="bg-[#0b0d0f] p-2.5">
          <p className="font-semibold text-slate-100">Technical Indicators</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-300">
            {indicators.levels ? <span>Key S/R {analytics.support === null ? "-" : analytics.support.toFixed(1)} / {analytics.resistance === null ? "-" : analytics.resistance.toFixed(1)}</span> : null}
            {indicators.ad ? <span>A/D {analytics.ad === null ? "-" : formatCompact(analytics.ad)}</span> : null}
            {indicators.rsi ? <span>RSI {analytics.rsi === null ? "-" : analytics.rsi.toFixed(1)}</span> : null}
            {indicators.rsi ? <span>{analytics.rsi !== null && analytics.rsi >= 70 ? "Overbought" : analytics.rsi !== null && analytics.rsi <= 30 ? "Oversold" : "Neutral"}</span> : null}
            {indicators.macd ? <span>MACD {analytics.macd.macd === null ? "-" : analytics.macd.macd.toFixed(2)}</span> : null}
            {indicators.macd ? <span>Hist {analytics.macd.histogram === null ? "-" : analytics.macd.histogram.toFixed(2)}</span> : null}
            {indicators.ema ? <span>EMA20 {analytics.ema20 === null ? "-" : analytics.ema20.toFixed(2)}</span> : null}
            {indicators.ema ? <span>EMA50 {analytics.ema50 === null ? "-" : analytics.ema50.toFixed(2)}</span> : null}
            <span>Stoch {analytics.stochastic === null ? "-" : analytics.stochastic.toFixed(1)}</span>
            {indicators.atr ? <span>ATR {analytics.atr === null ? "-" : analytics.atr.toFixed(2)}</span> : null}
            {indicators.adx ? <span>ADX {analytics.adx === null ? "-" : analytics.adx.toFixed(1)}</span> : null}
            {indicators.adx ? <span>{analytics.adx !== null && analytics.adx >= 25 ? "Trend แข็งแรง" : "Trend อ่อน"}</span> : null}
          </div>
        </section> : null}
        <section className="bg-[#0b0d0f] p-2.5">
          <p className="font-semibold text-slate-100">AI Analysis แปลไทย</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-300">
            <span>Trend {analytics.trendStrength}/100</span>
            <span>Momentum {analytics.momentum}/100</span>
            <span>Breakout {analytics.breakout}%</span>
            <span>Risk {analytics.risk}%</span>
            <span>Smart {analytics.smartMoney}/100</span>
            <span>{analytics.adx !== null && analytics.adx >= 25 ? "Trend แข็งแรง" : "Trend อ่อน"}</span>
          </div>
        </section>
      </div>
      {hoverQuote ? (
        <div
          className="pointer-events-none absolute z-20 w-[214px] rounded-md border border-cyan-300/20 bg-[#101620]/95 p-3 text-xs text-slate-300 shadow-[0_18px_44px_rgba(0,0,0,.38)]"
          style={{
            left: Math.min(Math.max(8, hoverQuote.x + 12), Math.max(8, (containerRef.current?.clientWidth ?? 240) - 222)),
            top: Math.min(Math.max(8, hoverQuote.y + 12), Math.max(8, (containerRef.current?.clientHeight ?? 160) - 148))
          }}
        >
          <div className="mb-2 border-b border-white/10 pb-2 font-mono text-[11px] text-slate-100">{hoverQuote.dateTime}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-slate-400">Open</span><strong className="text-right font-mono text-slate-100">${hoverQuote.open.toFixed(2)}</strong>
            <span className="text-slate-400">High</span><strong className="text-right font-mono text-[#18e08a]">${hoverQuote.high.toFixed(2)}</strong>
            <span className="text-slate-400">Low</span><strong className="text-right font-mono text-[#ef3340]">${hoverQuote.low.toFixed(2)}</strong>
            <span className="text-slate-400">Close</span><strong className="text-right font-mono text-slate-100">${hoverQuote.close.toFixed(2)}</strong>
            <span className="text-slate-400">Volume</span><strong className="text-right font-mono text-slate-100">{formatCompact(hoverQuote.volume)}</strong>
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function NineChartGridPage() {
  const { quotes, timeframe, setTimeframe, requestRefresh, refreshNonce, setSelectedTicker } = useMarketStore();
  const [start, setStart] = useState(0);
  const [grid, setGrid] = useState<GridSize>(9);
  const [indicatorVisibility, setIndicatorVisibility] = useState<IndicatorVisibility>(defaultIndicatorVisibility);
  const rows = grid === "all" ? quotes : quotes.slice(start, start + grid);

  return (
    <Panel className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Multi monitor</p>
          <h2 className="mt-1 text-xl font-semibold text-white">9 Chart Grid</h2>
          <p className="mt-1 text-sm text-slate-400">กราฟทุกหุ้นเป็นสไตล์ Yahoo dark แบบเต็มช่อง: baseline แดง/เขียว พร้อม volume ด้านล่าง</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={start} onChange={(event) => setStart(Number(event.target.value))} disabled={grid === "all"} className="h-10 rounded-md border border-white/10 bg-slate-950 px-3 text-slate-100 disabled:opacity-45">
            {quotes.map((quote, index) => <option key={quote.ticker} value={index}>Start {quote.ticker}</option>)}
          </select>
          <button onClick={requestRefresh} className="h-10 rounded-md border border-white/10 px-3 text-sm text-slate-300 hover:border-cyan-300/40">Refresh</button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["1D", "5D", "1M", "6M", "YTD", "1Y", "5Y"].map((item) => (
            <button key={item} onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-2 text-sm ${timeframe === item ? "bg-[#18e08a] text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([4, 6, 9, "all"] as GridSize[]).map((item) => (
            <button key={item} onClick={() => setGrid(item)} className={`rounded-md px-3 py-2 text-sm ${grid === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300"}`}>
              {item === "all" ? "ทุกหุ้น" : `${item} ช่อง`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 rounded-md border border-white/10 bg-black/20 p-3">
        {indicatorLabels.map((item) => (
          <button
            key={item.key}
            onClick={() => setIndicatorVisibility((current) => ({ ...current, [item.key]: !current[item.key] }))}
            className={`rounded-md border px-2.5 py-1.5 text-xs transition ${indicatorVisibility[item.key] ? "border-[#18e08a]/45 bg-[#18e08a]/12 text-[#b6ffd8]" : "border-white/10 bg-white/[0.035] text-slate-500"}`}
          >
            {indicatorVisibility[item.key] ? "ON" : "OFF"} {item.label}
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-4 ${grid === "all" || grid === 9 ? "xl:grid-cols-3" : grid === 6 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
        {rows.map((quote) => (
          <button key={quote.ticker} onClick={() => setSelectedTicker(quote.ticker)} className="block h-full min-w-0 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60">
            <MiniYahooStyleChart quote={quote} timeframe={timeframe} refreshNonce={refreshNonce} indicators={indicatorVisibility} />
          </button>
        ))}
      </div>
    </Panel>
  );
}
