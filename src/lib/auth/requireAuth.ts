import { NextResponse } from "next/server";
import { DecodedIdToken } from "firebase-admin/auth";
import { getBearerToken } from "./getBearerToken";
import { verifyIdToken } from "./verifyIdToken";

type AuthResult =
  | { user: DecodedIdToken; error: null }
  | { user: null; error: NextResponse };

/**
 * Validates the request has a valid Firebase auth token.
 * Returns the decoded user or an error response.
 */
export async function requireAuth(request: Request): Promise<AuthResult> {
  const token = getBearerToken(request);
  if (!token) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Missing or invalid auth token", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  const user = await verifyIdToken(token);
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Invalid or expired auth token", code: "UNAUTHORIZED" },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}
