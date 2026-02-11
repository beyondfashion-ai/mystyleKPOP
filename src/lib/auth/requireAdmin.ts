import { NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { requireAuth } from "./requireAuth";

type AdminResult =
  | { user: DecodedIdToken; error: null }
  | { user: null; error: NextResponse };

/**
 * Validates the request has a valid Firebase auth token with admin Custom Claims.
 * Admin is determined exclusively by Custom Claims (admin: true), never client-side fields.
 */
export async function requireAdmin(request: Request): Promise<AdminResult> {
  const authResult = await requireAuth(request);
  if (authResult.error) {
    return authResult;
  }

  if (!authResult.user.admin) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Admin access required", code: "FORBIDDEN" },
        { status: 403 }
      ),
    };
  }

  return { user: authResult.user, error: null };
}
