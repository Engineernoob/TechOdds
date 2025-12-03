/**
 * Ranking System Utilities
 * Calculate XP, ranks, and season management
 */

export type RankTier = "Bronze" | "Silver" | "Gold" | "Platinum" | "Insider" | "Oracle";

export interface RankThresholds {
  Bronze: number;
  Silver: number;
  Gold: number;
  Platinum: number;
  Insider: number;
  Oracle: number;
}

export const RANK_THRESHOLDS: RankThresholds = {
  Bronze: 0,
  Silver: 100,
  Gold: 500,
  Platinum: 1500,
  Insider: 5000,
  Oracle: 15000,
};

/**
 * Calculate rank from XP
 */
export function calculateRank(xp: number): RankTier {
  if (xp >= RANK_THRESHOLDS.Oracle) return "Oracle";
  if (xp >= RANK_THRESHOLDS.Insider) return "Insider";
  if (xp >= RANK_THRESHOLDS.Platinum) return "Platinum";
  if (xp >= RANK_THRESHOLDS.Gold) return "Gold";
  if (xp >= RANK_THRESHOLDS.Silver) return "Silver";
  return "Bronze";
}

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  trade: 5, // Per trade
  accuratePrediction: 50, // When market resolves correctly
  addLiquidity: 10, // Per liquidity event
  createMarket: 20, // Creating a market
  createFuture: 15, // Creating an applicant future
  comment: 2, // Per comment
  resolveMarket: 100, // Successfully resolving a market
  disputeRaised: 5, // Raising a valid dispute
};

/**
 * Calculate XP gained from an action
 */
export function calculateXPGain(
  action: keyof typeof XP_REWARDS,
  multiplier: number = 1
): number {
  return Math.floor(XP_REWARDS[action] * multiplier);
}

/**
 * Calculate accuracy bonus XP
 */
export function calculateAccuracyBonus(
  correctPredictions: number,
  totalPredictions: number
): number {
  if (totalPredictions === 0) return 0;

  const accuracy = correctPredictions / totalPredictions;
  const baseBonus = XP_REWARDS.accuratePrediction * correctPredictions;
  const accuracyMultiplier = accuracy > 0.7 ? 1.5 : accuracy > 0.5 ? 1.2 : 1.0;

  return Math.floor(baseBonus * accuracyMultiplier);
}

/**
 * Get current season identifier
 */
export function getCurrentSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

/**
 * Get season start and end dates
 */
export function getSeasonDates(season: string): { start: Date; end: Date } {
  const [year, quarter] = season.split("-Q").map(Number);
  const startMonth = (quarter - 1) * 3;
  const start = new Date(year, startMonth, 1);
  const end = new Date(year, startMonth + 3, 0, 23, 59, 59);

  return { start, end };
}

/**
 * Calculate rank progress (0-1)
 */
export function calculateRankProgress(xp: number, rank: RankTier): {
  progress: number;
  currentRankXP: number;
  nextRankXP: number;
  xpToNextRank: number;
} {
  const ranks: RankTier[] = ["Bronze", "Silver", "Gold", "Platinum", "Insider", "Oracle"];
  const rankIndex = ranks.indexOf(rank);
  const currentThreshold = RANK_THRESHOLDS[rank];
  const nextRank = ranks[rankIndex + 1] as RankTier | undefined;
  const nextThreshold = nextRank ? RANK_THRESHOLDS[nextRank] : Infinity;

  const xpInRank = xp - currentThreshold;
  const xpNeededForNext = nextThreshold - currentThreshold;
  const progress = xpNeededForNext > 0 ? xpInRank / xpNeededForNext : 1;

  return {
    progress: Math.min(1, Math.max(0, progress)),
    currentRankXP: currentThreshold,
    nextRankXP: nextThreshold,
    xpToNextRank: Math.max(0, nextThreshold - xp),
  };
}

/**
 * Get rank badge color
 */
export function getRankColor(rank: RankTier): string {
  const colors: Record<RankTier, string> = {
    Bronze: "#cd7f32",
    Silver: "#c0c0c0",
    Gold: "#ffd700",
    Platinum: "#e5e4e2",
    Insider: "#4a90e2",
    Oracle: "#9b59b6",
  };
  return colors[rank];
}

