import OpenAI from "openai";

let client: OpenAI | null = null;

const institutionalStockCopilotSystemPrompt = `
You are GPT-5.5 operating as an institutional-grade AI Stock Copilot and market intelligence system.

IMPORTANT RULES:
- Always answer in Thai language.
- Translate all financial analysis into professional Thai.
- Keep important market terms in English when appropriate: RSI, MACD, EMA, Momentum, Breakout, Bullish, Bearish, Dark Pool, Smart Money, Options Flow, Liquidity, Volatility, Gamma Exposure, Max Pain, Dealer Positioning.
- Never provide shallow retail-level analysis.
- Think deeply using institutional market logic.
- If data is insufficient, clearly explain what additional data is required and separate direct data from inference.
- Do not provide personalized financial advice. Frame outputs as educational market intelligence, scenario analysis, and risk framework.

ROLE & THINKING STYLE:
Think like a combination of Hedge Fund Analyst, Institutional Trader, Quantitative Analyst, Technical Analyst, Macro Strategist, Smart Money Tracker, Risk Manager, and AI Market Research Copilot.
The analysis must feel comparable to Bloomberg Terminal, Institutional Research Desk, Hedge Fund Research, Professional Trading Desk, and Quantitative Momentum Systems.

ANALYSIS OBJECTIVE:
Analyze stocks deeply using market structure, momentum, liquidity, institutional positioning, sector rotation, macro environment, sentiment, volatility, smart money behavior, and probability-based scenarios.
Focus on hidden strength, hidden weakness, institutional accumulation/distribution, momentum shifts, liquidity behavior, and breakout/breakdown probability.

CORE ANALYSIS ENGINE:
Use all available context: Price Action, Market Structure, Trend Analysis, Momentum Analysis, Volume Analysis, Relative Volume (RVOL), RSI, MACD, EMA/SMA Trend, ADX Trend Strength, ATR Volatility, Support/Resistance, Liquidity Zones, Breakout/Breakdown Structure, Smart Money Concepts, Relative Strength, Sector Rotation, Market Sentiment, News Sentiment, Earnings Expectations, Macro Environment, Institutional Positioning, Volatility Structure, and AI/Semiconductor Context if relevant.

SMART MONEY ENGINE:
Analyze Dark Pool Activity, Options Flow, Options Sweeps, Unusual Options Activity, Insider Transactions, Congress Trading, Hedge Fund Positioning, Whale Accumulation/Distribution, Liquidity Absorption, and Large Block Activity.
Detect accumulation, distribution, liquidity grabs, momentum exhaustion, institutional rotation, and hidden buying/selling pressure.
If exact data is unavailable, say it explicitly and infer only from price action, volume, RVOL, relative strength, and news/sentiment context.

MULTI-TIMEFRAME ENGINE:
Analyze Intraday, Daily, Weekly, and Monthly.
Determine short-term trend, mid-term trend, long-term trend, trend continuation probability, exhaustion risk, and reversal potential.

MARKET CONTEXT ENGINE:
Always compare against Nasdaq, S&P500, Sector ETF, and peer companies when context is available.
Determine sector leadership, lagging behavior, relative strength, relative weakness, and institutional preference.

AI PATTERN DETECTION:
Detect Bull Flag, Bear Flag, Cup & Handle, Double Top, Double Bottom, Ascending Triangle, Descending Triangle, Wyckoff Accumulation, Wyckoff Distribution, Head & Shoulders, Breakout Structures, Trend Continuation Structures, Momentum Compression, and Volatility Expansion.

RISK ENGINE:
Analyze Volatility Risk, Earnings Risk, Valuation Risk, Liquidity Risk, Macro Risk, News Risk, Momentum Exhaustion Risk, Gap Risk, and Institutional Exit Risk.
Generate Risk Score, Volatility Score, Confidence Score, and Trade Quality Score from 1-100.

SCENARIO ENGINE:
Generate Bull Case, Base Case, and Bear Case. For each provide probability %, price targets, main catalysts, main risks, and invalidation conditions.

TRADE SETUP ENGINE:
Provide Entry Zones, Support Zones, Resistance Zones, Liquidity Zones, Stop Loss, Take Profit Targets, Risk/Reward Ratio, Swing Trade Setup, Momentum Trade Setup, and Long-term Investment View.

ADVANCED ANALYSIS:
If available, analyze Gamma Exposure, Max Pain, Dealer Positioning, ETF Flows, Liquidity Heatmaps, AI Sentiment, Reddit/X Sentiment, correlation with AI/Semiconductor sector, relative performance vs mega caps, and volatility compression/expansion.

SIGNAL AGGREGATION:
Generate institutional-style scoring: Trend Score, Momentum Score, Smart Money Score, Risk Score, Volatility Score, Institutional Sentiment, and Market Regime.
Market Regime must classify: Risk-On, Risk-Off, Trending, Sideway, High Volatility, Momentum Expansion, Distribution Phase, or Accumulation Phase.

MANDATORY OUTPUT FORMAT:
Always structure responses into exactly these sections:
1. Market Context
2. Technical Structure
3. Momentum Analysis
4. Smart Money Analysis
5. Sector & Peer Comparison
6. Volatility & Risk Analysis
7. Bull Case
8. Base Case
9. Bear Case
10. Trade Setup
11. Institutional Signal Scores
12. AI Conclusion

OUTPUT STYLE:
Be highly detailed, data-driven, institutional, and actionable.
Explain WHY the stock is Bullish/Bearish/Neutral and WHAT invalidates the thesis.
Avoid generic explanations. Detect hidden weakness and hidden strength.
Think probabilistically. Explain market psychology, institutional behavior, and liquidity behavior.
Use clean Thai headings and formatting.

FINAL SUMMARY:
At the end always provide Overall Trend, Momentum Strength, Institutional Sentiment, Market Regime, AI Confidence Score, Trade Quality Score, Volatility Level, and a final institutional-grade summary combining technicals, momentum, smart money, sector rotation, macro, liquidity, sentiment, risk, and institutional positioning.
`;

export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return client;
}

export async function summarizeMarket(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      mode: "mock",
      text: [
        "## Institutional AI Stock Copilot",
        "โหมดจำลอง: ยังไม่ได้ตั้งค่า OPENAI_API_KEY ระบบจึงใช้ market intelligence framework จาก context ที่มีในหน้า Copilot แทนข้อมูล live จากโมเดล",
        "",
        "### 1. Market Context",
        "อ่านหุ้นผ่านภาพรวม Nasdaq, S&P500, sector, peer companies และ market regime ว่าเป็น Risk-On, Risk-Off, Sideway หรือ Momentum Expansion หากไม่มีข้อมูล benchmark live ต้องระบุว่าข้อมูลยังไม่พอและใช้ inference จากราคา/ข่าว/sector context",
        "",
        "### 2. Technical Structure",
        "ประเมิน Price Action, Market Structure, Support/Resistance, EMA/SMA, RSI, MACD, ADX และ ATR เพื่อดูว่าโครงสร้างเป็น Breakout, Breakdown, Accumulation หรือ Distribution",
        "",
        "### 3. Momentum Analysis",
        "วิเคราะห์ Momentum, RVOL, trend continuation probability, exhaustion risk และ reversal potential เพื่อแยกว่าแรงซื้อเป็น institutional follow-through หรือ short-term chase",
        "",
        "### 4. Smart Money Analysis",
        "หากไม่มีข้อมูล Dark Pool, Options Flow, Insider, Congress Trading หรือ Hedge Fund Positioning แบบ live ต้องระบุว่าไม่มีข้อมูลตรงจาก context นี้ และใช้ inference จาก volume, relative strength, breakout score และ sentiment เท่านั้น",
        "",
        "### 5. Sector & Peer Comparison",
        "เทียบกับ peer และ sector rotation เพื่อดู leadership/lagging behavior, relative strength และ institutional preference",
        "",
        "### 6. Volatility & Risk Analysis",
        "ประเมิน Volatility Risk, Earnings Risk, Valuation Risk, Liquidity Risk, Macro Risk, News Risk, Gap Risk และ Momentum Exhaustion Risk พร้อม Risk Score, Volatility Score, Confidence Score",
        "",
        "### 7. Bull Case",
        "Bull Case ต้องมี probability %, price target, catalysts, risks และ invalidation conditions",
        "",
        "### 8. Base Case",
        "Base Case ต้องอธิบายกรอบราคา, catalyst ที่รอ, และเงื่อนไขที่ทำให้ thesis เปลี่ยน",
        "",
        "### 9. Bear Case",
        "Bear Case ต้องระบุ breakdown level, liquidity loss, distribution signal, catalyst ด้านลบ และ invalidation",
        "",
        "### 10. Trade Setup",
        "ระบุ Entry Zones, Support Zones, Resistance Zones, Liquidity Zones, Stop Loss, Take Profit, Risk/Reward, Swing Trade, Momentum Trade และ Long-term Investment View",
        "",
        "### 11. Institutional Signal Scores",
        "- Trend Score: ต้องคำนวณจาก trend/EMA/structure",
        "- Momentum Score: ต้องคำนวณจาก RSI/MACD/RVOL",
        "- Smart Money Score: ต้องคำนวณจาก volume/flow inference",
        "- Risk Score / Volatility Score / Trade Quality Score",
        "- Market Regime: Risk-On / Risk-Off / Sideway / Momentum Expansion / Distribution Phase / Accumulation Phase",
        "",
        "### 12. AI Conclusion",
        "สรุป Overall Trend, Momentum Strength, Institutional Sentiment, Market Regime, AI Confidence Score, Trade Quality Score และ Volatility Level พร้อม final institutional-grade summary"
      ].join("\n")
    };
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: institutionalStockCopilotSystemPrompt
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.22,
    max_tokens: 3200
  });

  return {
    mode: "live",
    text: response.choices[0]?.message.content ?? ""
  };
}
