export const ENV = {
  // Backend can read either APP_ID or VITE_APP_ID (for compatibility)
  appId: process.env.APP_ID ?? process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Payment - Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  
  // Email - Resend
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "DJ Danny Hectic B <noreply@djdannyhecticb.com>",
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? "",
  
  // AI - OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o",
  
  // AI - ElevenLabs
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY ?? "",
  elevenlabsVoiceId: process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM",
  
  // AI - Replicate
  replicateApiKey: process.env.REPLICATE_API_KEY ?? "",
  
  // AI Feature Flags
  aiPostingEnabled: process.env.AI_POSTING_ENABLED === "true",
  aiHostingEnabled: process.env.AI_HOSTING_ENABLED === "true",
  fanFacingAiToolsEnabled: process.env.FAN_FACING_AI_TOOLS_ENABLED === "true",
  
  // Storage - AWS S3
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsRegion: process.env.AWS_REGION ?? "eu-west-2",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  awsS3PublicUrl: process.env.AWS_S3_PUBLIC_URL ?? "",
  
  // Analytics
  sentryDsn: process.env.SENTRY_DSN ?? "",
  
  // Social Media APIs
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID ?? "",
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",
  instagramAppId: process.env.INSTAGRAM_APP_ID ?? "",
  instagramAppSecret: process.env.INSTAGRAM_APP_SECRET ?? "",
  tiktokClientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
  tiktokClientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
  twitterApiKey: process.env.TWITTER_API_KEY ?? "",
  twitterApiSecret: process.env.TWITTER_API_SECRET ?? "",
  twitterBearerToken: process.env.TWITTER_BEARER_TOKEN ?? "",
  
  // Calendar Integration
  googleCalendarApiKey: process.env.GOOGLE_CALENDAR_API_KEY ?? "",
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "",
  
  // Webhooks
  zapierBookingWebhook: process.env.ZAPIER_BOOKING_WEBHOOK ?? "",
  zapierShoutWebhook: process.env.ZAPIER_SHOUT_WEBHOOK ?? "",
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL ?? "",
  
  // Server Config
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3000", 10),
  debug: process.env.DEBUG === "true",
};
