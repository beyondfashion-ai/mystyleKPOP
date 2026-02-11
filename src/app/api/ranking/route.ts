import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const month =
    searchParams.get("month") ??
    new Date().toISOString().slice(0, 7); // YYYY-MM

  // TODO: Query Firestore rankings collection for monthly_{month}
  // TODO: If no snapshot exists, query top 50 designs by likeCount for current month

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(
    0,
    Math.ceil(
      (endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  return NextResponse.json({
    success: true,
    month,
    scoreFormula: "likeCount",
    daysRemaining,
    rankings: [],
    totalEntries: 0,
    winner: null,
  });
}
