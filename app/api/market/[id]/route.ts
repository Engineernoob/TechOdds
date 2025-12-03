import { NextRequest, NextResponse } from "next/server";
import { getMarketById, getPriceHistory } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const market = await getMarketById(id);

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    const priceHistory = await getPriceHistory(id);

    return NextResponse.json({ market, priceHistory });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json({ error: "Failed to fetch market" }, { status: 500 });
  }
}

