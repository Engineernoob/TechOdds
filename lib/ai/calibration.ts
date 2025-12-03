/**
 * AI Probability Calibration
 * Calculate fair value estimates and market deviations
 */

import type { Market, MarketPriceHistory } from "@/lib/db";

export interface FairValueEstimate {
  fairYesPrice: number;
  fairNoPrice: number;
  confidence: number;
  deviation: number; // How far market price is from fair value
  confidenceBands: {
    lower: number;
    upper: number;
  };
  historicalPatternMatch: number;
  suggestedPosition: "yes" | "no" | "neutral";
  reasoning: string[];
}

/**
 * Calculate fair value estimate for a market
 */
export function calibrateMarket(
  market: Market,
  priceHistory: MarketPriceHistory[],
  similarMarkets: Market[] = []
): FairValueEstimate {
  const currentYesPrice = parseFloat(market.yesPrice);
  const currentNoPrice = parseFloat(market.noPrice);

  // Stub implementation - replace with actual ML model
  // This would use:
  // - Historical price patterns
  // - Similar market outcomes
  // - Market fundamentals
  // - Time to resolution

  // Mock fair value calculation
  const timeToResolution =
    (new Date(market.resolutionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24); // days

  // Fair value tends toward 0.5 as resolution approaches (uncertainty)
  const timeFactor = Math.min(1, timeToResolution / 30); // Normalize to 30 days
  const baseFairValue = 0.5 + (currentYesPrice - 0.5) * timeFactor;

  // Adjust based on liquidity (more liquidity = more accurate)
  const liquidity = parseFloat(market.liquidity);
  const liquidityFactor = Math.min(1, liquidity / 5000); // Normalize to 5000
  const fairYesPrice = baseFairValue * liquidityFactor + 0.5 * (1 - liquidityFactor);

  // Confidence based on liquidity and time
  const confidence = Math.min(0.95, liquidityFactor * 0.7 + timeFactor * 0.25);

  // Deviation from current price
  const deviation = Math.abs(fairYesPrice - currentYesPrice);

  // Confidence bands (±2 standard deviations)
  const stdDev = 0.1 * (1 - confidence); // Higher confidence = tighter bands
  const confidenceBands = {
    lower: Math.max(0, fairYesPrice - 2 * stdDev),
    upper: Math.min(1, fairYesPrice + 2 * stdDev),
  };

  // Historical pattern match (compare to similar resolved markets)
  const historicalPatternMatch = similarMarkets.length > 0 ? 0.65 : 0.5;

  // Suggested position
  let suggestedPosition: "yes" | "no" | "neutral" = "neutral";
  if (deviation > 0.1) {
    suggestedPosition = fairYesPrice > currentYesPrice ? "yes" : "no";
  }

  // Reasoning
  const reasoning: string[] = [];
  if (deviation > 0.05) {
    reasoning.push(
      `Market price deviates ${(deviation * 100).toFixed(1)}% from estimated fair value`
    );
  }
  if (liquidityFactor > 0.7) {
    reasoning.push("High liquidity suggests accurate pricing");
  } else {
    reasoning.push("Low liquidity may indicate pricing inefficiency");
  }
  if (timeToResolution < 7) {
    reasoning.push("Approaching resolution date increases uncertainty");
  }
  if (historicalPatternMatch > 0.6) {
    reasoning.push("Historical patterns support this estimate");
  }

  return {
    fairYesPrice,
    fairNoPrice: 1 - fairYesPrice,
    confidence,
    deviation,
    confidenceBands,
    historicalPatternMatch,
    suggestedPosition,
    reasoning,
  };
}

/**
 * Calculate fair value using multiple methods and aggregate
 */
export function aggregateFairValue(
  market: Market,
  priceHistory: MarketPriceHistory[],
  similarMarkets: Market[]
): FairValueEstimate {
  // In production, this would:
  // 1. Use ML model trained on historical outcomes
  // 2. Analyze similar markets
  // 3. Consider market fundamentals
  // 4. Weight by confidence

  return calibrateMarket(market, priceHistory, similarMarkets);
}

