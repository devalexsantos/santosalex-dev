/**
 * POST /api/chat/feedback
 *
 * Records a thumbs-up / thumbs-down (and optional comment) for a specific
 * AiChatMessage. Public route — no auth, but light rate-limited per IP via
 * the same Redis budget the chat uses (one feedback counts as one chat unit).
 *
 * Body: { messageId: string, rating: 1 | -1, comment?: string }
 * Returns 200 { ok: true, id } on success, 400/404/429 on validation/limit.
 */
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  messageId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(-1)]),
  comment: z.string().max(2000).optional(),
});

function ipHash(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");
  const raw = forwarded?.split(",")[0]?.trim() ?? real ?? "127.0.0.1";
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join("; ") },
      { status: 400 },
    );
  }

  const { messageId, rating, comment } = parsed.data;

  // Rate limit: 30 feedback events per hour per IP. Generous enough for
  // genuine use, tight enough to discourage spam.
  try {
    const rl = await checkRateLimit({
      key: `chat:fb:${ipHash(req)}`,
      limit: 30,
      windowSeconds: 3600,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many feedbacks. Try again later." },
        { status: 429 },
      );
    }
  } catch (err) {
    console.warn("[feedback] Rate limit check failed (Redis down?):", err);
    // Fail open
  }

  // Confirm the message exists before creating the FK row so we return 404
  // rather than letting Prisma surface a P2003 constraint error.
  const message = await prisma.aiChatMessage.findUnique({
    where: { id: messageId },
    select: { id: true, role: true },
  });

  if (!message || message.role !== "assistant") {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  try {
    const created = await prisma.aiFeedback.create({
      data: {
        messageId,
        rating,
        comment: comment?.trim() || null,
      },
      select: { id: true },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error("[feedback] Failed to persist:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
