import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getMarketById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, outcome } = body;

    if (!marketId || !outcome) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (outcome !== "yes" && outcome !== "no") {
      return NextResponse.json({ error: "Outcome must be 'yes' or 'no'" }, { status: 400 });
    }

    // TODO: Add admin check
    // const supabase = await createServerClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || user.email !== 'admin@techodds.com') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Set final prices
    const finalYesPrice = outcome === "yes" ? "1.0000" : "0.0000";
    const finalNoPrice = outcome === "no" ? "1.0000" : "0.0000";

    await db
      .update(markets)
      .set({
        status: "resolved",
        yesPrice: finalYesPrice,
        noPrice: finalNoPrice,
      })
      .where(eq(markets.id, marketId));

    return NextResponse.json({ success: true, marketId, outcome });
  } catch (error) {
    console.error("Error resolving market:", error);
    return NextResponse.json({ error: "Failed to resolve market" }, { status: 500 });
  }
}

