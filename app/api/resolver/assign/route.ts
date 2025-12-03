import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolvers } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketId } = body;

    if (!userId || !marketId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Add admin check or reputation-based assignment

    const [resolver] = await db
      .insert(resolvers)
      .values({
        userId,
        marketId,
        status: "pending",
      })
      .returning();

    return NextResponse.json(resolver);
  } catch (error) {
    console.error("Error assigning resolver:", error);
    return NextResponse.json({ error: "Failed to assign resolver" }, { status: 500 });
  }
}

