import { NextResponse } from "next/server";
import { summarizeMarket } from "@/lib/ai";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "beginner" | "advanced" };
  const prompt = body.prompt ?? "สรุปตลาดและหุ้น AI ที่น่าจับตา";
  const answer = await summarizeMarket(`
โหมด: ${body.mode ?? "advanced"} trader
งาน: วิเคราะห์หุ้นแบบละเอียดรอบด้านเป็นภาษาไทย
กรอบคำตอบที่ต้องมี:
1. ภาพราคาและโมเมนตัม
2. ข่าวและ catalyst
3. แนวรับ แนวต้าน จุดเข้า จุดคัต เป้าหมาย
4. ปัจจัยพื้นฐาน/sector/คู่แข่ง
5. ความเสี่ยงและ scenario bullish/base/bearish
6. สรุปแผนที่ใช้งานได้จริง แต่ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล

Context:
${prompt}
`);

  return NextResponse.json({
    answer: answer.text,
    mode: answer.mode,
    memoryEnabled: true,
    disclaimer: "ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล"
  });
}
