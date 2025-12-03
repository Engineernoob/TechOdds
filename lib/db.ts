import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";
import { databaseConfig } from "./env";

const connectionString = databaseConfig.url;

// Only initialize if DATABASE_URL is set and valid (for build-time, this may be undefined)
let client: ReturnType<typeof postgres> | null = null;
if (
  connectionString &&
  !connectionString.includes("your") &&
  !connectionString.includes("localhost")
) {
  try {
    client = postgres(connectionString);
  } catch (error) {
    console.warn("Failed to initialize database connection:", error);
    client = null;
  }
}

export const db = client ? drizzle(client, { schema }) : (null as any);

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
async function dbQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  if (!db) {
    throw new Error(
      "Database not initialized. Please set DATABASE_URL in .env.local"
    );
  }
  try {
    return await queryFn();
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
  return dbQuery(() =>
    db.select().from(schema.markets).orderBy(schema.markets.createdAt)
  );
}

export async function getMarketById(id: string) {
  return dbQuery(async () => {
    const [market] = await db
      .select()
      .from(schema.markets)
      .where(eq(schema.markets.id, id));
    return market;
  });
}

export async function getUserById(id: string) {
  return dbQuery(async () => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return user;
  });
}

export async function getUserByEmail(email: string) {
  return dbQuery(async () => {
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));
    return user;
  });
}

export async function getTradesByUserId(userId: string) {
  return dbQuery(() =>
    db
      .select()
      .from(schema.trades)
      .where(eq(schema.trades.userId, userId))
      .orderBy(schema.trades.createdAt)
  );
}

export async function getPriceHistory(marketId: string) {
  return dbQuery(() =>
    db
      .select()
      .from(schema.marketPriceHistory)
      .where(eq(schema.marketPriceHistory.marketId, marketId))
      .orderBy(schema.marketPriceHistory.timestamp)
  );
}
