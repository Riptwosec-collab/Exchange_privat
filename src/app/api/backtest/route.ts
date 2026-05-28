import { NextResponse } from "next/server";
import { candles } from "@/lib/mock-data";

export async function POST(request: Request) {
  const body = (await request.json()) as { strategy?: string; ticker?: string };
  const startingCapital = 10000;
  const endingCapital = candles.reduce((capital, candle, index) => {
    if (index === 0) return capital;
    const previous = candles[index - 1];
    const signal = candle.close > previous.close ? 1 : -0.35;
    return capital + signal * Math.abs(candle.close - previous.close) * 18;
  }, startingCapital);

  return NextResponse.json({
    ticker: body.ticker ?? "NVDA",
    strategy: body.strategy ?? "MA crossover + RSI confirmation",
    startingCapital,
    endingCapital: Number(endingCapital.toFixed(2)),
    returnPercent: Number((((endingCapital - startingCapital) / startingCapital) * 100).toFixed(2)),
    maxDrawdown: -8.4,
    winRate: 58.2
  });
}
