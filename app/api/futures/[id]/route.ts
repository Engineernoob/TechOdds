import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applicantFutures, markets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getRelatedEntities } from "@/lib/embeddings";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [future] = await db
      .select()
      .from(applicantFutures)
      .where(eq(applicantFutures.id, id))
      .limit(1);

    if (!future) {
      return NextResponse.json({ error: "Future not found" }, { status: 404 });
    }

    const [market] = await db
      .select()
      .from(markets)
      .where(eq(markets.id, future.marketId))
      .limit(1);

    // Get related futures
    const relatedIds = await getRelatedEntities(future.id, "future", 5);
    const relatedFutures = await db
      .select()
      .from(applicantFutures)
      .where(eq(applicantFutures.id, relatedIds[0] as any)); // Simplified for now

    return NextResponse.json({
      future,
      market,
      relatedFutures: relatedFutures.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching future:", error);
    return NextResponse.json({ error: "Failed to fetch future" }, { status: 500 });
  }
}

