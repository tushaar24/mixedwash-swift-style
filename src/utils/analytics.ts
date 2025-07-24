// Lazy-loaded analytics utilities to reduce initial bundle size

// Dynamically import CleverTap functions only when needed
const lazyTrackEvent = async (eventName: string, eventData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const { trackEvent } = await import('./clevertap');
    return trackEvent(eventName, eventData, userInfo);
  } catch (error) {
    console.error('Failed to load CleverTap analytics:', error);
  }
};

// Dynamically import GTM functions only when needed
const lazyGTMEvent = async (eventName: string, eventData?: Record<string, any>) => {
  try {
    const { trackGTMEvent } = await import('./gtm');
    return trackGTMEvent(eventName, eventData);
  } catch (error) {
    console.error('Failed to load GTM analytics:', error);
  }
};

const lazyTrackPageView = async (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const { trackPageView } = await import('./clevertap');
    return trackPageView(pageName, pageData, userInfo);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

const lazyTrackOrder = async (orderData: any, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const { trackOrderPlaced } = await import('./clevertap');
    return trackOrderPlaced(orderData, userInfo);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

const lazyTrackService = async (serviceData: any, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const { trackServiceScheduled } = await import('./clevertap');
    return trackServiceScheduled(serviceData, userInfo);
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
};

// Export lazy-loaded analytics functions
export const analytics = {
  track: lazyTrackEvent,
  page: lazyTrackPageView,
  order: lazyTrackOrder,
  service: lazyTrackService,
  gtm: {
    event: lazyGTMEvent,
    pageView: async (pagePath: string, pageTitle?: string) => {
      try {
        const { trackGTMPageView } = await import('./gtm');
        return trackGTMPageView(pagePath, pageTitle);
      } catch (error) {
        console.error('Failed to load GTM analytics:', error);
      }
    }
  }
};

// Re-export for backward compatibility
export const trackEvent = lazyTrackEvent;
export const trackPageView = lazyTrackPageView;
export const trackOrderPlaced = lazyTrackOrder;
export const trackServiceScheduled = lazyTrackService;
export const trackGTMEvent = lazyGTMEvent;