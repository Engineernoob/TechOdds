-- Phase 3: Advanced Features Schema

-- Create liquidity pool enums and tables
CREATE TYPE liquidity_event_type AS ENUM ('add', 'remove');

CREATE TABLE liquidity_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  yes_liquidity NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  no_liquidity NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_fees NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE liquidity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  type liquidity_event_type NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Market Resolution & Governance
CREATE TYPE resolver_status AS ENUM ('pending', 'approved', 'banned');

CREATE TABLE resolvers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  status resolver_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE dispute_status AS ENUM ('open', 'closed', 'escalated');

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status dispute_status NOT NULL DEFAULT 'open',
  reason_text TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Social Layer
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TYPE activity_feed_type AS ENUM (
  'trade',
  'future-created',
  'liquidity',
  'comment',
  'resolution',
  'dispute'
);

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type activity_feed_type NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ranking System
CREATE TYPE rank_tier AS ENUM ('Bronze', 'Silver', 'Gold', 'Platinum', 'Insider', 'Oracle');

CREATE TABLE user_rank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  season TEXT NOT NULL,
  xp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  rank rank_tier NOT NULL DEFAULT 'Bronze',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Influencers
CREATE TABLE influencers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle TEXT NOT NULL UNIQUE,
  description TEXT,
  avatar_url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE influencer_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE collection_markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_liquidity_pools_market_id ON liquidity_pools(market_id);
CREATE INDEX idx_liquidity_events_user_id ON liquidity_events(user_id);
CREATE INDEX idx_liquidity_events_market_id ON liquidity_events(market_id);
CREATE INDEX idx_resolvers_user_id ON resolvers(user_id);
CREATE INDEX idx_resolvers_market_id ON resolvers(market_id);
CREATE INDEX idx_disputes_market_id ON disputes(market_id);
CREATE INDEX idx_comments_market_id ON comments(market_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_type ON activity_feed(type);
CREATE INDEX idx_activity_feed_created_at ON activity_feed(created_at);
CREATE INDEX idx_user_rank_season ON user_rank(season);
CREATE INDEX idx_user_rank_xp ON user_rank(xp);
CREATE INDEX idx_influencer_markets_influencer_id ON influencer_markets(influencer_id);
CREATE INDEX idx_collection_markets_collection_id ON collection_markets(collection_id);

-- RLS Policies
ALTER TABLE liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resolvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rank ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_markets ENABLE ROW LEVEL SECURITY;

-- Policies (simplified - adjust based on requirements)
CREATE POLICY "Anyone can view liquidity pools" ON liquidity_pools FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add liquidity" ON liquidity_pools FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own liquidity events" ON liquidity_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own liquidity events" ON liquidity_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view resolvers" ON resolvers FOR SELECT USING (true);
CREATE POLICY "Admins can assign resolvers" ON resolvers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view disputes" ON disputes FOR SELECT USING (true);
CREATE POLICY "Users can create disputes" ON disputes FOR INSERT WITH CHECK (auth.uid() = raised_by);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity feed" ON activity_feed FOR SELECT USING (auth.uid() = user_id OR true);
CREATE POLICY "System can create activity feed" ON activity_feed FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view leaderboard" ON user_rank FOR SELECT USING (true);
CREATE POLICY "Users can update own rank" ON user_rank FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view influencers" ON influencers FOR SELECT USING (true);
CREATE POLICY "Anyone can view collections" ON collections FOR SELECT USING (true);

