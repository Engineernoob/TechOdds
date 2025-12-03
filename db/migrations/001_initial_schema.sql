-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension (for future embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enums
CREATE TYPE market_status AS ENUM ('open', 'closed', 'resolved');
CREATE TYPE trade_side AS ENUM ('yes', 'no');
CREATE TYPE market_category AS ENUM ('macro', 'company', 'applicant', 'industry');

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  balance NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create markets table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category market_category NOT NULL,
  resolution_date TIMESTAMP NOT NULL,
  status market_status NOT NULL DEFAULT 'open',
  yes_price NUMERIC(5, 4) NOT NULL DEFAULT 0.5000,
  no_price NUMERIC(5, 4) NOT NULL DEFAULT 0.5000,
  liquidity NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
  liquidity_yes NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  liquidity_no NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  side trade_side NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  price NUMERIC(5, 4) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create market_price_history table
CREATE TABLE market_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  yes_price NUMERIC(5, 4) NOT NULL,
  no_price NUMERIC(5, 4) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_market_id ON trades(market_id);
CREATE INDEX idx_market_price_history_market_id ON market_price_history(market_id);
CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(category);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_price_history ENABLE ROW LEVEL SECURITY;

-- Policies for users (users can read their own data)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for markets (everyone can read, authenticated users can create)
CREATE POLICY "Anyone can view markets" ON markets
  FOR SELECT USING (true);

-- Policies for trades (users can only see their own trades)
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for market_price_history (everyone can read)
CREATE POLICY "Anyone can view price history" ON market_price_history
  FOR SELECT USING (true);

