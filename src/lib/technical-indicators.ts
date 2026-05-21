import type { Candle } from "./types";

export type TechnicalSnapshot = {
  ma20: number | null;
  ma50: number | null;
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  bollingerUpper: number | null;
  bollingerMiddle: number | null;
  bollingerLower: number | null;
  vwap: number | null;
  support: number | null;
  resistance: number | null;
};

function last<T>(items: T[]) {
  return items.length ? items[items.length - 1] : null;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function calculateSma(candles: Candle[], period: number) {
  const closes = candles.slice(-period).map((candle) => candle.close);
  return average(closes);
}

function calculateEmaSeries(values: number[], period: number) {
  if (!values.length) return [];
  const multiplier = 2 / (period + 1);
  const series: number[] = [];
  values.forEach((value, index) => {
    if (index === 0) {
      series.push(value);
      return;
    }
    series.push(value * multiplier + series[index - 1] * (1 - multiplier));
  });
  return series;
}

export function calculateRsi(candles: Candle[], period = 14) {
  if (candles.length <= period) return null;
  const closes = candles.map((candle) => candle.close);
  const changes = closes.slice(1).map((close, index) => close - closes[index]);
  const recent = changes.slice(-period);
  const gains = recent.map((change) => Math.max(0, change));
  const losses = recent.map((change) => Math.max(0, -change));
  const averageGain = average(gains) ?? 0;
  const averageLoss = average(losses) ?? 0;
  if (averageLoss === 0) return 100;
  const rs = averageGain / averageLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateMacd(candles: Candle[]) {
  const closes = candles.map((candle) => candle.close);
  if (closes.length < 26) return { macd: null, signal: null, histogram: null };
  const ema12 = calculateEmaSeries(closes, 12);
  const ema26 = calculateEmaSeries(closes, 26);
  const macdSeries = closes.map((_, index) => ema12[index] - ema26[index]);
  const signalSeries = calculateEmaSeries(macdSeries, 9);
  const macd = last(macdSeries);
  const signal = last(signalSeries);
  if (macd === null || signal === null) return { macd: null, signal: null, histogram: null };
  return { macd, signal, histogram: macd - signal };
}

export function calculateBollinger(candles: Candle[], period = 20, multiplier = 2) {
  const closes = candles.slice(-period).map((candle) => candle.close);
  const middle = average(closes);
  if (middle === null) return { upper: null, middle: null, lower: null };
  const variance = closes.reduce((sum, close) => sum + (close - middle) ** 2, 0) / closes.length;
  const deviation = Math.sqrt(variance);
  return {
    upper: middle + deviation * multiplier,
    middle,
    lower: middle - deviation * multiplier
  };
}

export function calculateVwap(candles: Candle[]) {
  const totals = candles.reduce(
    (acc, candle) => {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      acc.priceVolume += typicalPrice * candle.volume;
      acc.volume += candle.volume;
      return acc;
    },
    { priceVolume: 0, volume: 0 }
  );
  return totals.volume ? totals.priceVolume / totals.volume : null;
}

export function calculateSupportResistance(candles: Candle[], lookback = 40) {
  const recent = candles.slice(-lookback);
  if (!recent.length) return { support: null, resistance: null };
  return {
    support: Math.min(...recent.map((candle) => candle.low)),
    resistance: Math.max(...recent.map((candle) => candle.high))
  };
}

export function calculateTechnicals(candles: Candle[]): TechnicalSnapshot {
  const macd = calculateMacd(candles);
  const bollinger = calculateBollinger(candles);
  const levels = calculateSupportResistance(candles);

  return {
    ma20: calculateSma(candles, 20),
    ma50: calculateSma(candles, 50),
    rsi: calculateRsi(candles),
    macd: macd.macd,
    macdSignal: macd.signal,
    macdHistogram: macd.histogram,
    bollingerUpper: bollinger.upper,
    bollingerMiddle: bollinger.middle,
    bollingerLower: bollinger.lower,
    vwap: calculateVwap(candles),
    support: levels.support,
    resistance: levels.resistance
  };
}

export function formatIndicator(value: number | null, digits = 2) {
  if (value === null || !Number.isFinite(value)) return "-";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}
