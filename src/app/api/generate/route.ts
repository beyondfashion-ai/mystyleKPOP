import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/requireAuth";

const generateSchema = z.object({
  group: z.string().optional(),
  concept: z.enum(["formal", "street", "concert", "school", "high_fashion"]),
  keywords: z.string().min(1, "Keywords are required"),
  visibility: z.enum(["public", "private"]).default("public"),
});

export async function POST(request: NextRequest) {
  // Validate auth (guest trial handled separately in future)
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  // Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body", code: "INVALID_REQUEST" },
      { status: 400 }
    );
  }

  const parsed = generateSchema.safeParse(body);
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

  const { group, concept, keywords } = parsed.data;

  // TODO: Check generationLimits for daily cap
  // TODO: Translate keywords to English via /api/translate
  // TODO: Compose system prompt (concept + group + translated keywords)
  // TODO: Call fal.ai API (Flux model, 4 images)
  // TODO: Upload images to Firebase Storage
  // TODO: Create Firestore designs document
  // TODO: Increment generationLimits counter

  return NextResponse.json({
    success: true,
    designId: "placeholder",
    imageUrls: [],
    generatedAt: new Date().toISOString(),
    remainingGenerations: 20,
    _debug: { uid: auth.user.uid, group, concept, keywords },
  });
}
