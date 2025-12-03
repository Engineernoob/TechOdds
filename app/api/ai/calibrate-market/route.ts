import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getPriceHistory } from "@/lib/db";
import { calibrateMarket } from "@/lib/ai/calibration";

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

    const priceHistory = await getPriceHistory(marketId);
    // TODO: Fetch similar markets for better calibration
    const similarMarkets: any[] = [];

    const calibration = calibrateMarket(market, priceHistory, similarMarkets);

    return NextResponse.json(calibration);
  } catch (error) {
    console.error("Error calibrating market:", error);
    return NextResponse.json({ error: "Failed to calibrate market" }, { status: 500 });
  }
}

