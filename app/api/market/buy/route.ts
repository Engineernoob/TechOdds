import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { markets, trades, marketPriceHistory, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { executeTrade } from "@/lib/amm";
import { getMarketById, getUserById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, side, amount, userId } = body;

    if (!marketId || !side || !amount || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (side !== "yes" && side !== "no") {
      return NextResponse.json({ error: "Side must be 'yes' or 'no'" }, { status: 400 });
    }

    // TODO: Add auth check
    // const supabase = await createServerClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get market and user
    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    if (market.status !== "open") {
      return NextResponse.json({ error: "Market is not open for trading" }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userBalance = parseFloat(user.balance);
    if (userBalance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Execute trade using AMM
    const marketState = {
      liquidityYes: parseFloat(market.liquidityYes),
      liquidityNo: parseFloat(market.liquidityNo),
      yesPrice: parseFloat(market.yesPrice),
      noPrice: parseFloat(market.noPrice),
    };

    const tradeResult = executeTrade(side, amount, marketState);

    // Update market
    await db
      .update(markets)
      .set({
        liquidityYes: tradeResult.newLiquidityYes.toString(),
        liquidityNo: tradeResult.newLiquidityNo.toString(),
        yesPrice: tradeResult.newYesPrice.toString(),
        noPrice: tradeResult.newNoPrice.toString(),
        liquidity: (tradeResult.newLiquidityYes + tradeResult.newLiquidityNo).toString(),
      })
      .where(eq(markets.id, marketId));

    // Create trade record
    await db.insert(trades).values({
      userId,
      marketId,
      side,
      amount: amount.toString(),
      price: (side === "yes" ? tradeResult.newYesPrice : tradeResult.newNoPrice).toString(),
    });

    // Log price history
    await db.insert(marketPriceHistory).values({
      marketId,
      yesPrice: tradeResult.newYesPrice.toString(),
      noPrice: tradeResult.newNoPrice.toString(),
    });

    // Update user balance
    const newBalance = userBalance - tradeResult.cost;
    await db.update(users).set({ balance: newBalance.toString() }).where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      trade: {
        sharesReceived: tradeResult.sharesReceived,
        cost: tradeResult.cost,
        newYesPrice: tradeResult.newYesPrice,
        newNoPrice: tradeResult.newNoPrice,
      },
    });
  } catch (error) {
    console.error("Error executing trade:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to execute trade" },
      { status: 500 }
    );
  }
}

