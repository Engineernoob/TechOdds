/**
 * Portfolio Analysis Utilities
 * Calculate risk, exposure, and portfolio health metrics
 */

import type { Market, Trade } from "./db";

export interface PortfolioPosition {
  marketId: string;
  marketTitle: string;
  side: "yes" | "no";
  amount: number;
  currentPrice: number;
  entryPrice: number;
  unrealizedPnL: number;
  category: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  unrealizedPnL: number;
  categoryExposure: Record<string, number>;
  weightedRisk: number;
  diversificationScore: number;
  valueAtRisk: number;
  liquidityPositions: number;
}

/**
 * Calculate portfolio positions from trades
 */
export function calculatePositions(
  trades: Trade[],
  markets: Record<string, Market>
): PortfolioPosition[] {
  const positions: Record<string, PortfolioPosition> = {};

  for (const trade of trades) {
    const market = markets[trade.marketId];
    if (!market) continue;

    const key = `${trade.marketId}-${trade.side}`;
    const currentPrice =
      trade.side === "yes" ? parseFloat(market.yesPrice) : parseFloat(market.noPrice);

    if (positions[key]) {
      // Average entry price
      const totalAmount = positions[key].amount + parseFloat(trade.amount);
      const weightedEntry =
        (positions[key].entryPrice * positions[key].amount +
          parseFloat(trade.price) * parseFloat(trade.amount)) /
        totalAmount;

      positions[key].amount = totalAmount;
      positions[key].entryPrice = weightedEntry;
      positions[key].currentPrice = currentPrice;
      positions[key].unrealizedPnL =
        (currentPrice - positions[key].entryPrice) * totalAmount;
    } else {
      positions[key] = {
        marketId: trade.marketId,
        marketTitle: market.title,
        side: trade.side,
        amount: parseFloat(trade.amount),
        currentPrice,
        entryPrice: parseFloat(trade.price),
        unrealizedPnL: (currentPrice - parseFloat(trade.price)) * parseFloat(trade.amount),
        category: market.category,
      };
    }
  }

  return Object.values(positions);
}

/**
 * Calculate portfolio metrics
 */
export function calculatePortfolioMetrics(
  positions: PortfolioPosition[],
  liquidityPositions: number = 0
): PortfolioMetrics {
  let totalValue = 0;
  let unrealizedPnL = 0;
  const categoryExposure: Record<string, number> = {};
  let totalRisk = 0;

  for (const position of positions) {
    const positionValue = position.amount * position.currentPrice;
    totalValue += positionValue;
    unrealizedPnL += position.unrealizedPnL;

    // Category exposure
    if (!categoryExposure[position.category]) {
      categoryExposure[position.category] = 0;
    }
    categoryExposure[position.category] += positionValue;

    // Risk calculation (simplified: volatility proxy)
    const priceVolatility = Math.abs(position.currentPrice - position.entryPrice);
    totalRisk += priceVolatility * positionValue;
  }

  const weightedRisk = totalValue > 0 ? totalRisk / totalValue : 0;

  // Diversification score (0-1, higher is better)
  const categories = Object.keys(categoryExposure);
  const categoryCount = categories.length;
  const maxCategoryWeight = Math.max(...Object.values(categoryExposure), 0);
  const diversificationScore =
    totalValue > 0
      ? Math.min(1, (categoryCount / 5) * (1 - maxCategoryWeight / totalValue))
      : 0;

  // Simple VaR calculation (95% confidence, 1-day)
  const returns = positions.map((p) => p.unrealizedPnL / (p.amount * p.entryPrice));
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length || 0;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length || 0;
  const stdDev = Math.sqrt(variance);
  const valueAtRisk = totalValue * stdDev * 1.645; // 95% VaR

  return {
    totalValue,
    unrealizedPnL,
    categoryExposure,
    weightedRisk,
    diversificationScore,
    valueAtRisk,
    liquidityPositions,
  };
}

/**
 * Calculate portfolio health score (0-100)
 */
export function calculatePortfolioHealth(metrics: PortfolioMetrics): {
  score: number;
  factors: Array<{ name: string; impact: number; note: string }>;
} {
  const factors: Array<{ name: string; impact: number; note: string }> = [];

  // Diversification (0-30 points)
  const diversificationScore = metrics.diversificationScore * 30;
  factors.push({
    name: "Diversification",
    impact: diversificationScore,
    note: `Spread across ${Object.keys(metrics.categoryExposure).length} categories`,
  });

  // Risk management (0-30 points)
  const riskScore = Math.max(0, 30 - metrics.weightedRisk * 100);
  factors.push({
    name: "Risk Management",
    impact: riskScore,
    note: `Weighted risk: ${(metrics.weightedRisk * 100).toFixed(2)}%`,
  });

  // Performance (0-20 points)
  const performanceScore = metrics.unrealizedPnL > 0 ? 20 : Math.max(0, 20 + metrics.unrealizedPnL / metrics.totalValue * 20);
  factors.push({
    name: "Performance",
    impact: performanceScore,
    note: `Unrealized P&L: ${metrics.unrealizedPnL.toFixed(2)}`,
  });

  // Liquidity (0-20 points)
  const liquidityScore = Math.min(20, (metrics.liquidityPositions / metrics.totalValue) * 20);
  factors.push({
    name: "Liquidity",
    impact: liquidityScore,
    note: `${metrics.liquidityPositions.toFixed(2)} in liquidity pools`,
  });

  const totalScore = factors.reduce((sum, f) => sum + f.impact, 0);

  return {
    score: Math.min(100, Math.max(0, totalScore)),
    factors,
  };
}

/**
 * Get correlated positions
 */
export function findCorrelatedPositions(
  positions: PortfolioPosition[],
  threshold: number = 0.7
): Array<{ position1: PortfolioPosition; position2: PortfolioPosition; correlation: number }> {
  const correlated: Array<{
    position1: PortfolioPosition;
    position2: PortfolioPosition;
    correlation: number;
  }> = [];

  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const pos1 = positions[i];
      const pos2 = positions[j];

      // Simple correlation: same category and similar price movement
      const categoryMatch = pos1.category === pos2.category ? 0.5 : 0;
      const priceCorrelation =
        1 - Math.abs(pos1.currentPrice - pos2.currentPrice) / Math.max(pos1.currentPrice, pos2.currentPrice);
      const correlation = categoryMatch + priceCorrelation * 0.5;

      if (correlation >= threshold) {
        correlated.push({ position1: pos1, position2: pos2, correlation });
      }
    }
  }

  return correlated;
}

