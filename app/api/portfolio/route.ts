import { NextRequest, NextResponse } from "next/server";
import { getTradesByUserId } from "@/lib/db";
import { getMarkets } from "@/lib/db";
import { calculatePositions, calculatePortfolioMetrics, calculatePortfolioHealth } from "@/lib/portfolio";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const [trades, allMarkets] = await Promise.all([
      getTradesByUserId(userId),
      getMarkets(),
    ]);

    const marketsMap: Record<string, any> = {};
    allMarkets.forEach((m: any) => {
      marketsMap[m.id] = m;
    });

    const positions = calculatePositions(trades, marketsMap);
    const metrics = calculatePortfolioMetrics(positions, 0); // TODO: Get liquidity positions
    const health = calculatePortfolioHealth(metrics);

    return NextResponse.json({
      positions,
      metrics,
      health,
    });
  } catch (error) {
    console.error("Error calculating portfolio:", error);
    return NextResponse.json({ error: "Failed to calculate portfolio" }, { status: 500 });
  }
}

