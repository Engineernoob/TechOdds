import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markets } from "@/db/schema";
import { initializeMarket } from "@/lib/amm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, resolutionDate } = body;

    if (!title || !description || !category || !resolutionDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // TODO: Add admin check
    // const supabase = await createServerClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user || user.email !== 'admin@techodds.com') {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const marketState = initializeMarket();

    const [market] = await db
      .insert(markets)
      .values({
        title,
        description,
        category,
        resolutionDate: new Date(resolutionDate),
        yesPrice: marketState.yesPrice.toString(),
        noPrice: marketState.noPrice.toString(),
        liquidity: (marketState.liquidityYes + marketState.liquidityNo).toString(),
        liquidityYes: marketState.liquidityYes.toString(),
        liquidityNo: marketState.liquidityNo.toString(),
        status: "open",
      })
      .returning();

    return NextResponse.json(market);
  } catch (error) {
    console.error("Error creating market:", error);
    return NextResponse.json({ error: "Failed to create market" }, { status: 500 });
  }
}

