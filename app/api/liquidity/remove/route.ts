import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liquidityPools, liquidityEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { removeLiquidity } from "@/lib/amm-v2";
import { getMarketById } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, marketId, lpTokens } = body;

    if (!userId || !marketId || lpTokens === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const [pool] = await db
      .select()
      .from(liquidityPools)
      .where(eq(liquidityPools.marketId, marketId))
      .limit(1);

    if (!pool) {
      return NextResponse.json({ error: "Liquidity pool not found" }, { status: 404 });
    }

    // TODO: Get user's actual LP token balance
    const totalLPTokens = Math.sqrt(
      parseFloat(pool.yesLiquidity) * parseFloat(pool.noLiquidity)
    );

    const poolState = {
      yesLiquidity: parseFloat(pool.yesLiquidity),
      noLiquidity: parseFloat(pool.noLiquidity),
      totalFees: parseFloat(pool.totalFees),
    };

    const result = removeLiquidity(parseFloat(lpTokens), poolState, totalLPTokens);

    await db
      .update(liquidityPools)
      .set({
        yesLiquidity: result.newPool.yesLiquidity.toString(),
        noLiquidity: result.newPool.noLiquidity.toString(),
        totalFees: result.newPool.totalFees.toString(),
      })
      .where(eq(liquidityPools.id, pool.id));

    await db.insert(liquidityEvents).values({
      userId,
      marketId,
      type: "remove",
      amount: (result.yesAmount + result.noAmount).toString(),
    });

    return NextResponse.json({
      success: true,
      yesAmount: result.yesAmount,
      noAmount: result.noAmount,
      feesShare: result.feesShare,
    });
  } catch (error) {
    console.error("Error removing liquidity:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to remove liquidity" },
      { status: 500 }
    );
  }
}

