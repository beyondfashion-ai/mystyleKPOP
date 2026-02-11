/**
 * Extracts the Bearer token from the Authorization header.
 * Returns null if no valid Bearer token is found.
 */
export function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
