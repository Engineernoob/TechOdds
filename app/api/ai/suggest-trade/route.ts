import { NextRequest, NextResponse } from "next/server";
import { getMarketById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId } = body;

    if (!marketId) {
      return NextResponse.json({ error: "Market ID is required" }, { status: 400 });
    }

    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const yesPrice = parseFloat(market.yesPrice);
    const noPrice = parseFloat(market.noPrice);

    // Stub AI analysis - replace with actual LLM integration
    const strategy = yesPrice < 0.4
      ? `YES looks underpriced at ${(yesPrice * 100).toFixed(2)}%. Recent hiring rebounds and market signals suggest upward momentum. Consider a YES position.`
      : yesPrice > 0.6
      ? `NO may be undervalued. Current YES price of ${(yesPrice * 100).toFixed(2)}% seems high given market conditions. Consider a NO position for better risk/reward.`
      : `Market is fairly balanced. Both sides offer similar value. Consider waiting for clearer signals or smaller position sizes.`;

    return NextResponse.json({
      marketId,
      strategy,
      confidence: 0.65 + Math.random() * 0.2,
      recommendedSide: yesPrice < 0.4 ? "yes" : yesPrice > 0.6 ? "no" : "neutral",
      reasoning: [
        "Analysis of recent market trends",
        "Comparison with similar markets",
        "Technical indicators suggest",
      ],
    });
  } catch (error) {
    console.error("Error generating trade suggestion:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}

