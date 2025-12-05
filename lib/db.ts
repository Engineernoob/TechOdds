import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getDatabase } from "./db-connection";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Export database instance using lazy initialization
// This allows the app to build even without DATABASE_URL set
export const db = getDatabase();

// Type for database instance
type DatabaseInstance = PostgresJsDatabase<typeof schema>;

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Market = typeof schema.markets.$inferSelect;
export type NewMarket = typeof schema.markets.$inferInsert;
export type Trade = typeof schema.trades.$inferSelect;
export type NewTrade = typeof schema.trades.$inferInsert;
export type MarketPriceHistory = typeof schema.marketPriceHistory.$inferSelect;
export type NewMarketPriceHistory =
  typeof schema.marketPriceHistory.$inferInsert;

// Helper function to wrap database queries with better error handling
async function dbQuery<T>(queryFn: (db: DatabaseInstance) => Promise<T>): Promise<T> {
  const database = getDatabase();
  if (!database) {
    throw new Error(
      "Database not initialized. Please set DATABASE_URL in .env.local. " +
        "See SETUP.md for instructions."
    );
  }
  try {
    return await queryFn(database);
  } catch (error: any) {
    if (error?.code === "ENOTFOUND" || error?.code === "ECONNREFUSED") {
      const hostname = error?.hostname || "unknown";
      throw new Error(
        `Cannot connect to database at ${hostname}. ` +
          `Please verify:\n` +
          `1. Your DATABASE_URL in .env.local is correct\n` +
          `2. The Supabase project exists and is active\n` +
          `3. Your network connection is working\n` +
          `Original error: ${error.message}`
      );
    }
    throw error;
  }
}

// Helper functions
export async function getMarkets() {
  return dbQuery(async () => {
    const database = getDatabase()!;
    return await database
      .select()
      .from(schema.markets)
      .orderBy(schema.markets.createdAt);
  });
}

export async function getMarketById(id: string) {
  return dbQuery(async () => {
    const database = getDatabase()!;
    const [market] = await database
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.id, id));
    return market;
  });
}

export async function getUserById(id: string) {
  return dbQuery(async () => {
    const database = getDatabase()!;
    const [user] = await database
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user;
  });
}

export async function getUserByEmail(email: string) {
  return dbQuery(async () => {
    const database = getDatabase()!;
    const [user] = await database
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  });
}

export async function getTradesByUserId(userId: string) {
  return dbQuery(async () => {
    const database = getDatabase()!;
    return await database
      .select()
      .from(schema.trades)
      .where(eq(schema.trades.userId, userId))
      .orderBy(schema.trades.createdAt);
  });
}

export async function getPriceHistory(marketId: string) {
  return dbQuery(async () => {
    const database = getDatabase()!;
    return await database
      .select()
      .from(schema.marketPriceHistory)
      .where(eq(schema.marketPriceHistory.marketId, marketId))
      .orderBy(schema.marketPriceHistory.timestamp);
  });
}
