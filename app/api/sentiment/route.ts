import { NextRequest, NextResponse } from "next/server";
import { calculateSentimentMetrics } from "@/lib/sentiment";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const metrics = await calculateSentimentMetrics(days);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error calculating sentiment:", error);
    return NextResponse.json({ error: "Failed to calculate sentiment" }, { status: 500 });
  }
}

