import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId } = body;

    // Stub endpoint - returns mock analysis
    const mockAnalysis = {
      marketId: marketId || "unknown",
      analysis:
        "Current market sentiment suggests a bullish trend. Trading volume has increased 15% over the past week, and YES positions are gaining momentum. Key factors include recent tech sector performance and hiring announcements from major companies.",
      sentiment: "bullish",
      confidence: 0.68,
      factors: [
        "Increased trading volume",
        "Positive tech sector indicators",
        "Recent hiring announcements",
      ],
    };

    return NextResponse.json(mockAnalysis);
  } catch (error) {
    console.error("Error in AI analyze-market:", error);
    return NextResponse.json({ error: "Failed to analyze market" }, { status: 500 });
  }
}

