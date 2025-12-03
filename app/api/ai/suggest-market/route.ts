import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Stub endpoint - returns mock suggestion
    const mockSuggestion = {
      suggestion:
        "The odds of FAANG companies increasing hiring in Q2 2026 are trending up due to recent market recovery signals and increased tech sector investment. Consider creating a market: 'Will FAANG companies increase hiring by 20% in Q2 2026?'",
      confidence: 0.75,
      reasoning: "Based on current market trends and historical patterns",
    };

    return NextResponse.json(mockSuggestion);
  } catch (error) {
    console.error("Error in AI suggest-market:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}

