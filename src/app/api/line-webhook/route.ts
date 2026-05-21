import { NextRequest, NextResponse } from "next/server";

type LineWebhookEvent = {
  type?: string;
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  message?: {
    type?: string;
    text?: string;
  };
};

type LineWebhookBody = {
  events?: LineWebhookEvent[];
};

function extractLineTargets(events: LineWebhookEvent[]) {
  return events
    .map((event) => {
      const source = event.source;
      const target = source?.userId ?? source?.groupId ?? source?.roomId;
      if (!target) return null;
      return {
        target,
        sourceType: source?.type ?? "unknown",
        eventType: event.type ?? "unknown",
        message: event.message?.type === "text" ? event.message.text ?? "" : ""
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "LINE webhook endpoint is ready. Set this URL in LINE Developers Console, then send a message to the bot.",
    envName: "LINE_TO",
    expectedTargetPrefix: "U for userId, C for groupId, R for roomId"
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as LineWebhookBody;
  const targets = extractLineTargets(body.events ?? []);

  for (const item of targets) {
    console.log(`[LINE_WEBHOOK] Set LINE_TO=${item.target} source=${item.sourceType} event=${item.eventType}`);
  }

  return NextResponse.json({
    ok: true,
    targets,
    lineTo: targets[0]?.target ?? null
  });
}
