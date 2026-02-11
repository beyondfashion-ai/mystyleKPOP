import { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * Returns null if the token is invalid or expired.
 */
export async function verifyIdToken(
  token: string
): Promise<DecodedIdToken | null> {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
