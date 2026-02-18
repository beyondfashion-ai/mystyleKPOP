import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { unauthorizedResponse, verifyAuthToken } from "@/lib/auth-helpers";

const ALLOWED_STYLE_IDS = new Set(["cyber", "y2k", "highteen", "sexy", "suit", "street", "girlcrush", "elegant", "dark", "retro", "military"]);
const ALLOWED_COLOR_IDS = new Set(["black-silver", "pink-white", "red-black", "blue-white", "neon-mix", "pastel"]);
const ALLOWED_STAGE_VIBES = new Set(["glam", "chic", "bright", "dark"]);

function normalizeStringList(input: unknown, maxItems: number, maxLen = 30): string[] {
  if (!Array.isArray(input)) return [];
  const normalized = input
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0 && v.length <= maxLen);
  return Array.from(new Set(normalized)).slice(0, maxItems);
}

function normalizeStyleList(input: unknown): string[] {
  const styles = normalizeStringList(input, 6, 20).map((s) => s.toLowerCase());
  return styles.filter((s) => ALLOWED_STYLE_IDS.has(s));
}

function normalizeColorList(input: unknown): string[] {
  const colors = normalizeStringList(input, 4, 20).map((s) => s.toLowerCase());
  return colors.filter((s) => ALLOWED_COLOR_IDS.has(s)).slice(0, 2);
}

export async function GET(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    if (!decoded?.uid) return unauthorizedResponse();

    if (adminDb) {
      const snap = await adminDb.collection("users").doc(decoded.uid).get();
      const data = snap.exists ? snap.data() : null;
      return NextResponse.json({
        success: true,
        personalization: data?.personalization || null,
      });
    }

    if (db) {
      const snap = await getDoc(doc(db, "users", decoded.uid));
      const data = snap.exists() ? snap.data() : null;
      return NextResponse.json({
        success: true,
        personalization: data?.personalization || null,
      });
    }

    return NextResponse.json({ success: true, personalization: null });
  } catch (error) {
    console.error("Get personalization error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const decoded = await verifyAuthToken(request);
    if (!decoded?.uid) return unauthorizedResponse();

    const body = await request.json();

    const favoriteGroups = normalizeStringList(body.favoriteGroups, 8, 30);
    const preferredStyles = normalizeStyleList(body.preferredStyles);
    const preferredColors = normalizeColorList(body.preferredColors);
    const preferredConceptRaw = typeof body.preferredConcept === "string" ? body.preferredConcept.toLowerCase().trim() : "";
    const preferredConcept = ALLOWED_STYLE_IDS.has(preferredConceptRaw) ? preferredConceptRaw : undefined;
    const preferredStageVibeRaw = typeof body.preferredStageVibe === "string" ? body.preferredStageVibe.toLowerCase().trim() : "";
    const preferredStageVibe = ALLOWED_STAGE_VIBES.has(preferredStageVibeRaw) ? preferredStageVibeRaw : null;
    const starterPrompt = typeof body.starterPrompt === "string" ? body.starterPrompt.trim().slice(0, 200) : undefined;

    const personalization = {
      onboardingCompleted: Boolean(body.onboardingCompleted),
      onboardingVersion: "v1",
      favoriteGroups,
      preferredStyles: preferredStyles.length > 0 ? preferredStyles : preferredConcept ? [preferredConcept] : [],
      preferredColors,
      preferredStageVibe,
      preferredConcept: preferredConcept || null,
      starterPrompt: starterPrompt || null,
    };

    if (adminDb) {
      await adminDb.collection("users").doc(decoded.uid).set(
        {
          personalization,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, personalization });
    }

    if (db) {
      await setDoc(
        doc(db, "users", decoded.uid),
        {
          personalization,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return NextResponse.json({ success: true, personalization });
    }

    return NextResponse.json({ success: true, personalization });
  } catch (error) {
    console.error("Save personalization error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
