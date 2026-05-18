import OpenAI from "openai";

let client: OpenAI | null = null;

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
      text: "AI mock: หุ้นกลุ่ม AI และ semiconductor ยังมีโมเมนตัมเด่น แต่ควรวาง stop loss ใต้แนวรับหลักและลดน้ำหนักก่อน event macro สำคัญ"
    };
  }

  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a Thai-speaking professional equity analyst. Be concise, practical, and include risk notes. Do not provide personalized financial advice."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });

  return {
    mode: "live",
    text: response.choices[0]?.message.content ?? ""
  };
}
