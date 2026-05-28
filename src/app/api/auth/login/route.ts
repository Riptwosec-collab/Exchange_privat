import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string; password?: string };

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  const token = signSession({
    id: "demo-user",
    email,
    role: "user"
  });

  return NextResponse.json({
    token,
    user: {
      id: "demo-user",
      email,
      role: "user"
    }
  });
}
