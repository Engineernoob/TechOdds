/**
 * Sentiment analysis utilities for Phase 2
 * Computes market sentiment, volatility, and category-level metrics
 */

import { db } from "./db";
import { markets, marketPriceHistory } from "@/db/schema";
import { eq, gte, lte, sql, and } from "drizzle-orm";

export interface SentimentMetrics {
  overallOptimism: number; // 0-1, weighted average of YES prices
  volatility: number; // Standard deviation of price changes
  categoryMetrics: Record<string, {
    optimism: number;
    volume: number;
    markets: number;
  }>;
  trendingMarkets: Array<{
    marketId: string;
    title: string;
    priceChange: number;
    volume: number;
  }>;
}

/**
 * Calculate overall market sentiment
 */
export async function calculateSentimentMetrics(
  days: number = 7
): Promise<SentimentMetrics> {
  if (!db) throw new Error("Database not initialized");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  // Get all open markets
  const openMarkets = await db
    .select()
    .from(markets)
    .where(eq(markets.status, "open"));

  // Calculate overall optimism (weighted by liquidity)
  let totalLiquidity = 0;
  let weightedYesPrice = 0;

  const categoryMetrics: Record<string, {
    totalLiquidity: number;
    weightedYesPrice: number;
    marketCount: number;
  }> = {};

  for (const market of openMarkets) {
    const liquidity = parseFloat(market.liquidity);
    const yesPrice = parseFloat(market.yesPrice);

    totalLiquidity += liquidity;
    weightedYesPrice += liquidity * yesPrice;

    const category = market.category;
    if (!categoryMetrics[category]) {
      categoryMetrics[category] = {
        totalLiquidity: 0,
        weightedYesPrice: 0,
        marketCount: 0,
      };
    }
    categoryMetrics[category].totalLiquidity += liquidity;
    categoryMetrics[category].weightedYesPrice += liquidity * yesPrice;
    categoryMetrics[category].marketCount += 1;
  }

  const overallOptimism = totalLiquidity > 0 ? weightedYesPrice / totalLiquidity : 0.5;

  // Calculate volatility from price history
  const priceChanges: number[] = [];
  for (const market of openMarkets.slice(0, 10)) { // Sample for performance
    const history = await db
      .select()
      .from(marketPriceHistory)
      .where(
        and(
          eq(marketPriceHistory.marketId, market.id),
          gte(marketPriceHistory.timestamp, cutoffDate)
        )
      )
      .orderBy(marketPriceHistory.timestamp)
      .limit(100);

    for (let i = 1; i < history.length; i++) {
      const prevPrice = parseFloat(history[i - 1].yesPrice);
      const currPrice = parseFloat(history[i].yesPrice);
      const change = Math.abs(currPrice - prevPrice);
      priceChanges.push(change);
    }
  }

  const volatility =
    priceChanges.length > 0
      ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length
      : 0;

  // Calculate category-level metrics
  const categoryResults: Record<string, {
    optimism: number;
    volume: number;
    markets: number;
  }> = {};

  for (const [category, metrics] of Object.entries(categoryMetrics)) {
    categoryResults[category] = {
      optimism:
        metrics.totalLiquidity > 0
          ? metrics.weightedYesPrice / metrics.totalLiquidity
          : 0.5,
      volume: metrics.totalLiquidity,
      markets: metrics.marketCount,
    };
  }

  // Find trending markets (largest price changes)
  const trendingMarkets = await Promise.all(
    openMarkets.slice(0, 10).map(async (market: typeof openMarkets[0]) => {
      const recentHistory = await db
        .select()
        .from(marketPriceHistory)
        .where(
          and(
            eq(marketPriceHistory.marketId, market.id),
            gte(marketPriceHistory.timestamp, cutoffDate)
          )
        )
        .orderBy(marketPriceHistory.timestamp)
        .limit(2);

      let priceChange = 0;
      if (recentHistory.length >= 2) {
        const oldPrice = parseFloat(recentHistory[0].yesPrice);
        const newPrice = parseFloat(recentHistory[recentHistory.length - 1].yesPrice);
        priceChange = newPrice - oldPrice;
      }

      return {
        marketId: market.id,
        title: market.title,
        priceChange,
        volume: parseFloat(market.liquidity),
      };
    })
  );

  trendingMarkets.sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange));

  return {
    overallOptimism,
    volatility,
    categoryMetrics: categoryResults,
    trendingMarkets: trendingMarkets.slice(0, 5),
  };
}

