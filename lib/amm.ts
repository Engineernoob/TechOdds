/**
 * Automated Market Maker (AMM) logic for TechOdds
 * Uses constant-product formula: x * y = k
 */

export interface MarketState {
  liquidityYes: number;
  liquidityNo: number;
  yesPrice: number;
  noPrice: number;
}

export interface TradeResult {
  newLiquidityYes: number;
  newLiquidityNo: number;
  newYesPrice: number;
  newNoPrice: number;
  sharesReceived: number;
  cost: number;
}

/**
 * Calculate the constant k for the market
 */
export function calculateConstant(liquidityYes: number, liquidityNo: number): number {
  return liquidityYes * liquidityNo;
}

/**
 * Calculate current prices from liquidity pools
 */
export function calculatePrices(liquidityYes: number, liquidityNo: number): {
  yesPrice: number;
  noPrice: number;
} {
  const totalLiquidity = liquidityYes + liquidityNo;
  if (totalLiquidity === 0) {
    return { yesPrice: 0.5, noPrice: 0.5 };
  }
  const yesPrice = liquidityNo / totalLiquidity;
  const noPrice = liquidityYes / totalLiquidity;
  return { yesPrice, noPrice };
}

/**
 * Calculate price after a trade using constant-product formula
 */
export function calculatePriceAfterTrade(
  side: "yes" | "no",
  amount: number,
  currentLiquidityYes: number,
  currentLiquidityNo: number
): TradeResult {
  const k = calculateConstant(currentLiquidityYes, currentLiquidityNo);

  let newLiquidityYes: number;
  let newLiquidityNo: number;
  let sharesReceived: number;
  let cost: number;

  if (side === "yes") {
    // Buying YES shares
    // After trade: (liquidityYes + amount) * (liquidityNo - sharesReceived) = k
    // We need to solve for sharesReceived
    // sharesReceived = liquidityNo - k / (liquidityYes + amount)
    newLiquidityYes = currentLiquidityYes + amount;
    sharesReceived = currentLiquidityNo - k / newLiquidityYes;
    newLiquidityNo = currentLiquidityNo - sharesReceived;
    cost = amount;
  } else {
    // Buying NO shares
    // After trade: (liquidityYes - sharesReceived) * (liquidityNo + amount) = k
    // sharesReceived = liquidityYes - k / (liquidityNo + amount)
    newLiquidityNo = currentLiquidityNo + amount;
    sharesReceived = currentLiquidityYes - k / newLiquidityNo;
    newLiquidityYes = currentLiquidityYes - sharesReceived;
    cost = amount;
  }

  // Ensure we don't go negative
  if (newLiquidityYes < 0 || newLiquidityNo < 0 || sharesReceived < 0) {
    throw new Error("Insufficient liquidity for this trade");
  }

  const { yesPrice: newYesPrice, noPrice: newNoPrice } = calculatePrices(
    newLiquidityYes,
    newLiquidityNo
  );

  return {
    newLiquidityYes,
    newLiquidityNo,
    newYesPrice,
    newNoPrice,
    sharesReceived,
    cost,
  };
}

/**
 * Execute a trade and return updated market state
 */
export function executeTrade(
  side: "yes" | "no",
  amount: number,
  marketState: MarketState
): TradeResult {
  if (amount <= 0) {
    throw new Error("Trade amount must be positive");
  }

  const result = calculatePriceAfterTrade(
    side,
    amount,
    marketState.liquidityYes,
    marketState.liquidityNo
  );

  return result;
}

/**
 * Initialize a new market with default liquidity
 */
export function initializeMarket(): MarketState {
  const initialLiquidity = 500; // 500 YES, 500 NO
  return {
    liquidityYes: initialLiquidity,
    liquidityNo: initialLiquidity,
    yesPrice: 0.5,
    noPrice: 0.5,
  };
}

