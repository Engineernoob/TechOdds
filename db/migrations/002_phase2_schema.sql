-- Phase 2: Applicant Futures, Embeddings, and Notifications

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'future_bet',
  'price_spike',
  'resolution_soon',
  'market_resolved',
  'resume_analyzed'
);

-- Create applicant_futures table
CREATE TABLE applicant_futures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  anon BOOLEAN NOT NULL DEFAULT FALSE,
  target_date TIMESTAMP NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create embeddings table (requires pgvector extension)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- "market", "future", "resume_section"
  entity_id UUID NOT NULL,
  vector vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_id UUID, -- Optional reference to market/future
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applicant_futures_user_id ON applicant_futures(user_id);
CREATE INDEX idx_applicant_futures_market_id ON applicant_futures(market_id);
CREATE INDEX idx_applicant_futures_target_date ON applicant_futures(target_date);
CREATE INDEX idx_embeddings_entity_type ON embeddings(entity_type);
CREATE INDEX idx_embeddings_entity_id ON embeddings(entity_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (vector vector_cosine_ops);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- RLS Policies for Phase 2 tables
ALTER TABLE applicant_futures ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for applicant_futures
CREATE POLICY "Users can view all futures" ON applicant_futures
  FOR SELECT USING (true);

CREATE POLICY "Users can create own futures" ON applicant_futures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own futures" ON applicant_futures
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for embeddings (read-only for now)
CREATE POLICY "Anyone can view embeddings" ON embeddings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create embeddings" ON embeddings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

