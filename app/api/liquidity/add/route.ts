import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liquidityPools, liquidityEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addLiquidity, initializeLiquidityPool } from "@/lib/amm-v2";
import { getMarketById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketId, yesAmount, noAmount } = body;

    if (!userId || !marketId || !yesAmount || !noAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const market = await getMarketById(marketId);
    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    // Get or create liquidity pool
    let [pool] = await db
      .select()
      .from(liquidityPools)
      .where(eq(liquidityPools.marketId, marketId))
      .limit(1);

    let poolState;
    let lpTokens;

    if (!pool) {
      // Initialize pool
      const initResult = initializeLiquidityPool(
        parseFloat(yesAmount),
        parseFloat(noAmount)
      );
      poolState = initResult.pool;
      lpTokens = initResult.lpTokens;

      [pool] = await db
        .insert(liquidityPools)
        .values({
          marketId,
          yesLiquidity: poolState.yesLiquidity.toString(),
          noLiquidity: poolState.noLiquidity.toString(),
          totalFees: poolState.totalFees.toString(),
        })
        .returning();
    } else {
      // Add to existing pool
      poolState = {
        yesLiquidity: parseFloat(pool.yesLiquidity),
        noLiquidity: parseFloat(pool.noLiquidity),
        totalFees: parseFloat(pool.totalFees),
      };

      const result = addLiquidity(
        parseFloat(yesAmount),
        parseFloat(noAmount),
        poolState
      );
      poolState = result.newPool;
      lpTokens = result.lpTokens;

      await db
        .update(liquidityPools)
        .set({
          yesLiquidity: poolState.yesLiquidity.toString(),
          noLiquidity: poolState.noLiquidity.toString(),
        })
        .where(eq(liquidityPools.id, pool.id));
    }

    // Record liquidity event
    await db.insert(liquidityEvents).values({
      userId,
      marketId,
      type: "add",
      amount: (parseFloat(yesAmount) + parseFloat(noAmount)).toString(),
    });

    return NextResponse.json({
      success: true,
      pool: poolState,
      lpTokens,
    });
  } catch (error) {
    console.error("Error adding liquidity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add liquidity" },
      { status: 500 }
    );
  }
}

