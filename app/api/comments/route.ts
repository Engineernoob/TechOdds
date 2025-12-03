import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, activityFeed } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 });
    }

    const commentList = await db
      .select()
      .from(comments)
      .where(eq(comments.marketId, marketId))
      .orderBy(comments.createdAt);

    return NextResponse.json(commentList);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketId, text, parentId } = body;

    if (!userId || !marketId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [comment] = await db
      .insert(comments)
      .values({
        userId,
        marketId,
        text,
        parentId: parentId || null,
      })
      .returning();

    // Add to activity feed
    await db.insert(activityFeed).values({
      userId,
      type: "comment",
      metadata: {
        commentId: comment.id,
        marketId,
        text: text.substring(0, 100), // Truncate for feed
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

