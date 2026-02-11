import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBearerToken } from "@/lib/auth/getBearerToken";
import { verifyIdToken } from "@/lib/auth/verifyIdToken";

const patchSchema = z.object({
  representativeIndex: z.number().int().min(0).max(3).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Optionally check auth for userLiked status
  let uid: string | null = null;
  const token = getBearerToken(request);
  if (token) {
    const decoded = await verifyIdToken(token);
    uid = decoded?.uid ?? null;
  }

  // TODO: Fetch design from Firestore
  // TODO: If private, verify owner
  // TODO: NEVER include originalPrompt, englishPrompt, systemPrompt for non-owners

  return NextResponse.json({
    success: true,
    design: {
      designId: id,
      // Placeholder — will be populated from Firestore
    },
    userLiked: false,
    _debug: { uid },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth required for PATCH
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Authentication required", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
  const decoded = await verifyIdToken(token);
  if (!decoded) {
    return NextResponse.json(
      { success: false, error: "Invalid auth token", code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const parsed = patchSchema.safeParse(body);
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

  // TODO: Verify design ownership
  // TODO: Update design fields in Firestore
  // TODO: If publishing, set publishedAt

  return NextResponse.json({
    success: true,
    designId: id,
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  });
}
