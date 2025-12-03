import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userRank } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentSeason } from "@/lib/ranking";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const season = searchParams.get("season") || getCurrentSeason();
    const limit = parseInt(searchParams.get("limit") || "100");

    const leaderboard = await db
      .select()
      .from(userRank)
      .where(eq(userRank.season, season))
      .orderBy(desc(userRank.xp))
      .limit(limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}

