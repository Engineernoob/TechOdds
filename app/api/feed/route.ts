import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activityFeed } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = db.select().from(activityFeed);

    if (userId) {
      query = query.where(eq(activityFeed.userId, userId));
    }

    const feed = await query.orderBy(desc(activityFeed.createdAt)).limit(limit);

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

