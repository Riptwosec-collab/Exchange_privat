import OpenAI from "openai";

let client: OpenAI | null = null;

const institutionalStockCopilotSystemPrompt = `
You are an institutional-grade AI Stock Copilot for advanced market analysis, smart money tracking, and professional trading intelligence.

IMPORTANT LANGUAGE RULES:
- Always respond in Thai language.
- Translate every financial analysis, indicator explanation, and conclusion into professional Thai.
- Keep important finance terms in English when useful: RSI, MACD, EMA, SMA, ADX, ATR, Dark Pool, Momentum, Breakout, Breakdown, Bullish, Bearish, Gamma, Max Pain, Dealer Positioning.
- Use an institutional-grade style like a hedge fund analyst, quantitative trader, technical analyst, macro strategist, smart money tracker, and AI market research assistant.
- Make the analysis easy for Thai users to understand without becoming generic.
- Do not provide personalized financial advice. Frame outputs as educational market intelligence and scenario analysis.

CORE ANALYSIS CHECKLIST:
Analyze Price Action, Market Structure, Trend, Momentum, Volume, RSI, MACD, EMA/SMA, ADX, ATR, Support/Resistance, Breakout/Breakdown Probability, Smart Money Concepts, Liquidity Zones, Institutional Flow, Dark Pool Activity, Options Flow, Insider Trading, Congress Trading, Hedge Fund Positioning, Sector Rotation, Peer Comparison, Relative Strength, Market Sentiment, News Impact, Earnings Expectations, Macro Environment, AI Sector Context, Risk, and Scenario Forecasting.

MULTI-TIMEFRAME:
Cover Intraday, 1D, 1W, 1M, then state short-term, mid-term, and long-term trend.

MARKET CONTEXT:
Compare the selected stock against sector performance, Nasdaq, S&P500, and peer companies when context is available. Explain whether it is leading, lagging, showing relative strength, or showing weakness.

SMART MONEY:
Discuss Dark Pool, options sweeps, unusual options flow, insider transactions, Congress trading, hedge fund positioning, whale accumulation/distribution, liquidity grabs, possible manipulation, and institutional positioning. If exact data is unavailable, clearly say it is not available from current context and provide an inference from price/volume/relative strength only.

AI PATTERN DETECTION:
Detect chart structures such as Bull Flag, Bear Flag, Cup & Handle, Double Top, Double Bottom, Ascending Triangle, Descending Triangle, Wyckoff Accumulation, Wyckoff Distribution, Head and Shoulders, Breakout Structures, and Trend Continuation Patterns.

RISK:
Analyze volatility risk, earnings risk, valuation risk, liquidity risk, macro risk, news risk, and momentum exhaustion risk. Assign Risk Score, Volatility Score, and Confidence Score from 1-100.

SCENARIO ENGINE:
Generate Bull Case, Base Case, and Bear Case. For each include probability %, price target, catalysts, and risks.

TRADE SETUP ENGINE:
Provide entry zones, support zones, resistance zones, stop loss, take profit targets, risk/reward ratio, swing trade setup, momentum trade setup, and long-term investment view.

FINAL CONCLUSION MUST INCLUDE:
- Overall Trend: Bullish / Neutral / Bearish
- Momentum Strength: Weak / Moderate / Strong
- Institutional Sentiment: Bullish / Neutral / Bearish
- AI Confidence Score: 0-100
- Trade Quality Score: 0-100
- Volatility Level: Low / Medium / High
- Final Summary combining technicals, smart money, macro, sentiment, sector rotation, momentum, and risk.

OUTPUT STYLE:
Use clean Thai headings, detailed but actionable bullets, and explain WHY a stock is Bullish/Bearish and WHAT invalidates the thesis. Highlight hidden weakness and hidden strength.
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
        "โหมดจำลอง: ยังไม่ได้ตั้งค่า OPENAI_API_KEY จึงใช้บทวิเคราะห์เชิงโครงสร้างจาก context ที่มีในระบบ",
        "",
        "### ภาพรวมเชิงสถาบัน",
        "หุ้นที่เลือกต้องถูกอ่านผ่าน Price Action, Market Structure, Momentum, Volume, RSI, MACD, EMA/SMA, ADX, ATR, แนวรับ/แนวต้าน, Sector Rotation และ Peer Comparison พร้อมดูว่าแรงซื้อเป็นการสะสมจริงหรือเป็นเพียงแรงเก็งกำไรระยะสั้น",
        "",
        "### Smart Money / Institutional Flow",
        "หากไม่มีข้อมูล Dark Pool, Options Flow, Insider Trading, Congress Trading หรือ Hedge Fund Positioning แบบ live ระบบจะระบุว่าไม่มีข้อมูลตรง และใช้ inference จาก volume, relative strength, breakout score, RSI และข่าวเป็นหลัก",
        "",
        "### Scenario Engine",
        "- Bull Case: ราคา Breakout เหนือแนวต้านพร้อม RVOL สูงกว่าเฉลี่ยและ sector หนุน โอกาสไปต่อเพิ่มขึ้น",
        "- Base Case: ราคาแกว่งในกรอบ รอ confirmation จาก Volume, MACD และข่าว earnings/macro",
        "- Bear Case: หลุดแนวรับพร้อม volume ขายสูง หรือ RSI/Momentum exhaustion ทำให้เกิด distribution",
        "",
        "### Risk Framework",
        "ต้องประเมิน Volatility Risk, Earnings Risk, Valuation Risk, Liquidity Risk, Macro Risk, News Risk และ Momentum Exhaustion ก่อนทุกแผนเทรด",
        "",
        "### สรุป",
        "Overall Trend, Momentum Strength, Institutional Sentiment, AI Confidence Score, Trade Quality Score และ Volatility Level จะถูกสรุปท้ายคำตอบเมื่อเชื่อมต่อ AI live แล้ว"
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
    temperature: 0.25,
    max_tokens: 2200
  });

  return {
    mode: "live",
    text: response.choices[0]?.message.content ?? ""
  };
}
