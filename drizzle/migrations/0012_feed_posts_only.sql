-- Feed Posts only (Confirmed missing)
CREATE INDEX idx_feed_posts_created_at ON feed_posts(createdAt);
CREATE INDEX idx_feed_posts_is_public ON feed_posts(isPublic);
