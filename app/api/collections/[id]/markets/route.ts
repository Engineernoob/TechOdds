import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collectionMarkets, markets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { marketId } = body;

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 });
    }

    const [collectionMarket] = await db
      .insert(collectionMarkets)
      .values({
        collectionId: id,
        marketId,
      })
      .returning();

    return NextResponse.json(collectionMarket);
  } catch (error) {
    console.error("Error adding market to collection:", error);
    return NextResponse.json({ error: "Failed to add market" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const collectionMarketsList = await db
      .select({
        market: markets,
      })
      .from(collectionMarkets)
      .innerJoin(markets, eq(collectionMarkets.marketId, markets.id))
      .where(eq(collectionMarkets.collectionId, id));

    return NextResponse.json(collectionMarketsList.map((cm: { market: any }) => cm.market));
  } catch (error) {
    console.error("Error fetching collection markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}

