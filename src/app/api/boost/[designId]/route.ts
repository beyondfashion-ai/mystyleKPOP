import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { db } from "@/lib/firebase";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { verifyAuthToken } from "@/lib/auth-helpers";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type CooldownError = Error & { nextAvailableAt?: string };

function getTimestampMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "object") {
    const ts = value as { _seconds?: number; seconds?: number; toDate?: () => Date };
    if (typeof ts.toDate === "function") return ts.toDate().getTime();
    if (typeof ts._seconds === "number") return ts._seconds * 1000;
    if (typeof ts.seconds === "number") return ts.seconds * 1000;
  }
  if (typeof value === "string") {
    const ms = Date.parse(value);
    if (!Number.isNaN(ms)) return ms;
  }
  return 0;
}

function getCooldown(lastBoostAt: unknown) {
  const lastMs = getTimestampMs(lastBoostAt);
  if (!lastMs) return { canBoost: true, nextAvailableAt: null as string | null };
  const nextMs = lastMs + WEEK_MS;
  const canBoost = Date.now() >= nextMs;
  return {
    canBoost,
    nextAvailableAt: new Date(nextMs).toISOString(),
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    if (!designId) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const decoded = await verifyAuthToken(request);
    const uid = decoded?.uid || body.uid;

    if (!uid) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const boostId = `${designId}_${uid}`;

    // Use Admin SDK if available
    if (adminDb) {
      const designRef = adminDb.collection("designs").doc(designId);
      const boostRef = adminDb.collection("boosts").doc(boostId);
      const boostUserRef = adminDb.collection("boostUsers").doc(uid);

      const result = await adminDb.runTransaction(async (tx) => {
        const designSnap = await tx.get(designRef);
        if (!designSnap.exists) {
          throw new Error("Design not found");
        }

        const boostSnap = await tx.get(boostRef);
        const boostUserSnap = await tx.get(boostUserRef);
        const currentCount = designSnap.data()?.boostCount || 0;
        const userBoostCount = boostSnap.exists
          ? Number(boostSnap.data()?.count || 1)
          : 0;
        const { canBoost, nextAvailableAt } = getCooldown(boostUserSnap.exists ? boostUserSnap.data()?.lastBoostAt : null);

        if (!canBoost) {
          const err = new Error("BOOST_COOLDOWN") as CooldownError;
          err.nextAvailableAt = nextAvailableAt || undefined;
          throw err;
        }

        tx.set(
          boostRef,
          {
            designId,
            uid,
            count: userBoostCount + 1,
            lastBoostAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            createdAt: boostSnap.exists
              ? boostSnap.data()?.createdAt || FieldValue.serverTimestamp()
              : FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
        tx.update(designRef, { boostCount: currentCount + 1 });
        tx.set(
          boostUserRef,
          {
            uid,
            lastBoostAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
            totalBoostCount: (boostUserSnap.exists ? Number(boostUserSnap.data()?.totalBoostCount || 0) : 0) + 1,
            createdAt: boostUserSnap.exists
              ? boostUserSnap.data()?.createdAt || FieldValue.serverTimestamp()
              : FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        const nextAvailable = new Date(Date.now() + WEEK_MS).toISOString();
        return {
          boosted: true,
          boostAdded: 1,
          boostCount: currentCount + 1,
          userBoostCount: userBoostCount + 1,
          canBoost: false,
          nextAvailableAt: nextAvailable,
        };
      });

      return NextResponse.json(result);
    }

    // Fallback: client SDK
    if (!db) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const designRef = doc(db, "designs", designId);
    const boostRef = doc(db, "boosts", boostId);
    const boostUserRef = doc(db, "boostUsers", uid);

    const result = await runTransaction(db, async (transaction) => {
      const fresh = await transaction.get(designRef);
      if (!fresh.exists()) throw new Error("Design not found");
      const boostSnap = await transaction.get(boostRef);
      const boostUserSnap = await transaction.get(boostUserRef);
      const totalBoostCount = fresh.data().boostCount || 0;
      const userBoostCount = boostSnap.exists()
        ? Number(boostSnap.data().count || 1)
        : 0;
      const { canBoost, nextAvailableAt } = getCooldown(boostUserSnap.exists() ? boostUserSnap.data().lastBoostAt : null);

      if (!canBoost) {
        const err = new Error("BOOST_COOLDOWN") as CooldownError;
        err.nextAvailableAt = nextAvailableAt || undefined;
        throw err;
      }

      transaction.set(
        boostRef,
        {
          designId,
          uid,
          count: userBoostCount + 1,
          lastBoostAt: new Date(),
          createdAt: boostSnap.exists() ? boostSnap.data().createdAt || new Date() : new Date(),
          updatedAt: new Date(),
        },
        { merge: true }
      );
      transaction.update(designRef, { boostCount: totalBoostCount + 1 });
      transaction.set(
        boostUserRef,
        {
          uid,
          lastBoostAt: new Date(),
          updatedAt: new Date(),
          totalBoostCount: (boostUserSnap.exists() ? Number(boostUserSnap.data().totalBoostCount || 0) : 0) + 1,
          createdAt: boostUserSnap.exists() ? boostUserSnap.data().createdAt || new Date() : new Date(),
        },
        { merge: true }
      );

      const nextAvailable = new Date(Date.now() + WEEK_MS).toISOString();
      return {
        boosted: true,
        boostAdded: 1,
        boostCount: totalBoostCount + 1,
        userBoostCount: userBoostCount + 1,
        canBoost: false,
        nextAvailableAt: nextAvailable,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const maybeCooldown = error as CooldownError;
    if (maybeCooldown?.message === "BOOST_COOLDOWN") {
      return NextResponse.json(
        {
          error: "슈퍼스타는 주 1회만 보낼 수 있어요.",
          code: "BOOST_COOLDOWN",
          nextAvailableAt: maybeCooldown.nextAvailableAt || null,
        },
        { status: 429 }
      );
    }
    console.error("Boost vote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ designId: string }> }
) {
  try {
    const { designId } = await params;
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid");

    if (!uid || !designId) {
      return NextResponse.json({ boosted: false, userBoostCount: 0, canBoost: false, nextAvailableAt: null });
    }

    const boostId = `${designId}_${uid}`;

    if (adminDb) {
      const snap = await adminDb.collection("boosts").doc(boostId).get();
      const boostUserSnap = await adminDb.collection("boostUsers").doc(uid).get();
      if (!snap.exists) {
        const cooldown = getCooldown(boostUserSnap.exists ? boostUserSnap.data()?.lastBoostAt : null);
        return NextResponse.json({
          boosted: false,
          userBoostCount: 0,
          canBoost: cooldown.canBoost,
          nextAvailableAt: cooldown.nextAvailableAt,
        });
      }
      const count = Number(snap.data()?.count || 1);
      const cooldown = getCooldown(boostUserSnap.exists ? boostUserSnap.data()?.lastBoostAt : null);
      return NextResponse.json({
        boosted: true,
        userBoostCount: count,
        canBoost: cooldown.canBoost,
        nextAvailableAt: cooldown.nextAvailableAt,
      });
    }

    if (!db) {
      return NextResponse.json({ boosted: false, userBoostCount: 0, canBoost: false, nextAvailableAt: null });
    }
    const snap = await getDoc(doc(db, "boosts", boostId));
    const boostUserSnap = await getDoc(doc(db, "boostUsers", uid));
    if (!snap.exists()) {
      const cooldown = getCooldown(boostUserSnap.exists() ? boostUserSnap.data()?.lastBoostAt : null);
      return NextResponse.json({
        boosted: false,
        userBoostCount: 0,
        canBoost: cooldown.canBoost,
        nextAvailableAt: cooldown.nextAvailableAt,
      });
    }
    const count = Number(snap.data()?.count || 1);
    const cooldown = getCooldown(boostUserSnap.exists() ? boostUserSnap.data()?.lastBoostAt : null);
    return NextResponse.json({
      boosted: true,
      userBoostCount: count,
      canBoost: cooldown.canBoost,
      nextAvailableAt: cooldown.nextAvailableAt,
    });
  } catch {
    return NextResponse.json({ boosted: false, userBoostCount: 0, canBoost: false, nextAvailableAt: null });
  }
}
