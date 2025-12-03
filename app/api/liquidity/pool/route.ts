import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liquidityPools } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 });
    }

    const [pool] = await db
      .select()
      .from(liquidityPools)
      .where(eq(liquidityPools.marketId, marketId))
      .limit(1);

    if (!pool) {
      return NextResponse.json({ error: "Liquidity pool not found" }, { status: 404 });
    }

    return NextResponse.json(pool);
  } catch (error) {
    console.error("Error fetching liquidity pool:", error);
    return NextResponse.json({ error: "Failed to fetch liquidity pool" }, { status: 500 });
  }
}

