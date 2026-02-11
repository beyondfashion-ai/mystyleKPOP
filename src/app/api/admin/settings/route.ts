import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  // TODO: Fetch admin settings from Firestore

  return NextResponse.json({
    success: true,
    settings: {
      dailyGenerationLimit: 20,
      moderationEnabled: true,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
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

  // TODO: Validate and update admin settings in Firestore
  // TODO: Log moderation action

  return NextResponse.json({
    success: true,
    settings: body,
    updatedAt: new Date().toISOString(),
    updatedBy: auth.user.uid,
  });
}
