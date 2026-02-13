import { adminAuth } from "./firebase-admin";
import { NextResponse } from "next/server";

/**
 * Verify Firebase ID token from Authorization header.
 * Returns decoded token or null.
 */
export async function verifyAuthToken(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  if (!token) return null;

  try {
    if (!adminAuth) {
      console.warn("Admin Auth not available, skipping token verification");
      return null;
    }
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Return a 401 JSON response.
 */
export function unauthorizedResponse(message = "Authentication required") {
  return NextResponse.json({ error: message }, { status: 401 });
}
