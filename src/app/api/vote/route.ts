import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/requireAuth";

const voteSchema = z.object({
  designId: z.string().min(1, "Design ID is required"),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid request",
        code: "INVALID_REQUEST",
      },
      { status: 400 }
    );
  }

  const { designId } = parsed.data;
  const uid = auth.user.uid;

  // TODO: Use Firestore transaction for atomic like toggle:
  // 1. Check if likes/{designId}_{uid} exists
  // 2. If exists: delete document, decrement designs/{designId}.likeCount
  // 3. If not exists: create document, increment designs/{designId}.likeCount

  return NextResponse.json({
    success: true,
    action: "liked",
    likeCount: 1,
    _debug: { uid, designId },
  });
}
