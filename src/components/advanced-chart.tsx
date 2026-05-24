"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AreaSeries, BarSeries, BaselineSeries, CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries, LineStyle, LineType, type Time } from "lightweight-charts";
import { Maximize2, PenLine, RefreshCw, Share2 } from "lucide-react";
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

function visibleRangePadding(pointCount: number) {
  if (pointCount <= 8) return 0.5;
  if (pointCount <= 24) return 1;
  return Math.min(8, Math.max(2, pointCount * 0.03));
}

export function AdvancedChart({ fillViewport = false }: { fillViewport?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedTicker, setSelectedTicker, timeframe, setTimeframe, requestRefresh } = useMarketStore();
  const [chartData, setChartData] = useState<Candle[]>(fallbackCandles);
  const [provider, setProvider] = useState("mock");
  const [compare, setCompare] = useState("AMD");
  const [symbolSearch, setSymbolSearch] = useState("");
  const [showTools, setShowTools] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartMode, setChartMode] = useState<ChartMode>("Area");
  const technicals = useMemo(() => calculateTechnicals(chartData), [chartData]);
  const indicatorCards = useMemo(
    () => [
      { label: "MA20", title: "ค่าเฉลี่ย 20 วัน", value: formatIndicator(technicals.ma20), detail: "แนวโน้มระยะสั้น" },
      { label: "MA50", title: "ค่าเฉลี่ย 50 วัน", value: formatIndicator(technicals.ma50), detail: "แนวโน้มหลัก" },
      {
        label: "RSI",
        title: "แรงซื้อขาย",
        value: formatIndicator(technicals.rsi, 1),
        detail: technicals.rsi === null ? "รอข้อมูล" : technicals.rsi >= 70 ? "ซื้อมาก" : technicals.rsi <= 30 ? "ขายมาก" : "สมดุล"
      },
      {
        label: "MACD",
        title: "โมเมนตัม",
        value: `${formatIndicator(technicals.macd, 2)} / ${formatIndicator(technicals.macdSignal, 2)}`,
        detail: `Histogram ${formatIndicator(technicals.macdHistogram, 2)}`
      },
      {
        label: "Bollinger",
        title: "กรอบราคา",
        value: `${formatIndicator(technicals.bollingerLower)} - ${formatIndicator(technicals.bollingerUpper)}`,
        detail: `กลาง ${formatIndicator(technicals.bollingerMiddle)}`
      },
      { label: "VWAP", title: "ราคาเฉลี่ยถ่วงน้ำหนัก", value: formatIndicator(technicals.vwap), detail: "อิงราคาและวอลุ่ม" },
      { label: "Support", title: "แนวรับ", value: formatIndicator(technicals.support), detail: "ต่ำสุดช่วงล่าสุด" },
      { label: "Resistance", title: "แนวต้าน", value: formatIndicator(technicals.resistance), detail: "สูงสุดช่วงล่าสุด" }
    ],
    [technicals]
  );
  const chartHeightClass = isFullscreen
    ? "h-[calc(100vh-190px)] min-h-[390px]"
    : fillViewport
      ? "h-[calc(100vh-300px)] min-h-[390px]"
      : "h-[420px]";

  const symbolOptions = useMemo(
    () =>
      stockUniverse
        .filter((stock) => `${stock.ticker} ${stock.name} ${stock.sector}`.toLowerCase().includes(symbolSearch.toLowerCase()))
        .slice(0, stockUniverse.length),
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
    const response = await fetch(`/api/candles?symbol=${encodeURIComponent(selectedTicker)}&timeframe=${encodeURIComponent(timeframe)}`, {
      cache: "no-store"
    });
    const data = (await response.json()) as { provider: string; candles: Candle[] };
    setChartData(data.candles.length ? data.candles : fallbackCandles);
    setProvider(data.provider);
  }

  useEffect(() => {
    refreshCandles().catch(() => {
      setChartData(fallbackCandles);
      setProvider("mock");
    });
  }, [selectedTicker, timeframe]);

  useEffect(() => {
    if (!containerRef.current) return;
    const chartElement = containerRef.current;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#cbd5e1"
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.055)" },
        horzLines: { color: "rgba(148, 163, 184, 0.065)" }
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.16)",
        scaleMargins: { top: 0.08, bottom: chartMode === "Volume" ? 0.34 : 0.22 }
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.16)",
        fixRightEdge: true,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        rightOffset: 0,
        barSpacing: chartData.length <= 30 ? 18 : 10,
        minBarSpacing: 4
      },
      crosshair: {
        vertLine: { color: "rgba(226, 232, 240, 0.22)", labelBackgroundColor: "#111827" },
        horzLine: { color: "rgba(226, 232, 240, 0.18)", labelBackgroundColor: "#111827" }
      },
      width: chartElement.clientWidth,
      height: chartElement.clientHeight
    });
    const normalizedCandles = chartData.map((candle) => ({ ...candle, time: candle.time as Time }));
    const closeSeriesData = normalizedCandles.map((candle) => ({ time: candle.time, value: candle.close }));
    const firstClose = normalizedCandles[0]?.close ?? 0;
    const lastClose = normalizedCandles.at(-1)?.close ?? firstClose;
    const isUpTrend = lastClose >= firstClose;
    const lineColor = isUpTrend ? "#86efac" : "#f08ab2";
    const softLineColor = isUpTrend ? "#5ee584" : "#f472b6";
    const upFill = "rgba(74, 222, 128, 0.42)";
    const downFill = "rgba(244, 114, 182, 0.42)";
    const transparentFill = "rgba(15, 23, 42, 0)";

    const addLineSeries = (lineType: LineType, color = lineColor, width: 2 | 3 | 4 = 3) => {
      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth: width,
        lineType,
        lineStyle: LineStyle.Solid,
        crosshairMarkerVisible: true,
        pointMarkersVisible: chartMode === "Trend"
      });
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

    if (chartMode === "Bars") {
      const series = chart.addSeries(BarSeries, {
        upColor: "#7ee787",
        downColor: "#f08ab2",
        openVisible: true,
        thinBars: false
      });
      series.setData(normalizedCandles);
    } else if (chartMode === "Line") {
      addLineSeries(LineType.Simple);
    } else if (chartMode === "Area") {
      addAreaSeries();
    } else if (chartMode === "Baseline") {
      const series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: firstClose },
        topLineColor: "#7ee787",
        topFillColor1: "rgba(74, 222, 128, 0.44)",
        topFillColor2: "rgba(74, 222, 128, 0.06)",
        bottomLineColor: "#f08ab2",
        bottomFillColor1: "rgba(244, 114, 182, 0.06)",
        bottomFillColor2: "rgba(244, 114, 182, 0.44)",
        lineWidth: 3
      });
      series.setData(closeSeriesData);
    } else if (chartMode === "Smooth") {
      addAreaSeries(softLineColor, isUpTrend ? "rgba(94, 229, 132, 0.48)" : "rgba(244, 114, 182, 0.48)");
    } else if (chartMode === "Step") {
      addLineSeries(LineType.WithSteps, isUpTrend ? "#67e8f9" : "#f9a8d4", 3);
    } else if (chartMode === "Hollow") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "rgba(15, 23, 42, 0)",
        downColor: "#f08ab2",
        borderVisible: true,
        borderUpColor: "#7ee787",
        borderDownColor: "#f08ab2",
        wickUpColor: "#7ee787",
        wickDownColor: "#f08ab2"
      });
      series.setData(normalizedCandles);
    } else if (chartMode === "Trend") {
      addAreaSeries(lineColor, isUpTrend ? "rgba(74, 222, 128, 0.28)" : "rgba(244, 114, 182, 0.28)");
      const trendSeries = chart.addSeries(LineSeries, {
        color: "#facc15",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        lineType: LineType.Curved
      });
      trendSeries.setData(ma20.map((point) => ({ ...point, time: point.time as Time })));
    } else if (chartMode === "Volume") {
      addAreaSeries(lineColor, isUpTrend ? "rgba(74, 222, 128, 0.22)" : "rgba(244, 114, 182, 0.22)");
    } else {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#f43f5e",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#f43f5e"
      });
      series.setData(normalizedCandles);
    }

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "rgba(34, 211, 238, 0.35)",
      priceFormat: { type: "volume" },
      priceScaleId: ""
    });
    volumeSeries.setData(
      chartData.map((candle) => ({
        time: candle.time as Time,
        value: candle.volume,
        color: candle.close >= candle.open ? (chartMode === "Volume" ? "rgba(34,197,94,.55)" : "rgba(34,197,94,.22)") : chartMode === "Volume" ? "rgba(244,63,94,.55)" : "rgba(244,63,94,.22)"
      }))
    );

    if (!["Trend", "Volume"].includes(chartMode)) {
      const maSeries = chart.addSeries(LineSeries, { color: "#38bdf8", lineWidth: 2, lineStyle: LineStyle.Dotted, lineType: LineType.Curved });
      maSeries.setData(ma20.map((point) => ({ ...point, time: point.time as Time })));
    }

    const fitChartToFullWidth = () => {
      if (normalizedCandles.length > 1) {
        const padding = visibleRangePadding(normalizedCandles.length);
        chart.timeScale().setVisibleLogicalRange({
          from: -padding,
          to: normalizedCandles.length - 1 + padding
        });
      } else {
        chart.timeScale().fitContent();
      }
    };
    fitChartToFullWidth();

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      chart.applyOptions({
        width: Math.floor(width),
        height: Math.floor(height)
      });
      fitChartToFullWidth();
    });
    resizeObserver.observe(chartElement);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [chartData, chartMode, isFullscreen, ma20]);

  const activeChartMode = chartModes.find((mode) => mode.key === chartMode)?.label ?? "Area";

  return (
    <div className={`glass flex ${fillViewport || isFullscreen ? "h-full min-h-[calc(100vh-190px)]" : ""} flex-col rounded-lg p-4 ${isFullscreen ? "fixed inset-3 z-50 min-h-0 overflow-hidden" : ""}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Advanced Chart · {provider.toUpperCase()}</p>
          <h2 className="mt-1 text-xl font-semibold text-white">{selectedTicker} {activeChartMode}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={symbolSearch}
            onChange={(event) => setSymbolSearch(event.target.value)}
            className="h-8 w-36 rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-slate-100 outline-none"
            placeholder="Search watchlist"
          />
          <select
            value={selectedTicker}
            onChange={(event) => setSelectedTicker(event.target.value)}
            className="h-8 w-44 rounded-md border border-white/10 bg-slate-950 px-2 text-sm text-slate-100 outline-none"
          >
            {symbolOptions.map((stock) => (
              <option key={stock.ticker} value={stock.ticker}>{stock.ticker} - {stock.name}</option>
            ))}
          </select>
          <select
            value={chartMode}
            onChange={(event) => setChartMode(event.target.value as ChartMode)}
            className="h-8 w-32 rounded-md border border-fuchsia-300/25 bg-slate-950 px-2 text-sm text-slate-100 outline-none hover:border-fuchsia-300/60"
            title="Chart style"
          >
            {chartModes.map((mode) => (
              <option key={mode.key} value={mode.key}>{mode.label}</option>
            ))}
          </select>
          {timeframes.map((item) => (
            <button
              key={item}
              onClick={() => setTimeframe(item)}
              className={`h-8 rounded-md px-3 text-sm transition ${
                timeframe === item ? "bg-cyan-300 text-slate-950" : "border border-white/10 text-slate-300 hover:border-cyan-300/40"
              }`}
            >
              {item}
            </button>
          ))}
          <button title="Refresh chart" onClick={() => { requestRefresh(); refreshCandles(); }} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><RefreshCw size={16} /></button>
          <button title="Drawing tools" onClick={() => setShowTools((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><PenLine size={16} /></button>
          <button title="Compare stocks" onClick={() => setCompare(allStockSymbols[(allStockSymbols.indexOf(compare) + 1) % allStockSymbols.length] ?? "AMD")} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Share2 size={16} /></button>
          <button title="Fullscreen chart" onClick={() => setIsFullscreen((value) => !value)} className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-300"><Maximize2 size={16} /></button>
        </div>
      </div>
      {showTools ? (
        <div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-4">
          {["Trendline ready", "Fibonacci ready", "Support/Resistance", `Compare: ${compare}`].map((item) => (
            <button key={item} className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-left">{item}</button>
          ))}
        </div>
      ) : null}
      <div ref={containerRef} className={`advanced-chart-host mt-4 w-full shrink-0 overflow-hidden ${chartHeightClass}`} />
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4">
        {indicatorCards.map((item) => (
          <div key={item.label} className="min-h-[82px] rounded-md border border-white/10 bg-white/[0.035] px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan-200">{item.label}</span>
              <span className="truncate text-[11px] text-slate-500">{item.title}</span>
            </div>
            <strong className="mt-2 block truncate font-mono text-sm text-slate-100">{item.value}</strong>
            <span className="mt-1 block truncate text-slate-500">{item.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
