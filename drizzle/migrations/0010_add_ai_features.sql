-- AI Features Migration
-- Adds support for chat summaries, spam detection, moderation, recommendations, transcripts, and predictive analytics

-- ENUMS
CREATE TYPE spam_flag_status AS ENUM ('clean', 'flagged', 'approved', 'deleted');
CREATE TYPE moderation_status AS ENUM ('safe', 'flagged', 'toxic', 'reviewed', 'approved', 'deleted');
CREATE TYPE clip_thumbnail_status AS ENUM ('generating', 'generated', 'selected', 'published', 'archived');
CREATE TYPE recommendation_type AS ENUM ('content_based', 'collaborative', 'trending', 'personalized');

-- CHAT SUMMARIES
CREATE TABLE chat_summaries (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  summary TEXT NOT NULL,
  topics JSONB NOT NULL DEFAULT '[]',
  sentiment VARCHAR(50) NOT NULL DEFAULT 'neutral',
  top_moments JSONB NOT NULL DEFAULT '[]',
  message_count INTEGER NOT NULL DEFAULT 0,
  viewer_sentiment JSONB NOT NULL DEFAULT '{"positive": 0, "neutral": 0, "negative": 0}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX chat_summaries_session_idx ON chat_summaries(live_session_id);
CREATE INDEX chat_summaries_time_idx ON chat_summaries(start_time);

-- SPAM DETECTION
CREATE TABLE spam_flags (
  id SERIAL PRIMARY KEY,
  chat_message_id INTEGER NOT NULL,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  flag_type VARCHAR(100) NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  reason TEXT,
  status spam_flag_status NOT NULL DEFAULT 'flagged',
  moderator_review BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX spam_flags_message_idx ON spam_flags(chat_message_id);
CREATE INDEX spam_flags_session_idx ON spam_flags(live_session_id);
CREATE INDEX spam_flags_user_idx ON spam_flags(user_id);
CREATE INDEX spam_flags_status_idx ON spam_flags(status);

-- SMART MODERATION
CREATE TABLE moderation_flags (
  id SERIAL PRIMARY KEY,
  chat_message_id INTEGER NOT NULL,
  live_session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  violation_type VARCHAR(100) NOT NULL,
  confidence NUMERIC(3,2) NOT NULL,
  reason TEXT,
  status moderation_status NOT NULL DEFAULT 'flagged',
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  model_version VARCHAR(50) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX moderation_flags_message_idx ON moderation_flags(chat_message_id);
CREATE INDEX moderation_flags_session_idx ON moderation_flags(live_session_id);
CREATE INDEX moderation_flags_user_idx ON moderation_flags(user_id);
CREATE INDEX moderation_flags_status_idx ON moderation_flags(status);

-- CLIP THUMBNAILS
CREATE TABLE clip_thumbnails (
  id SERIAL PRIMARY KEY,
  clip_id INTEGER NOT NULL,
  image_url VARCHAR(512) NOT NULL,
  image_prompt TEXT,
  generated_by VARCHAR(100) NOT NULL DEFAULT 'ai',
  status clip_thumbnail_status NOT NULL DEFAULT 'generated',
  is_selected BOOLEAN NOT NULL DEFAULT FALSE,
  click_count INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(5,4),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX clip_thumbnails_clip_idx ON clip_thumbnails(clip_id);
CREATE INDEX clip_thumbnails_selected_idx ON clip_thumbnails(is_selected);

-- RECOMMENDATIONS
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  recommended_content_id INTEGER NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  recommendation_type recommendation_type NOT NULL,
  score NUMERIC(5,4) NOT NULL,
  reason TEXT,
  clicked BOOLEAN NOT NULL DEFAULT FALSE,
  impressions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX recommendations_user_idx ON recommendations(user_id);
CREATE INDEX recommendations_content_idx ON recommendations(recommended_content_id);
CREATE INDEX recommendations_type_idx ON recommendations(content_type);

-- STREAM TRANSCRIPTS
CREATE TABLE stream_transcripts (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL UNIQUE,
  full_text TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL DEFAULT 'whisper',
  language VARCHAR(20) NOT NULL DEFAULT 'en',
  duration INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX stream_transcripts_session_idx ON stream_transcripts(live_session_id);

-- STREAM TAGS
CREATE TABLE stream_tags (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  tag_type VARCHAR(50) NOT NULL,
  tag_value VARCHAR(255) NOT NULL,
  timestamp VARCHAR(20),
  confidence NUMERIC(3,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX stream_tags_session_idx ON stream_tags(live_session_id);
CREATE INDEX stream_tags_type_idx ON stream_tags(tag_type);
CREATE INDEX stream_tags_value_idx ON stream_tags(tag_value);

-- AUTO-GENERATED CLIPS
CREATE TABLE auto_clips (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  clip_id INTEGER,
  moment_type VARCHAR(100) NOT NULL,
  moment_time TIMESTAMP NOT NULL,
  clipped_start_time TIMESTAMP,
  clipped_end_time TIMESTAMP,
  title VARCHAR(255),
  description TEXT,
  auto_generated BOOLEAN NOT NULL DEFAULT TRUE,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX auto_clips_session_idx ON auto_clips(live_session_id);
CREATE INDEX auto_clips_published_idx ON auto_clips(published);
CREATE INDEX auto_clips_moment_type_idx ON auto_clips(moment_type);

-- CHURN PREDICTIONS
CREATE TABLE churn_predictions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  risk_score NUMERIC(3,2) NOT NULL,
  risk_factors JSONB NOT NULL DEFAULT '[]',
  last_engagement_days INTEGER,
  recommended_action TEXT,
  model_version VARCHAR(50) NOT NULL DEFAULT '1.0',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX churn_predictions_user_idx ON churn_predictions(user_id);
CREATE INDEX churn_predictions_risk_idx ON churn_predictions(risk_score);

-- CONTENT ANALYTICS
CREATE TABLE content_analytics (
  id SERIAL PRIMARY KEY,
  live_session_id INTEGER NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  viewer_retention JSONB NOT NULL DEFAULT '[]',
  engagement_score NUMERIC(5,4),
  revenue_prediction NUMERIC(10,2),
  revenue_actual NUMERIC(10,2),
  predictions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX content_analytics_session_idx ON content_analytics(live_session_id);
