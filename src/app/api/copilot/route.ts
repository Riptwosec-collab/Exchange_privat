import { NextResponse } from "next/server";
import { summarizeMarket } from "@/lib/ai";

const institutionalOutputTemplate = `
ตอบเป็นภาษาไทยแบบ institutional-grade เท่านั้น และใช้โครงสร้างนี้:

1. Executive Summary
- สรุปสถานะหุ้น, bias, จุดที่ตลาดกำลัง price-in, และ thesis หลัก

2. Multi-Timeframe Analysis
- Intraday
- 1D
- 1W
- 1M
- Short-term / Mid-term / Long-term trend

3. Technical & Quant Dashboard
- Price Action / Market Structure
- RSI พร้อม Overbought/Oversold
- MACD พร้อม Momentum interpretation
- EMA/SMA trend
- ADX trend strength
- ATR volatility
- Support / Resistance
- Breakout / Breakdown Probability

4. Volume & Smart Money
- Volume, RVOL, Buy/Sell Pressure
- Accumulation / Distribution
- Liquidity zones และ liquidity grab
- Dark Pool, Options Flow, Insider Trading, Congress Trading, Hedge Fund Positioning
- หากไม่มีข้อมูลตรง ให้ระบุว่า "ไม่มีข้อมูล live จาก context นี้" และให้ inference จาก price/volume แทน

5. Market Context
- เทียบกับ Sector, Nasdaq, S&P500, peer companies
- Relative Strength: leading/lagging/neutral
- Sector rotation และ AI sector context ถ้าเกี่ยวข้อง

6. AI Pattern Detection
- ตรวจ Bull Flag, Bear Flag, Cup & Handle, Double Top/Bottom, Ascending/Descending Triangle, Wyckoff, Head and Shoulders, Breakout Structure
- ระบุ pattern ที่น่าจะเป็นมากที่สุด พร้อมเหตุผลและ invalidation

7. News / Earnings / Macro Impact
- ข่าวและ catalyst
- Earnings expectations
- Macro risk: rates, USD, yields, liquidity, risk-on/risk-off

8. Risk Analysis
- Volatility Risk
- Earnings Risk
- Valuation Risk
- Liquidity Risk
- Macro Risk
- News Risk
- Momentum Exhaustion Risk
- ให้ Risk Score, Volatility Score, Confidence Score 1-100

9. Scenario Engine
- Bull Case: probability %, price target, catalysts, risks
- Base Case: probability %, price target, catalysts, risks
- Bear Case: probability %, price target, catalysts, risks

10. Trade Setup Engine
- Entry zones
- Support zones
- Resistance zones
- Stop loss
- Take profit targets
- Risk/Reward ratio
- Swing trade setup
- Momentum trade setup
- Long-term investment view

11. AI Conclusion
- Overall Trend: Bullish / Neutral / Bearish
- Momentum Strength: Weak / Moderate / Strong
- Institutional Sentiment: Bullish / Neutral / Bearish
- AI Confidence Score: 0-100
- Trade Quality Score: 0-100
- Volatility Level: Low / Medium / High
- Final Summary แบบ professional institutional desk
`;

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "beginner" | "advanced" };
  const prompt = body.prompt ?? "วิเคราะห์หุ้นที่เลือกแบบ institutional-grade";
  const answer = await summarizeMarket(`
โหมด: ${body.mode ?? "advanced"} trader
ภารกิจ: วิเคราะห์หุ้นที่ผู้ใช้เลือกแบบ Hedge Fund / Quant / Technical / Macro / Smart Money desk

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
