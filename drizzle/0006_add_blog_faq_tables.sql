-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt VARCHAR(512),
  author VARCHAR(255),
  "featuredImageUrl" VARCHAR(512),
  tags TEXT,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  "publishedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for fast lookups
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published_at ON blog_posts("publishedAt" DESC);

-- Create faq_category enum
CREATE TYPE faq_category AS ENUM ('booking', 'merch', 'technical', 'shipping', 'general');

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question VARCHAR(512) NOT NULL,
  answer TEXT NOT NULL,
  category faq_category NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category and displayOrder for fast queries
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_display_order ON faqs("displayOrder" ASC);
