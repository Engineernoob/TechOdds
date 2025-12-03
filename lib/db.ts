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

// Helper functions
export async function getMarkets() {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  return await db
    .select()
    .from(schema.markets)
    .orderBy(schema.markets.createdAt);
}

export async function getMarketById(id: string) {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  const [market] = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.id, id));
  return market;
}

export async function getUserById(id: string) {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email));
  return user;
}

export async function getTradesByUserId(userId: string) {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  return await db
    .select()
    .from(schema.trades)
    .where(eq(schema.trades.userId, userId))
    .orderBy(schema.trades.createdAt);
}

export async function getPriceHistory(marketId: string) {
  if (!db)
    throw new Error("Database not initialized. Set DATABASE_URL in .env.local");
  return await db
    .select()
    .from(schema.marketPriceHistory)
    .where(eq(schema.marketPriceHistory.marketId, marketId))
    .orderBy(schema.marketPriceHistory.timestamp);
}
