import { NextResponse } from "next/server";
import { heatmap, indices, watchlist } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    indices,
    watchlist,
    heatmap,
    provider: "mock",
    nextProviders: ["Yahoo Finance", "Finnhub", "Alpha Vantage", "Polygon.io", "TwelveData"]
  });
}
