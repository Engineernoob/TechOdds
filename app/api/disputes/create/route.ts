import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { disputes, notifications } from "@/db/schema";
import { getMarketById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, raisedBy, reasonText } = body;

    if (!marketId || !raisedBy || !reasonText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const [dispute] = await db
      .insert(disputes)
      .values({
        marketId,
        raisedBy,
        reasonText,
        status: "open",
      })
      .returning();

    // Notify market creator and resolvers
    // TODO: Get market creator and resolvers
    // For now, stub notification

    return NextResponse.json(dispute);
  } catch (error) {
    console.error("Error creating dispute:", error);
    return NextResponse.json({ error: "Failed to create dispute" }, { status: 500 });
  }
}

