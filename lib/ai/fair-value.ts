/**
 * Fair Value Calculation Utilities
 * Additional methods for estimating fair market prices
 */

import type { Market } from "@/lib/db";

export interface FairValueInputs {
  market: Market;
  historicalAccuracy?: number; // How accurate similar markets were
  marketSentiment?: number; // Overall market sentiment (0-1)
  timeToResolution?: number; // Days until resolution
  liquidity?: number;
  volume?: number;
}

/**
 * Calculate fair value using Bayesian approach
 */
export function calculateBayesianFairValue(inputs: FairValueInputs): number {
  const { marketSentiment = 0.5, historicalAccuracy = 0.5, timeToResolution = 30 } = inputs;

  // Prior: market sentiment
  const prior = marketSentiment;

  // Likelihood: historical accuracy
  const likelihood = historicalAccuracy;

  // Posterior: weighted combination
  const weight = Math.min(1, timeToResolution / 30); // More weight to prior as resolution approaches
  const fairValue = prior * weight + likelihood * (1 - weight);

  return Math.max(0, Math.min(1, fairValue));
}

/**
 * Calculate fair value using liquidity-weighted approach
 */
export function calculateLiquidityWeightedFairValue(inputs: FairValueInputs): number {
  const { market, liquidity = 0, volume = 0 } = inputs;

  const currentPrice = parseFloat(market.yesPrice);

  // More liquidity = more confidence in current price
  const liquidityWeight = Math.min(1, liquidity / 10000);
  const volumeWeight = Math.min(1, volume / 5000);

  // Fair value is closer to current price when liquidity/volume is high
  const fairValue = currentPrice * (liquidityWeight * 0.6 + volumeWeight * 0.4) + 0.5 * (1 - liquidityWeight * 0.6 - volumeWeight * 0.4);

  return Math.max(0, Math.min(1, fairValue));
}

/**
 * Calculate fair value using time decay model
 */
export function calculateTimeDecayFairValue(inputs: FairValueInputs): number {
  const { market, timeToResolution = 30 } = inputs;

  const currentPrice = parseFloat(market.yesPrice);

  // As resolution approaches, fair value moves toward 0.5 (maximum uncertainty)
  const decayFactor = Math.min(1, timeToResolution / 30);
  const fairValue = currentPrice * decayFactor + 0.5 * (1 - decayFactor);

  return Math.max(0, Math.min(1, fairValue));
}

/**
 * Aggregate multiple fair value estimates
 */
export function aggregateFairValueEstimates(
  estimates: Array<{ value: number; confidence: number }>
): { fairValue: number; confidence: number } {
  if (estimates.length === 0) {
    return { fairValue: 0.5, confidence: 0 };
  }

  // Weighted average by confidence
  let totalWeight = 0;
  let weightedSum = 0;
  let maxConfidence = 0;

  for (const estimate of estimates) {
    totalWeight += estimate.confidence;
    weightedSum += estimate.value * estimate.confidence;
    maxConfidence = Math.max(maxConfidence, estimate.confidence);
  }

  const fairValue = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  const confidence = Math.min(1, maxConfidence * 0.8 + (totalWeight / estimates.length) * 0.2);

  return { fairValue, confidence };
}

