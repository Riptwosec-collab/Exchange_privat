import { NextResponse } from "next/server";
import { summarizeMarket } from "@/lib/ai";

export async function POST(request: Request) {
  const body = (await request.json()) as { prompt?: string; mode?: "beginner" | "advanced" };
  const prompt = body.prompt ?? "สรุปตลาดและหุ้น AI ที่น่าจับตา";
  const answer = await summarizeMarket(`${body.mode ?? "advanced"} trader mode: ${prompt}`);
  return NextResponse.json({ answer: answer.text, mode: answer.mode, memoryEnabled: true, disclaimer: "ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนเฉพาะบุคคล" });
}
