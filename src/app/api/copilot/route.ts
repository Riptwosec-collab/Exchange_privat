import { NextResponse } from "next/server";
import { summarizeMarket } from "@/lib/ai";

const institutionalOutputTemplate = `
ตอบเป็นภาษาไทยแบบ institutional-grade เท่านั้น
ห้ามตอบแบบ retail/shallow
ถ้าข้อมูลไม่พอ ให้แยกชัดเจนว่า "ข้อมูลตรงที่ยังขาด" และ "inference จาก context ที่มี"

ต้องใช้โครงสร้างนี้เสมอ:

1. Market Context
- วิเคราะห์ Nasdaq, S&P500, Sector ETF, peer companies, market regime
- ระบุว่า stock กำลัง lead sector, lag peers, มี relative strength หรือ relative weakness
- อธิบาย macro environment, sentiment, sector rotation และ institutional preference

2. Technical Structure
- Price Action, Market Structure, Support/Resistance, Liquidity Zones
- EMA/SMA Trend, RSI, MACD, ADX, ATR
- Breakout/Breakdown structure และ invalidation level
- ตรวจ pattern เช่น Bull Flag, Bear Flag, Cup & Handle, Double Top/Bottom, Ascending/Descending Triangle, Wyckoff, Head & Shoulders

3. Momentum Analysis
- Momentum, RVOL, volume impulse, trend continuation probability
- exhaustion risk, reversal potential, volatility compression/expansion
- อธิบาย market psychology ที่อยู่หลัง momentum

4. Smart Money Analysis
- Dark Pool Activity, Options Flow, Options Sweeps, Unusual Options Activity
- Insider Transactions, Congress Trading, Hedge Fund Positioning
- Whale Accumulation/Distribution, Liquidity Absorption, Large Block Activity
- หากไม่มีข้อมูล live ให้ระบุชัดว่าไม่มีข้อมูลตรง และใช้ inference จาก price/volume/relative strength/news context

5. Sector & Peer Comparison
- เทียบกับ sector, Nasdaq, S&P500 และ peers
- ระบุ leadership/lagging behavior, relative strength/weakness, institutional rotation

6. Volatility & Risk Analysis
- Volatility Risk, Earnings Risk, Valuation Risk, Liquidity Risk, Macro Risk, News Risk, Momentum Exhaustion Risk, Gap Risk, Institutional Exit Risk
- ให้ Risk Score, Volatility Score, Confidence Score และ Trade Quality Score 1-100

7. Bull Case
- Probability %
- Price Target
- Main Catalysts
- Main Risks
- Invalidation Conditions

8. Base Case
- Probability %
- Price Target
- Main Catalysts
- Main Risks
- Invalidation Conditions

9. Bear Case
- Probability %
- Price Target
- Main Catalysts
- Main Risks
- Invalidation Conditions

10. Trade Setup
- Entry Zones
- Support Zones
- Resistance Zones
- Liquidity Zones
- Stop Loss
- Take Profit Targets
- Risk/Reward Ratio
- Swing Trade Setup
- Momentum Trade Setup
- Long-term Investment View

11. Institutional Signal Scores
- Trend Score
- Momentum Score
- Smart Money Score
- Risk Score
- Volatility Score
- Institutional Sentiment
- Market Regime: Risk-On / Risk-Off / Trending / Sideway / High Volatility / Momentum Expansion / Distribution Phase / Accumulation Phase

12. AI Conclusion
- Overall Trend: Bullish / Neutral / Bearish
- Momentum Strength: Weak / Moderate / Strong
- Institutional Sentiment: Bullish / Neutral / Bearish
- Market Regime
- AI Confidence Score 0-100
- Trade Quality Score 0-100
- Volatility Level: Low / Medium / High
- Final institutional-grade summary รวม technicals, momentum, smart money, sector rotation, macro, liquidity, sentiment, risk และ institutional positioning
`;

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "beginner" | "advanced" };
  const prompt = body.prompt ?? "วิเคราะห์หุ้นที่เลือกแบบ institutional-grade";
  const answer = await summarizeMarket(`
โหมด: ${body.mode ?? "advanced"} trader
บทบาท: GPT-5.5 institutional-grade AI Stock Copilot และ market intelligence system
ภารกิจ: วิเคราะห์หุ้นแบบ Hedge Fund / Institutional Trader / Quant / Technical / Macro / Smart Money / Risk desk

${institutionalOutputTemplate}

Context:
${prompt}
`);

  return NextResponse.json({
    answer: answer.text,
    mode: answer.mode,
    memoryEnabled: true,
    disclaimer: "ข้อมูลนี้เป็น market intelligence เพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล"
  });
}
