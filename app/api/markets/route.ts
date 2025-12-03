import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/db";

export async function GET() {
  try {
    const markets = await getMarkets();
    return NextResponse.json(markets);
  } catch (error) {
    console.error("Error fetching markets:", error);
    return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
  }
}

