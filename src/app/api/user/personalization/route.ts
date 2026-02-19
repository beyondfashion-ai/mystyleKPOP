import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { unauthorizedResponse, verifyAuthToken } from "@/lib/auth-helpers";


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
    // if (!decoded?.uid) return unauthorizedResponse(); // Allow anonymous for now if needed, or keep strict

    // Re-enable strict auth check if verified working
    if (!decoded?.uid) return unauthorizedResponse();

    const body = await request.json();

    // New Schema Fields
    const archetypeId = typeof body.archetypeId === "string" ? body.archetypeId.slice(0, 50) : null;
    const archetypeLabel = typeof body.archetypeLabel === "string" ? body.archetypeLabel.slice(0, 50) : null;
    const styleKeywords = Array.isArray(body.styleKeywords)
      ? body.styleKeywords.map((s: any) => String(s).slice(0, 30)).slice(0, 10)
      : [];
    const colorPaletteId = typeof body.colorPaletteId === "string" ? body.colorPaletteId.slice(0, 50) : null;
    const starterPrompt = typeof body.starterPrompt === "string" ? body.starterPrompt.slice(0, 500) : null;
    const customGroupName = typeof body.customGroupName === "string" ? body.customGroupName.trim().slice(0, 30) : null;
    const customColorText = typeof body.customColorText === "string" ? body.customColorText.trim().slice(0, 30) : null;

    const personalization = {
      onboardingCompleted: Boolean(body.onboardingCompleted),
      onboardingVersion: "v2",
      archetypeId,
      archetypeLabel,
      customGroupName,
      styleKeywords,
      colorPaletteId,
      customColorText,
      starterPrompt,
      updatedAt: Date.now(),
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

