/**
 * AMM v2: Liquidity Pool System
 * Enhanced AMM with separate liquidity pools and provider mechanics
 */

import type { MarketState } from "./amm";

export interface LiquidityPool {
  yesLiquidity: number;
  noLiquidity: number;
  totalFees: number;
}

export interface LiquidityPosition {
  userShare: number; // Percentage of pool owned
  yesTokens: number;
  noTokens: number;
  feesEarned: number;
}

const TRADING_FEE = 0.003; // 0.3% fee on trades

/**
 * Calculate constant k for liquidity pool
 */
export function calculatePoolConstant(yesLiquidity: number, noLiquidity: number): number {
  return yesLiquidity * noLiquidity;
}

/**
 * Calculate prices from liquidity pool
 */
export function calculatePoolPrices(pool: LiquidityPool): { yesPrice: number; noPrice: number } {
  const total = pool.yesLiquidity + pool.noLiquidity;
  if (total === 0) {
    return { yesPrice: 0.5, noPrice: 0.5 };
  }
  return {
    yesPrice: pool.noLiquidity / total,
    noPrice: pool.yesLiquidity / total,
  };
}

/**
 * Execute trade against liquidity pool
 */
export function executePoolTrade(
  side: "yes" | "no",
  amount: number,
  pool: LiquidityPool
): {
  newPool: LiquidityPool;
  sharesReceived: number;
  fees: number;
  newYesPrice: number;
  newNoPrice: number;
} {
  const k = calculatePoolConstant(pool.yesLiquidity, pool.noLiquidity);
  const fees = amount * TRADING_FEE;
  const amountAfterFees = amount - fees;

  let newYesLiquidity: number;
  let newNoLiquidity: number;
  let sharesReceived: number;

  if (side === "yes") {
    newYesLiquidity = pool.yesLiquidity + amountAfterFees;
    sharesReceived = pool.noLiquidity - k / newYesLiquidity;
    newNoLiquidity = pool.noLiquidity - sharesReceived;
  } else {
    newNoLiquidity = pool.noLiquidity + amountAfterFees;
    sharesReceived = pool.yesLiquidity - k / newNoLiquidity;
    newYesLiquidity = pool.yesLiquidity - sharesReceived;
  }

  if (newYesLiquidity < 0 || newNoLiquidity < 0 || sharesReceived < 0) {
    throw new Error("Insufficient liquidity for this trade");
  }

  const newPool: LiquidityPool = {
    yesLiquidity: newYesLiquidity,
    noLiquidity: newNoLiquidity,
    totalFees: pool.totalFees + fees,
  };

  const { yesPrice, noPrice } = calculatePoolPrices(newPool);

  return {
    newPool,
    sharesReceived,
    fees,
    newYesPrice: yesPrice,
    newNoPrice: noPrice,
  };
}

/**
 * Add liquidity to pool
 */
export function addLiquidity(
  yesAmount: number,
  noAmount: number,
  pool: LiquidityPool
): {
  newPool: LiquidityPool;
  lpTokens: number; // Liquidity provider tokens received
} {
  // Maintain ratio if pool exists
  if (pool.yesLiquidity > 0 && pool.noLiquidity > 0) {
    const ratio = pool.yesLiquidity / pool.noLiquidity;
    const adjustedNoAmount = yesAmount / ratio;
    const adjustedYesAmount = noAmount * ratio;

    if (adjustedNoAmount < noAmount) {
      // Use yesAmount as base
      noAmount = adjustedNoAmount;
    } else {
      // Use noAmount as base
      yesAmount = adjustedYesAmount;
    }
  }

  const newPool: LiquidityPool = {
    yesLiquidity: pool.yesLiquidity + yesAmount,
    noLiquidity: pool.noLiquidity + noAmount,
    totalFees: pool.totalFees,
  };

  // LP tokens = sqrt(yes * no) - existing LP tokens
  const totalValue = Math.sqrt(newPool.yesLiquidity * newPool.noLiquidity);
  const existingValue = Math.sqrt(pool.yesLiquidity * pool.noLiquidity);
  const lpTokens = totalValue - existingValue;

  return { newPool, lpTokens };
}

/**
 * Remove liquidity from pool
 */
export function removeLiquidity(
  lpTokens: number,
  pool: LiquidityPool,
  totalLPTokens: number
): {
  newPool: LiquidityPool;
  yesAmount: number;
  noAmount: number;
  feesShare: number;
} {
  const share = lpTokens / totalLPTokens;

  const yesAmount = pool.yesLiquidity * share;
  const noAmount = pool.noLiquidity * share;
  const feesShare = pool.totalFees * share;

  const newPool: LiquidityPool = {
    yesLiquidity: pool.yesLiquidity - yesAmount,
    noLiquidity: pool.noLiquidity - noAmount,
    totalFees: pool.totalFees - feesShare,
  };

  return { newPool, yesAmount, noAmount, feesShare };
}

/**
 * Calculate user's liquidity position
 */
export function calculateLiquidityPosition(
  userLPTokens: number,
  totalLPTokens: number,
  pool: LiquidityPool
): LiquidityPosition {
  const share = totalLPTokens > 0 ? userLPTokens / totalLPTokens : 0;

  return {
    userShare: share,
    yesTokens: pool.yesLiquidity * share,
    noTokens: pool.noLiquidity * share,
    feesEarned: pool.totalFees * share,
  };
}

/**
 * Initialize liquidity pool
 */
export function initializeLiquidityPool(initialYes: number = 500, initialNo: number = 500): {
  pool: LiquidityPool;
  lpTokens: number;
} {
  const pool: LiquidityPool = {
    yesLiquidity: initialYes,
    noLiquidity: initialNo,
    totalFees: 0,
  };

  const lpTokens = Math.sqrt(initialYes * initialNo);

  return { pool, lpTokens };
}

