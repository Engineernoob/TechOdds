import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;

// Only initialize if DATABASE_URL is set (for build-time, this may be undefined)
let client: ReturnType<typeof postgres> | null = null;
if (connectionString) {
  client = postgres(connectionString);
}

export const db = client ? drizzle(client, { schema }) : null as any;

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;
export type Market = typeof schema.markets.$inferSelect;
export type NewMarket = typeof schema.markets.$inferInsert;
export type Trade = typeof schema.trades.$inferSelect;
export type NewTrade = typeof schema.trades.$inferInsert;
export type MarketPriceHistory = typeof schema.marketPriceHistory.$inferSelect;
export type NewMarketPriceHistory = typeof schema.marketPriceHistory.$inferInsert;

// Helper functions
export async function getMarkets() {
  return await db.select().from(schema.markets).orderBy(schema.markets.createdAt);
}

export async function getMarketById(id: string) {
  const [market] = await db.select().from(schema.markets).where(eq(schema.markets.id, id));
  return market;
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
  return user;
}

export async function getTradesByUserId(userId: string) {
  return await db
    .select()
    .from(schema.trades)
    .where(eq(schema.trades.userId, userId))
    .orderBy(schema.trades.createdAt);
}

export async function getPriceHistory(marketId: string) {
  return await db
    .select()
    .from(schema.marketPriceHistory)
    .where(eq(schema.marketPriceHistory.marketId, marketId))
    .orderBy(schema.marketPriceHistory.timestamp);
}
