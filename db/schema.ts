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

// Phase 3: Liquidity Pools
export const liquidityPools = pgTable("liquidity_pools", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  yesLiquidity: numeric("yes_liquidity", { precision: 10, scale: 2 }).notNull().default("0.00"),
  noLiquidity: numeric("no_liquidity", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalFees: numeric("total_fees", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const liquidityEventTypeEnum = pgEnum("liquidity_event_type", ["add", "remove"]);

export const liquidityEvents = pgTable("liquidity_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  type: liquidityEventTypeEnum("type").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 3: Market Resolution & Governance
export const resolverStatusEnum = pgEnum("resolver_status", ["pending", "approved", "banned"]);

export const resolvers = pgTable("resolvers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  status: resolverStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const disputeStatusEnum = pgEnum("dispute_status", ["open", "closed", "escalated"]);

export const disputes = pgTable("disputes", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  raisedBy: uuid("raised_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: disputeStatusEnum("status").notNull().default("open"),
  reasonText: text("reason_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 3: Social Layer
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  parentId: uuid("parent_id"), // For replies - reference handled in relations
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityFeedTypeEnum = pgEnum("activity_feed_type", [
  "trade",
  "future-created",
  "liquidity",
  "comment",
  "resolution",
  "dispute",
]);

export const activityFeed = pgTable("activity_feed", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: activityFeedTypeEnum("type").notNull(),
  metadata: jsonb("metadata").notNull(), // Flexible JSON for different activity types
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 3: Ranking System
export const rankTierEnum = pgEnum("rank_tier", [
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Insider",
  "Oracle",
]);

export const userRank = pgTable("user_rank", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  season: text("season").notNull(), // e.g., "2024-Q1"
  xp: numeric("xp", { precision: 10, scale: 2 }).notNull().default("0.00"),
  rank: rankTierEnum("rank").notNull().default("Bronze"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Phase 3: Influencers
export const influencers = pgTable("influencers", {
  id: uuid("id").primaryKey().defaultRandom(),
  handle: text("handle").notNull().unique(),
  description: text("description"),
  avatarUrl: text("avatar_url"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const influencerMarkets = pgTable("influencer_markets", {
  id: uuid("id").primaryKey().defaultRandom(),
  influencerId: uuid("influencer_id")
    .notNull()
    .references(() => influencers.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 3: Collections
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const collectionMarkets = pgTable("collection_markets", {
  id: uuid("id").primaryKey().defaultRandom(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  marketId: uuid("market_id")
    .notNull()
    .references(() => markets.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Phase 3 Relations
export const liquidityPoolsRelations = relations(liquidityPools, ({ one }) => ({
  market: one(markets, {
    fields: [liquidityPools.marketId],
    references: [markets.id],
  }),
}));

export const liquidityEventsRelations = relations(liquidityEvents, ({ one }) => ({
  user: one(users, {
    fields: [liquidityEvents.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [liquidityEvents.marketId],
    references: [markets.id],
  }),
}));

export const resolversRelations = relations(resolvers, ({ one }) => ({
  user: one(users, {
    fields: [resolvers.userId],
    references: [users.id],
  }),
  market: one(markets, {
    fields: [resolvers.marketId],
    references: [markets.id],
  }),
}));

export const disputesRelations = relations(disputes, ({ one }) => ({
  market: one(markets, {
    fields: [disputes.marketId],
    references: [markets.id],
  }),
  raisedByUser: one(users, {
    fields: [disputes.raisedBy],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  market: one(markets, {
    fields: [comments.marketId],
    references: [markets.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId!],
    references: [comments.id],
    relationName: "commentReplies",
  }),
  replies: many(comments, {
    relationName: "commentReplies",
  }),
}));

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id],
  }),
}));

export const userRankRelations = relations(userRank, ({ one }) => ({
  user: one(users, {
    fields: [userRank.userId],
    references: [users.id],
  }),
}));

export const influencersRelations = relations(influencers, ({ one, many }) => ({
  user: one(users, {
    fields: [influencers.userId],
    references: [users.id],
  }),
  markets: many(influencerMarkets),
}));

export const influencerMarketsRelations = relations(influencerMarkets, ({ one }) => ({
  influencer: one(influencers, {
    fields: [influencerMarkets.influencerId],
    references: [influencers.id],
  }),
  market: one(markets, {
    fields: [influencerMarkets.marketId],
    references: [markets.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [collections.createdBy],
    references: [users.id],
  }),
  markets: many(collectionMarkets),
}));

export const collectionMarketsRelations = relations(collectionMarkets, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionMarkets.collectionId],
    references: [collections.id],
  }),
  market: one(markets, {
    fields: [collectionMarkets.marketId],
    references: [markets.id],
  }),
}));


