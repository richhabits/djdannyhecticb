import { loadScript } from './utils';

/**
 * Enterprise Analytics Implementation
 * Integrates Google Analytics, Mixpanel, and custom analytics
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customProperties?: Record<string, any>;
}

interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  membershipTier?: string;
  totalBookings?: number;
  lifetimeValue?: number;
  lastActive?: string;
  preferences?: Record<string, any>;
}

interface PageViewEvent {
  path: string;
  title: string;
  referrer?: string;
  searchParams?: Record<string, string>;
  duration?: number;
}

class AnalyticsManager {
  private initialized = false;
  private userId: string | null = null;
  private sessionId: string;
  private startTime: number;
  private pageViews: PageViewEvent[] = [];
  private eventQueue: AnalyticsEvent[] = [];
  private isDebug = process.env.NODE_ENV === 'development';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.initializeProviders();
    this.setupPageTracking();
    this.setupErrorTracking();
    this.setupPerformanceTracking();
  }

  /**
   * Initialize analytics providers
   */
  private async initializeProviders() {
    try {
      // Google Analytics 4
      if (process.env.VITE_GA_MEASUREMENT_ID) {
        await loadScript(
          `https://www.googletagmanager.com/gtag/js?id=${process.env.VITE_GA_MEASUREMENT_ID}`
        );
        
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
          send_page_view: false,
          debug_mode: this.isDebug,
        });
      }

      // Mixpanel
      if (process.env.VITE_MIXPANEL_TOKEN) {
        await loadScript('https://cdn.mixpanel.com/mixpanel-2-latest.min.js');
        
        window.mixpanel.init(process.env.VITE_MIXPANEL_TOKEN, {
          debug: this.isDebug,
          track_pageview: false,
          persistence: 'localStorage',
          ignore_dnt: false,
          batch_requests: true,
          batch_size: 10,
          batch_flush_interval_ms: 2000,
        });
      }

      // Facebook Pixel
      if (process.env.VITE_FB_PIXEL_ID) {
        await this.initializeFacebookPixel();
      }

      // TikTok Pixel
      if (process.env.VITE_TIKTOK_PIXEL_ID) {
        await this.initializeTikTokPixel();
      }

      // Custom analytics endpoint
      this.setupCustomAnalytics();

      this.initialized = true;
      this.flushEventQueue();
      
      if (this.isDebug) {
        console.log('✅ Analytics providers initialized');
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Initialize Facebook Pixel
   */
  private async initializeFacebookPixel() {
    await loadScript('https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq = window.fbq || function() {
      (window.fbq.q = window.fbq.q || []).push(arguments);
    };
    window.fbq.l = window.fbq.l || Date.now();
    window.fbq('init', process.env.VITE_FB_PIXEL_ID);
  }

  /**
   * Initialize TikTok Pixel
   */
  private async initializeTikTokPixel() {
    await loadScript('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + process.env.VITE_TIKTOK_PIXEL_ID);
    
    window.ttq = window.ttq || function() {
      (window.ttq.q = window.ttq.q || []).push(arguments);
    };
    window.ttq.l = window.ttq.l || Date.now();
    window.ttq('init', process.env.VITE_TIKTOK_PIXEL_ID);
  }

  /**
   * Setup custom analytics endpoint
   */
  private setupCustomAnalytics() {
    // Send analytics data to our own backend
    setInterval(() => {
      this.sendBatchedEvents();
    }, 30000); // Every 30 seconds

    // Send on page unload
    window.addEventListener('beforeunload', () => {
      this.sendBatchedEvents(true);
    });
  }

  /**
   * Setup automatic page tracking
   */
  private setupPageTracking() {
    let lastPath = window.location.pathname;
    let pageStartTime = Date.now();

    const trackPageView = () => {
      const currentPath = window.location.pathname;
      
      if (currentPath !== lastPath) {
        // Track time on previous page
        const duration = Date.now() - pageStartTime;
        this.trackPageView({
          path: lastPath,
          title: document.title,
          duration,
        });

        // Reset for new page
        lastPath = currentPath;
        pageStartTime = Date.now();
      }
    };

    // Track on route changes
    window.addEventListener('popstate', trackPageView);
    
    // Track initial page view
    this.trackPageView({
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
    });

    // Track time on page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const duration = Date.now() - pageStartTime;
        this.updatePageDuration(lastPath, duration);
      } else {
        pageStartTime = Date.now();
      }
    });
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
      });
    });
  }

  /**
   * Setup performance tracking
   */
  private setupPerformanceTracking() {
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackPerformance('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}

      // Track First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.trackPerformance('FID', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {}

      // Track Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        // Report CLS on page unload
        window.addEventListener('beforeunload', () => {
          this.trackPerformance('CLS', clsValue);
        });
      } catch (e) {}
    }

    // Track page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.trackPerformance('PageLoad', navigation.loadEventEnd - navigation.fetchStart);
          this.trackPerformance('DOMReady', navigation.domContentLoadedEventEnd - navigation.fetchStart);
          this.trackPerformance('FirstByte', navigation.responseStart - navigation.fetchStart);
        }
      }, 0);
    });
  }

  /**
   * Identify user
   */
  public identify(userId: string, properties?: UserProperties) {
    this.userId = userId;

    if (!this.initialized) {
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
        user_id: userId,
        user_properties: properties,
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(userId);
      if (properties) {
        window.mixpanel.people.set(properties);
      }
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('init', process.env.VITE_FB_PIXEL_ID, {
        em: properties?.email,
        external_id: userId,
      });
    }

    // Custom analytics
    this.sendEvent('user_identified', {
      userId,
      ...properties,
    });
  }

  /**
   * Track page view
   */
  public trackPageView(event: PageViewEvent) {
    if (!this.initialized) {
      this.pageViews.push(event);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: event.path,
        page_title: event.title,
        page_referrer: event.referrer,
        engagement_time_msec: event.duration,
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track('Page View', {
        path: event.path,
        title: event.title,
        referrer: event.referrer,
        duration: event.duration,
        ...event.searchParams,
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }

    // TikTok Pixel
    if (window.ttq) {
      window.ttq('track', 'ViewContent', {
        content_name: event.title,
        content_category: this.getCategoryFromPath(event.path),
      });
    }

    // Custom analytics
    this.sendEvent('page_view', event);
  }

  /**
   * Track custom event
   */
  public trackEvent(event: AnalyticsEvent) {
    if (!this.initialized) {
      this.eventQueue.push(event);
      return;
    }

    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.customProperties,
      });
    }

    // Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(`${event.category}_${event.action}`, {
        label: event.label,
        value: event.value,
        ...event.customProperties,
      });
    }

    // Facebook Pixel - Map to standard events
    if (window.fbq) {
      const fbEvent = this.mapToFacebookEvent(event);
      if (fbEvent) {
        window.fbq('track', fbEvent.name, fbEvent.params);
      }
    }

    // TikTok Pixel - Map to standard events
    if (window.ttq) {
      const ttEvent = this.mapToTikTokEvent(event);
      if (ttEvent) {
        window.ttq('track', ttEvent.name, ttEvent.params);
      }
    }

    // Custom analytics
    this.sendEvent('custom_event', event);
  }

  /**
   * Track conversion
   */
  public trackConversion(type: string, value?: number, currency = 'GBP') {
    this.trackEvent({
      category: 'conversion',
      action: type,
      value,
      customProperties: {
        currency,
        conversion_type: type,
      },
    });

    // Google Ads conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: process.env.VITE_GOOGLE_ADS_CONVERSION_ID,
        value,
        currency,
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value,
        currency,
        content_type: type,
      });
    }

    // TikTok Pixel
    if (window.ttq) {
      window.ttq('track', 'CompletePayment', {
        value,
        currency,
        content_type: type,
      });
    }
  }

  /**
   * Track error
   */
  private trackError(error: any) {
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message || error.toString(),
        fatal: false,
      });
    }

    if (window.mixpanel) {
      window.mixpanel.track('Error', error);
    }

    this.sendEvent('error', error);
  }

  /**
   * Track performance metric
   */
  private trackPerformance(metric: string, value: number) {
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: metric,
        value: Math.round(value),
        event_category: 'Performance',
      });
    }

    if (window.mixpanel) {
      window.mixpanel.track('Performance', {
        metric,
        value,
      });
    }

    this.sendEvent('performance', { metric, value });
  }

  /**
   * Track booking
   */
  public trackBooking(bookingData: {
    bookingId: string;
    eventType: string;
    eventDate: string;
    value: number;
    guestCount?: number;
  }) {
    this.trackEvent({
      category: 'booking',
      action: 'created',
      label: bookingData.eventType,
      value: bookingData.value,
      customProperties: bookingData,
    });

    // Enhanced e-commerce tracking
    if (window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: bookingData.bookingId,
        value: bookingData.value,
        currency: 'GBP',
        items: [{
          item_id: bookingData.eventType,
          item_name: `DJ Booking - ${bookingData.eventType}`,
          price: bookingData.value,
          quantity: 1,
        }],
      });
    }

    // Facebook Pixel
    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: bookingData.value,
        currency: 'GBP',
        content_ids: [bookingData.bookingId],
        content_type: 'product',
        content_name: bookingData.eventType,
        num_items: 1,
      });
    }

    this.trackConversion('booking', bookingData.value);
  }

  /**
   * Track social share
   */
  public trackShare(platform: string, content: string) {
    this.trackEvent({
      category: 'social',
      action: 'share',
      label: platform,
      customProperties: {
        content_type: content,
        method: platform,
      },
    });

    if (window.gtag) {
      window.gtag('event', 'share', {
        method: platform,
        content_type: content,
      });
    }
  }

  /**
   * Track video engagement
   */
  public trackVideo(action: 'play' | 'pause' | 'complete', videoData: {
    id: string;
    title: string;
    duration?: number;
    currentTime?: number;
  }) {
    this.trackEvent({
      category: 'video',
      action,
      label: videoData.title,
      customProperties: {
        video_id: videoData.id,
        video_duration: videoData.duration,
        video_current_time: videoData.currentTime,
        video_percent: videoData.currentTime && videoData.duration 
          ? Math.round((videoData.currentTime / videoData.duration) * 100)
          : 0,
      },
    });

    // YouTube Analytics
    if (window.gtag) {
      window.gtag('event', `video_${action}`, {
        video_title: videoData.title,
        video_duration: videoData.duration,
        video_current_time: videoData.currentTime,
      });
    }
  }

  /**
   * Track search
   */
  public trackSearch(query: string, results: number) {
    this.trackEvent({
      category: 'search',
      action: 'perform',
      label: query,
      value: results,
    });

    if (window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        results_count: results,
      });
    }
  }

  /**
   * Send batched events to custom analytics
   */
  private async sendBatchedEvents(immediate = false) {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const payload = {
        sessionId: this.sessionId,
        userId: this.userId,
        events,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        referrer: document.referrer,
        url: window.location.href,
      };

      if (immediate && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics', JSON.stringify(payload));
      } else {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue = [...events, ...this.eventQueue];
    }
  }

  /**
   * Helper functions
   */
  private sendEvent(type: string, data: any) {
    this.eventQueue.push({
      category: 'custom',
      action: type,
      customProperties: data,
    });
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updatePageDuration(path: string, duration: number) {
    const pageView = this.pageViews.find(p => p.path === path);
    if (pageView) {
      pageView.duration = (pageView.duration || 0) + duration;
    }
  }

  private getCategoryFromPath(path: string): string {
    const segments = path.split('/').filter(Boolean);
    return segments[0] || 'home';
  }

  private mapToFacebookEvent(event: AnalyticsEvent) {
    const mapping: Record<string, { name: string; params?: any }> = {
      'booking_started': { name: 'InitiateCheckout' },
      'booking_completed': { name: 'Purchase' },
      'mix_played': { name: 'ViewContent' },
      'newsletter_signup': { name: 'Lead' },
      'contact_form': { name: 'Contact' },
    };

    const key = `${event.category}_${event.action}`;
    return mapping[key];
  }

  private mapToTikTokEvent(event: AnalyticsEvent) {
    const mapping: Record<string, { name: string; params?: any }> = {
      'booking_started': { name: 'InitiateCheckout' },
      'booking_completed': { name: 'CompletePayment' },
      'mix_played': { name: 'ViewContent' },
      'newsletter_signup': { name: 'SubmitForm' },
    };

    const key = `${event.category}_${event.action}`;
    return mapping[key];
  }

  private flushEventQueue() {
    this.pageViews.forEach(event => this.trackPageView(event));
    this.pageViews = [];

    this.eventQueue.forEach(event => this.trackEvent(event));
    this.eventQueue = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsManager();

// Export types
export type { AnalyticsEvent, UserProperties, PageViewEvent };

// Export convenience functions
export const trackEvent = analytics.trackEvent.bind(analytics);
export const trackPageView = analytics.trackPageView.bind(analytics);
export const trackConversion = analytics.trackConversion.bind(analytics);
export const trackBooking = analytics.trackBooking.bind(analytics);
export const trackShare = analytics.trackShare.bind(analytics);
export const trackVideo = analytics.trackVideo.bind(analytics);
export const trackSearch = analytics.trackSearch.bind(analytics);
export const identify = analytics.identify.bind(analytics);

// Declare global types
declare global {
  interface Window {
    gtag: any;
    dataLayer: any[];
    mixpanel: any;
    fbq: any;
    ttq: any;
  }
}