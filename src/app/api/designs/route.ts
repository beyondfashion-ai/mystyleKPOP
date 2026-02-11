import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/requireAuth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  // TODO: Query Firestore designs where ownerUid === auth.user.uid
  // TODO: Return user's designs (both private and public)

  return NextResponse.json({
    success: true,
    designs: [],
  });
}
