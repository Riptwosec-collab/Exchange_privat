import { NextResponse } from "next/server";
import { portfolio } from "@/lib/mock-data";

export async function GET() {
  const rows = portfolio.map((holding) => {
    const cost = holding.quantity * holding.buyPrice;
    const value = holding.quantity * holding.currentPrice;
    const pnl = value - cost;
    return { ...holding, cost, value, pnl, roi: pnl / cost };
  });
  const sectors = rows.reduce<Record<string, typeof rows>>((acc, row) => {
    acc[row.sector] = acc[row.sector] ?? [];
    acc[row.sector].push(row);
    return acc;
  }, {});
  return NextResponse.json({ holdings: rows, analytics: { totalValue: rows.reduce((sum, row) => sum + row.value, 0), unrealizedGain: rows.reduce((sum, row) => sum + row.pnl, 0), sectors } });
}

export async function POST(request: Request) {
  const holding = await request.json();
  return NextResponse.json({ message: "Holding accepted. Wire this route to PostgreSQL or MongoDB for persistence.", holding }, { status: 201 });
}
