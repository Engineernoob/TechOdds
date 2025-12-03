import { pgTable, text, numeric, timestamp, uuid, pgEnum, boolean, jsonb } from "drizzle-orm/pg-core";
import { customType } from "drizzle-orm/pg-core";

// Custom vector type for pgvector
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export const marketStatusEnum = pgEnum("market_status", ["open", "closed", "resolved"]);
export const tradeSideEnum = pgEnum("trade_side", ["yes", "no"]);
export const marketCategoryEnum = pgEnum("market_category", [
  "macro",
  "company",
  "applicant",
  "industry",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const markets = pgTable("markets", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: marketCategoryEnum("category").notNull(),
  resolutionDate: timestamp("resolution_date").notNull(),
  status: marketStatusEnum("status").notNull().default("open"),
  yesPrice: numeric("yes_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  noPrice: numeric("no_price", { precision: 5, scale: 4 }).notNull().default("0.5000"),
  liquidity: numeric("liquidity", { precision: 10, scale: 2 }).notNull().default("1000.00"),
  liquidityYes: numeric("liquidity_yes", { precision: 10, scale: 2 }).notNull().default("500.00"),
  liquidityNo: numeric("liquidity_no", { precision: 10, scale: 2 }).notNull().default("500.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trades = pgTable("trades", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  side: tradeSideEnum("side").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  price: numeric("price", { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const marketPriceHistory = pgTable("market_price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  yesPrice: numeric("yes_price", { precision: 5, scale: 4 }).notNull(),
  noPrice: numeric("no_price", { precision: 5, scale: 4 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  applicantFutures: many(applicantFutures),
  notifications: many(notifications),
}));

export const marketsRelations = relations(markets, ({ many, one }) => ({
  trades: many(trades),
  priceHistory: many(marketPriceHistory),
  applicantFuture: one(applicantFutures),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [trades.marketId],
    references: [markets.id],
  }),
}));

export const marketPriceHistoryRelations = relations(marketPriceHistory, ({ one }) => ({
  market: one(markets, {
    fields: [marketPriceHistory.marketId],
    references: [markets.id],
  }),
}));

// Phase 2: Applicant Futures
export const applicantFutures = pgTable("applicant_futures", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  anon: boolean("anon").notNull().default(false),
  targetDate: timestamp("target_date").notNull(),
  metrics: jsonb("metrics").notNull(), // e.g., { "offer_count": { ">=": 1 } }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 2: Embeddings
export const embeddings = pgTable("embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // "market", "future", "resume_section"
  entityId: uuid("entity_id").notNull(),
  vector: vector("vector", { dimensions: 1536 }), // OpenAI embedding dimension
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 2: Notifications
export const notificationTypeEnum = pgEnum("notification_type", [
  "future_bet",
  "price_spike",
  "resolution_soon",
  "market_resolved",
  "resume_analyzed",
]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  relatedEntityId: uuid("related_entity_id"), // Optional reference to market/future
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 2 Relations
export const applicantFuturesRelations = relations(applicantFutures, ({ one }) => ({
  user: one(users, {
    fields: [applicantFutures.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [applicantFutures.marketId],
    references: [markets.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));


