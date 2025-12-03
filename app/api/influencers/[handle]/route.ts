import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { influencers, influencerMarkets, markets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params;

    const [influencer] = await db
      .select()
      .from(influencers)
      .where(eq(influencers.handle, handle))
      .limit(1);

    if (!influencer) {
      return NextResponse.json({ error: "Influencer not found" }, { status: 404 });
    }

    const influencerMarketsList = await db
      .select({
        market: markets,
      })
      .from(influencerMarkets)
      .innerJoin(markets, eq(influencerMarkets.marketId, markets.id))
      .where(eq(influencerMarkets.influencerId, influencer.id));

    return NextResponse.json({
      influencer,
      markets: influencerMarketsList.map((im: { market: any }) => im.market),
    });
  } catch (error) {
    console.error("Error fetching influencer:", error);
    return NextResponse.json({ error: "Failed to fetch influencer" }, { status: 500 });
  }
}

