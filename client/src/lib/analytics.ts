/**
 * Analytics Integration
 * 
 * This module provides a unified interface for tracking analytics events
 * across multiple platforms (Google Analytics, Mixpanel, custom backend).
 */

// ============================================
// TYPES
// ============================================

interface AnalyticsEvent {
  name: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

interface PageView {
  path: string;
  title?: string;
  referrer?: string;
}

interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  plan?: string;
  [key: string]: unknown;
}

interface AnalyticsConfig {
  googleAnalyticsId?: string;
  mixpanelToken?: string;
  debug?: boolean;
}

// ============================================
// GOOGLE ANALYTICS
// ============================================

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    mixpanel?: {
      init: (token: string) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string) => void;
      people: {
        set: (properties: Record<string, unknown>) => void;
      };
      reset: () => void;
    };
  }
}

function initGoogleAnalytics(measurementId: string) {
  if (typeof window === "undefined") return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    send_page_view: false, // We'll track page views manually
  });
}

function trackGAEvent(event: AnalyticsEvent) {
  if (!window.gtag) return;

  window.gtag("event", event.name, {
    event_category: event.category,
    event_label: event.label,
    value: event.value,
    ...event.properties,
  });
}

function trackGAPageView(pageView: PageView) {
  if (!window.gtag) return;

  window.gtag("event", "page_view", {
    page_path: pageView.path,
    page_title: pageView.title,
    page_referrer: pageView.referrer,
  });
}

function setGAUser(properties: UserProperties) {
  if (!window.gtag) return;

  window.gtag("set", "user_properties", properties);
  if (properties.userId) {
    window.gtag("set", { user_id: properties.userId });
  }
}

// ============================================
// MIXPANEL
// ============================================

function initMixpanel(token: string) {
  if (typeof window === "undefined") return;

  // Load Mixpanel script
  (function(c,a){if(!a.__SV){var b=window;try{var d,m,j,k=b.location,f=k.hash;d=function(a,b){return(m=a.match(RegExp(b+"=([^&]*)")))?m[1]:null};f&&d(f,"state")&&(j=JSON.parse(decodeURIComponent(d(f,"state"))),"mpeditor"===j.action&&(b.sessionStorage.setItem("_mpcehash",f),history.replaceState(j.desiredHash||"",c.title,k.pathname+k.search)))}catch(n){}var l,h;window.mixpanel=a;a._i=[];a.init=function(b,d,g){function c(b,i){var a=i.split(".");2==a.length&&(b=b[a[0]],i=a[1]);b[i]=function(){b.push([i].concat(Array.prototype.slice.call(arguments,
  0)))}}var e=a;void 0!==g?e=a[g]=[]:g="mixpanel";e.people=e.people||[];e.toString=function(b){var a="mixpanel";void 0!==g&&(a+="."+g);b||(a+=" (stub)");return a};e.people.toString=function(){return e.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
  for(h=0;h<l.length;h++)c(e,l[h]);var f="set set_once union unset remove delete".split(" ");e.get_group=function(){function a(c){b[c]=function(){call2_args=arguments;call2=[c].concat(Array.prototype.slice.call(call2_args,0));e.push([d,call2])}}for(var b={},d=["get_group"].concat(Array.prototype.slice.call(arguments,0)),c=0;c<f.length;c++)a(f[c]);return b};a._i.push([b,d,g])};a.__SV=1.2;b=c.createElement("script");b.type="text/javascript";b.async=!0;b.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";d=c.getElementsByTagName("script")[0];d.parentNode?.insertBefore(b,d)}})(document,window.mixpanel||[]);

  window.mixpanel?.init(token);
}

function trackMixpanelEvent(event: AnalyticsEvent) {
  if (!window.mixpanel) return;

  window.mixpanel.track(event.name, {
    category: event.category,
    label: event.label,
    value: event.value,
    ...event.properties,
  });
}

function trackMixpanelPageView(pageView: PageView) {
  if (!window.mixpanel) return;

  window.mixpanel.track("Page View", {
    path: pageView.path,
    title: pageView.title,
    referrer: pageView.referrer,
  });
}

function setMixpanelUser(properties: UserProperties) {
  if (!window.mixpanel) return;

  if (properties.userId) {
    window.mixpanel.identify(properties.userId);
  }
  window.mixpanel.people.set(properties);
}

// ============================================
// ANALYTICS CLASS
// ============================================

class Analytics {
  private config: AnalyticsConfig = {};
  private initialized = false;
  private queue: Array<() => void> = [];

  /**
   * Initialize analytics with configuration
   */
  init(config: AnalyticsConfig) {
    if (this.initialized) return;

    this.config = config;

    if (config.googleAnalyticsId) {
      initGoogleAnalytics(config.googleAnalyticsId);
    }

    if (config.mixpanelToken) {
      initMixpanel(config.mixpanelToken);
    }

    this.initialized = true;

    // Process queued events
    this.queue.forEach((fn) => fn());
    this.queue = [];
  }

  /**
   * Track a custom event
   */
  track(event: AnalyticsEvent | string, properties?: Record<string, unknown>) {
    const normalizedEvent: AnalyticsEvent =
      typeof event === "string" ? { name: event, properties } : event;

    const doTrack = () => {
      if (this.config.debug) {
        console.log("[Analytics] Track:", normalizedEvent);
      }

      trackGAEvent(normalizedEvent);
      trackMixpanelEvent(normalizedEvent);
    };

    if (this.initialized) {
      doTrack();
    } else {
      this.queue.push(doTrack);
    }
  }

  /**
   * Track a page view
   */
  page(pageView?: PageView | string) {
    const normalizedPageView: PageView =
      typeof pageView === "string"
        ? { path: pageView }
        : pageView || {
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer,
          };

    const doPage = () => {
      if (this.config.debug) {
        console.log("[Analytics] Page:", normalizedPageView);
      }

      trackGAPageView(normalizedPageView);
      trackMixpanelPageView(normalizedPageView);
    };

    if (this.initialized) {
      doPage();
    } else {
      this.queue.push(doPage);
    }
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: Omit<UserProperties, "userId">) {
    const userProperties: UserProperties = { userId, ...properties };

    const doIdentify = () => {
      if (this.config.debug) {
        console.log("[Analytics] Identify:", userProperties);
      }

      setGAUser(userProperties);
      setMixpanelUser(userProperties);
    };

    if (this.initialized) {
      doIdentify();
    } else {
      this.queue.push(doIdentify);
    }
  }

  /**
   * Reset user identity (on logout)
   */
  reset() {
    if (this.config.debug) {
      console.log("[Analytics] Reset");
    }

    window.mixpanel?.reset();
  }

  /**
   * Track specific DJ website events
   */
  trackMixPlay(mixId: string, mixTitle: string) {
    this.track({
      name: "mix_play",
      category: "Mixes",
      label: mixTitle,
      properties: { mixId },
    });
  }

  trackMixDownload(mixId: string, mixTitle: string, format: string) {
    this.track({
      name: "mix_download",
      category: "Mixes",
      label: mixTitle,
      properties: { mixId, format },
    });
  }

  trackBookingStart() {
    this.track({
      name: "booking_start",
      category: "Bookings",
    });
  }

  trackBookingComplete(eventType: string) {
    this.track({
      name: "booking_complete",
      category: "Bookings",
      label: eventType,
    });
  }

  trackNewsletterSignup(source: string) {
    this.track({
      name: "newsletter_signup",
      category: "Newsletter",
      label: source,
    });
  }

  trackSocialShare(platform: string, contentType: string, contentId: string) {
    this.track({
      name: "social_share",
      category: "Social",
      label: platform,
      properties: { contentType, contentId },
    });
  }

  trackVideoPlay(videoId: string, videoTitle: string) {
    this.track({
      name: "video_play",
      category: "Videos",
      label: videoTitle,
      properties: { videoId },
    });
  }

  trackPodcastPlay(episodeId: string, episodeTitle: string) {
    this.track({
      name: "podcast_play",
      category: "Podcasts",
      label: episodeTitle,
      properties: { episodeId },
    });
  }

  trackPurchase(productId: string, productName: string, amount: number) {
    this.track({
      name: "purchase",
      category: "Ecommerce",
      label: productName,
      value: amount,
      properties: { productId },
    });
  }

  trackShoutSubmit() {
    this.track({
      name: "shout_submit",
      category: "Engagement",
    });
  }

  trackTrackRequest(trackTitle: string) {
    this.track({
      name: "track_request",
      category: "Engagement",
      label: trackTitle,
    });
  }

  trackLiveStreamJoin() {
    this.track({
      name: "live_stream_join",
      category: "Live",
    });
  }

  trackAIDannyChat() {
    this.track({
      name: "ai_danny_chat",
      category: "AI",
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Auto-initialize from environment variables
if (typeof window !== "undefined") {
  const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN;

  if (gaMeasurementId || mixpanelToken) {
    analytics.init({
      googleAnalyticsId: gaMeasurementId,
      mixpanelToken: mixpanelToken,
      debug: import.meta.env.DEV,
    });
  }
}

export default analytics;
