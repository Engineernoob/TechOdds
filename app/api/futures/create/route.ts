import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applicantFutures, markets } from "@/db/schema";
import { initializeMarket } from "@/lib/amm";
import { storeEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, anon, targetDate, metrics } = body;

    if (!userId || !title || !description || !targetDate || !metrics) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Initialize market state
    const marketState = initializeMarket();

    // Create the linked market first
    const [market] = await db
      .insert(markets)
      .values({
        title: anon ? `Anonymous Future: ${title}` : title,
        description,
        category: "applicant",
        resolutionDate: new Date(targetDate),
        yesPrice: marketState.yesPrice.toString(),
        noPrice: marketState.noPrice.toString(),
        liquidity: (marketState.liquidityYes + marketState.liquidityNo).toString(),
        liquidityYes: marketState.liquidityYes.toString(),
        liquidityNo: marketState.liquidityNo.toString(),
        status: "open",
      })
      .returning();

    // Create the applicant future
    const [future] = await db
      .insert(applicantFutures)
      .values({
        userId,
        marketId: market.id,
        title,
        description,
        anon: anon || false,
        targetDate: new Date(targetDate),
        metrics: metrics,
      })
      .returning();

    // Store embedding for similarity search
    await storeEmbedding("future", future.id, `${title} ${description}`);

    return NextResponse.json({ future, market });
  } catch (error) {
    console.error("Error creating applicant future:", error);
    return NextResponse.json({ error: "Failed to create applicant future" }, { status: 500 });
  }
}

