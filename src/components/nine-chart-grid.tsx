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

function signed(value: number, digits = 2) {
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

function visibleRangePadding(pointCount: number) {
  if (pointCount <= 12) return 0.5;
  if (pointCount <= 40) return 2;
  return Math.min(10, Math.max(3, pointCount * 0.035));
}

function formatCompact(value: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
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
    const chart = createChart(element, {
      layout: {
        background: { type: ColorType.Solid, color: "#0b0d0f" },
        textColor: "rgba(203, 213, 225, 0.72)"
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.045)" },
        horzLines: { color: "rgba(255, 255, 255, 0.055)" }
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.06, bottom: 0.22 }
      },
      timeScale: {
        borderVisible: false,
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        rightOffset: 0,
        barSpacing: candles.length <= 40 ? 8 : 4.5,
        minBarSpacing: 2
      },
      crosshair: {
        vertLine: { color: "rgba(226, 232, 240, 0.42)", style: LineStyle.Dashed, labelBackgroundColor: "#111827" },
        horzLine: { color: "rgba(239, 68, 68, 0.38)", style: LineStyle.Dotted, labelBackgroundColor: "#111827" }
      },
      width: element.clientWidth,
      height: element.clientHeight
    });

    const normalized = candles.map((candle) => ({ ...candle, time: candle.time as Time }));
    const candleByTime = new Map(normalized.map((candle) => [timeKey(candle.time), candle]));
    const firstClose = normalized[0]?.close ?? quote.previousClose;
    const baseline = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: firstClose },
      topLineColor: "#009688",
      topFillColor1: "rgba(0, 150, 136, 0.34)",
      topFillColor2: "rgba(0, 150, 136, 0.03)",
      bottomLineColor: "#ef3340",
      bottomFillColor1: "rgba(239, 51, 64, 0.04)",
      bottomFillColor2: "rgba(239, 51, 64, 0.30)",
      lineWidth: 2
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
          color: candle.close >= candle.open ? "rgba(0, 150, 136, 0.58)" : "rgba(239, 51, 64, 0.58)"
        }))
      );
    }

    if (normalized.length > 1) {
      const padding = visibleRangePadding(normalized.length);
      chart.timeScale().setVisibleLogicalRange({ from: -padding, to: normalized.length - 1 + padding });
    } else {
      chart.timeScale().fitContent();
    }

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
      chart.applyOptions({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height)
      });
    });
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
      setHoverQuote(null);
      chart.remove();
    };
  }, [candles, indicators.volume, quote.previousClose]);

  const up = stats.sessionPercent >= 0;
  const timeAxis = buildTimeAxis(candles);
  const analytics = useMemo(() => calcMiniAnalytics(candles), [candles]);

  return (
    <article className="relative overflow-hidden rounded-md border border-white/10 bg-[#0b0d0f] shadow-[0_16px_40px_rgba(0,0,0,.24)]">
      <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono font-semibold text-slate-100">{quote.ticker}</span>
        <span className={up ? "font-mono text-[#009688]" : "font-mono text-[#ef3340]"}>{signed(stats.sessionPercent)}%</span>
        <span className="font-mono text-slate-500">{provider.toUpperCase()}</span>
      </div>
      <div className="pointer-events-none absolute right-2 top-2 z-10 text-right font-mono text-xs">
        <p className="text-slate-100">${(stats.latest?.close ?? quote.price).toFixed(2)}</p>
        <p className={stats.change >= 0 ? "text-[#009688]" : "text-[#ef3340]"}>{signed(stats.change)} · {signed(stats.changePercent)}%</p>
      </div>
      {indicators.volume ? <div className="pointer-events-none absolute bottom-2 left-2 z-10 font-mono text-[10px] text-slate-500">Volume {formatCompact(stats.volume)}</div> : null}
      <div className="pointer-events-none absolute right-2 top-[48%] z-10 rounded border border-white/10 bg-[#0b0d0f]/90 px-2 py-1 font-mono text-[10px] text-slate-100">
        Last ${(stats.latest?.close ?? quote.price).toFixed(2)}
      </div>
      {indicators.levels ? (
        <div className="pointer-events-none absolute right-2 top-[58%] z-10 rounded border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 font-mono text-[10px] text-cyan-100">
          S {analytics.support === null ? "-" : analytics.support.toFixed(2)} / R {analytics.resistance === null ? "-" : analytics.resistance.toFixed(2)}
        </div>
      ) : null}
      {indicators.ema ? (
        <div className="pointer-events-none absolute right-2 top-[68%] z-10 rounded border border-amber-300/20 bg-amber-300/10 px-2 py-1 font-mono text-[10px] text-amber-100">
          EMA20 {analytics.ema20 === null ? "-" : analytics.ema20.toFixed(2)}
        </div>
      ) : null}
      <div ref={containerRef} className="h-[250px] w-full" />
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-2 py-1.5 font-mono text-[10px] text-slate-500">
        {timeAxis.map((item) => <span key={item.key} title={item.full} className="shrink-0">{item.label}</span>)}
      </div>
      <div className="grid gap-px bg-white/10 text-[10px] sm:grid-cols-3">
        {indicators.volume ? <section className="bg-[#0b0d0f] p-2">
          <p className="font-semibold text-slate-100">Volume Panel</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-400">
            <span>Vol {formatCompact(analytics.currentVolume)}</span>
            <span>Avg {formatCompact(analytics.avgVolume)}</span>
            <span>RVOL {analytics.rvol.toFixed(2)}x</span>
            <span>Buy {analytics.buyPressure.toFixed(0)}%</span>
            <span className={analytics.rvol >= 1.8 ? "text-amber-200" : "text-slate-500"}>Spike {analytics.rvol >= 1.8 ? "Yes" : "No"}</span>
            <span>Dark {formatCompact(analytics.currentVolume * 0.14)}</span>
          </div>
        </section> : null}
        {(indicators.rsi || indicators.macd || indicators.atr || indicators.adx || indicators.ema || indicators.ad || indicators.levels) ? <section className="bg-[#0b0d0f] p-2">
          <p className="font-semibold text-slate-100">Technical Indicators</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-400">
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
        <section className="bg-[#0b0d0f] p-2">
          <p className="font-semibold text-slate-100">AI Analysis แปลไทย</p>
          <div className="mt-1 grid grid-cols-2 gap-1 font-mono text-slate-400">
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
          className="pointer-events-none absolute z-20 w-[214px] rounded-md border border-white/15 bg-[#101318]/95 p-3 text-xs text-slate-300 shadow-[0_18px_44px_rgba(0,0,0,.38)]"
          style={{
            left: Math.min(Math.max(8, hoverQuote.x + 12), Math.max(8, (containerRef.current?.clientWidth ?? 240) - 222)),
            top: Math.min(Math.max(8, hoverQuote.y + 12), Math.max(8, (containerRef.current?.clientHeight ?? 160) - 148))
          }}
        >
          <div className="mb-2 border-b border-white/10 pb-2 font-mono text-[11px] text-slate-100">{hoverQuote.dateTime}</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-slate-500">Open</span><strong className="text-right font-mono text-slate-100">${hoverQuote.open.toFixed(2)}</strong>
            <span className="text-slate-500">High</span><strong className="text-right font-mono text-[#009688]">${hoverQuote.high.toFixed(2)}</strong>
            <span className="text-slate-500">Low</span><strong className="text-right font-mono text-[#ef3340]">${hoverQuote.low.toFixed(2)}</strong>
            <span className="text-slate-500">Close</span><strong className="text-right font-mono text-slate-100">${hoverQuote.close.toFixed(2)}</strong>
            <span className="text-slate-500">Volume</span><strong className="text-right font-mono text-slate-100">{formatCompact(hoverQuote.volume)}</strong>
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
            <button key={item} onClick={() => setTimeframe(item)} className={`rounded-md px-3 py-2 text-sm ${timeframe === item ? "bg-[#009688] text-slate-950" : "border border-white/10 text-slate-300"}`}>{item}</button>
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
            className={`rounded-md border px-2.5 py-1.5 text-xs transition ${indicatorVisibility[item.key] ? "border-[#009688]/45 bg-[#009688]/12 text-[#8ff3df]" : "border-white/10 bg-white/[0.035] text-slate-500"}`}
          >
            {indicatorVisibility[item.key] ? "ON" : "OFF"} {item.label}
          </button>
        ))}
      </div>

      <div className={`mt-4 grid gap-3 ${grid === "all" || grid === 9 ? "xl:grid-cols-3" : grid === 6 ? "xl:grid-cols-3" : "xl:grid-cols-2"}`}>
        {rows.map((quote) => (
          <button key={quote.ticker} onClick={() => setSelectedTicker(quote.ticker)} className="min-w-0 text-left">
            <MiniYahooStyleChart quote={quote} timeframe={timeframe} refreshNonce={refreshNonce} indicators={indicatorVisibility} />
          </button>
        ))}
      </div>
    </Panel>
  );
}
