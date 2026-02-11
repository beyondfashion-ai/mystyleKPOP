import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/requireAuth";

const publishSchema = z.object({
  designId: z.string().min(1, "Design ID is required"),
  representativeIndex: z.number().int().min(0).max(3),
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

  const parsed = publishSchema.safeParse(body);
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

  const { designId, representativeIndex } = parsed.data;

  // TODO: Verify design ownership (ownerUid === auth.user.uid)
  // TODO: Update design document: representativeIndex, visibility: "public", publishedAt
  // TODO: Increment user totalPublished

  return NextResponse.json({
    success: true,
    designId,
    visibility: "public",
    representativeIndex,
    publishedAt: new Date().toISOString(),
  });
}
