import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { influencers } from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const influencersList = await db.select().from(influencers).orderBy(influencers.createdAt);

    return NextResponse.json(influencersList);
  } catch (error) {
    console.error("Error fetching influencers:", error);
    return NextResponse.json({ error: "Failed to fetch influencers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, description, avatarUrl, userId } = body;

    if (!handle) {
      return NextResponse.json({ error: "Handle is required" }, { status: 400 });
    }

    const [influencer] = await db
      .insert(influencers)
      .values({
        handle,
        description: description || null,
        avatarUrl: avatarUrl || null,
        userId: userId || null,
      })
      .returning();

    return NextResponse.json(influencer);
  } catch (error) {
    console.error("Error creating influencer:", error);
    return NextResponse.json({ error: "Failed to create influencer" }, { status: 500 });
  }
}

