import { NextResponse } from "next/server";
import { getMarkets } from "@/lib/db";

export async function GET() {
  try {
    const markets = await getMarkets();
    return NextResponse.json(markets);
  } catch (error: any) {
    console.error("Error fetching markets:", error);
    const errorMessage =
      error?.message ||
      "Failed to fetch markets. Please check your database connection.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
