import { PostHog } from 'posthog-node';
import * as Sentry from '@sentry/node';
import { ENV } from './env';

let posthog: PostHog | null = null;
let sentryInitialized = false;

/**
 * Initialize PostHog client
 */
export function getPostHog(): PostHog | null {
  if (!process.env.POSTHOG_KEY) {
    return null;
  }

  if (!posthog) {
    posthog = new PostHog(process.env.POSTHOG_KEY, {
      host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
    });
  }

  return posthog;
}

/**
 * Initialize Sentry
 */
export function initSentry() {
  if (sentryInitialized || !ENV.sentryDsn) {
    return;
  }

  Sentry.init({
    dsn: ENV.sentryDsn,
    environment: ENV.nodeEnv,
    tracesSampleRate: ENV.isProduction ? 0.1 : 1.0,
  });

  sentryInitialized = true;
}

/**
 * Track event in PostHog
 */
export function trackEvent(params: {
  distinctId: string;
  event: string;
  properties?: Record<string, any>;
}) {
  const client = getPostHog();
  if (!client) {
    return;
  }

  client.capture({
    distinctId: params.distinctId,
    event: params.event,
    properties: params.properties,
  });
}

/**
 * Track page view
 */
export function trackPageView(params: {
  distinctId: string;
  path: string;
  properties?: Record<string, any>;
}) {
  trackEvent({
    distinctId: params.distinctId,
    event: '$pageview',
    properties: {
      ...params.properties,
      $current_url: path,
    },
  });
}

/**
 * Identify user in PostHog
 */
export function identifyUser(params: {
  distinctId: string;
  properties?: Record<string, any>;
}) {
  const client = getPostHog();
  if (!client) {
    return;
  }

  client.identify({
    distinctId: params.distinctId,
    properties: params.properties,
  });
}

/**
 * Track mix play
 */
export function trackMixPlay(params: {
  userId?: string;
  mixId: number;
  mixTitle: string;
}) {
  trackEvent({
    distinctId: params.userId || 'anonymous',
    event: 'mix_played',
    properties: {
      mix_id: params.mixId,
      mix_title: params.mixTitle,
    },
  });
}

/**
 * Track booking submission
 */
export function trackBookingSubmission(params: {
  userId?: string;
  eventType: string;
  location: string;
}) {
  trackEvent({
    distinctId: params.userId || 'anonymous',
    event: 'booking_submitted',
    properties: {
      event_type: params.eventType,
      location: params.location,
    },
  });
}

/**
 * Track shout submission
 */
export function trackShoutSubmission(params: {
  userId?: string;
  isTrackRequest: boolean;
  hasPhone: boolean;
  whatsappOptIn: boolean;
}) {
  trackEvent({
    distinctId: params.userId || 'anonymous',
    event: 'shout_submitted',
    properties: {
      is_track_request: params.isTrackRequest,
      has_phone: params.hasPhone,
      whatsapp_opt_in: params.whatsappOptIn,
    },
  });
}

/**
 * Track payment
 */
export function trackPayment(params: {
  userId?: string;
  amount: number;
  currency: string;
  type: 'support' | 'product' | 'subscription';
  productId?: number;
}) {
  trackEvent({
    distinctId: params.userId || 'anonymous',
    event: 'payment_completed',
    properties: {
      amount: params.amount,
      currency: params.currency,
      type: params.type,
      product_id: params.productId,
    },
  });
}

/**
 * Track AI usage
 */
export function trackAIUsage(params: {
  userId?: string;
  feature: string;
  type: 'script' | 'voice' | 'video' | 'chat';
  tokensUsed?: number;
}) {
  trackEvent({
    distinctId: params.userId || 'anonymous',
    event: 'ai_used',
    properties: {
      feature: params.feature,
      type: params.type,
      tokens_used: params.tokensUsed,
    },
  });
}

/**
 * Capture error in Sentry
 */
export function captureError(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    console.error('[Analytics] Error (Sentry not configured):', error);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Flush analytics before shutdown
 */
export async function flushAnalytics() {
  const client = getPostHog();
  if (client) {
    await client.shutdown();
  }
}

// Initialize Sentry on module load
initSentry();
