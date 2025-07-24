// Lazy-loaded Google Tag Manager utilities to reduce initial bundle size

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    gtmLoaded?: boolean;
  }
}

// Lazy GTM initialization function
const lazyInitGTM = (() => {
  let initPromise: Promise<boolean> | null = null;
  
  return () => {
    if (initPromise) return initPromise;
    
    initPromise = new Promise((resolve) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.gtmLoaded && window.gtag) {
        resolve(true);
        return;
      }
      
      // Wait for the script tag initialization
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.gtmLoaded && window.gtag) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve(false);
      }, 5000);
    });
    
    return initPromise;
  };
})();

// Lazy GTM event tracking
const lazyGTMEvent = async (eventName: string, eventData?: Record<string, any>) => {
  try {
    const isInitialized = await lazyInitGTM();
    if (!isInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', eventName, eventData);
  } catch (error) {
    console.error('Error tracking GTM event:', error);
  }
};

// Lazy GTM page view tracking
const lazyGTMPageView = async (pagePath: string, pageTitle?: string) => {
  try {
    const isInitialized = await lazyInitGTM();
    if (!isInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('config', 'GTM-TMLNCBRB', {
      page_path: pagePath,
      page_title: pageTitle
    });
  } catch (error) {
    console.error('Error tracking GTM page view:', error);
  }
};

// Lazy GTM conversion tracking
const lazyGTMConversion = async (conversionId: string, conversionData?: Record<string, any>) => {
  try {
    const isInitialized = await lazyInitGTM();
    if (!isInitialized || typeof window === 'undefined' || !window.gtag) {
      return;
    }

    window.gtag('event', 'conversion', {
      send_to: conversionId,
      ...conversionData
    });
  } catch (error) {
    console.error('Error tracking GTM conversion:', error);
  }
};

// Export lazy-loaded GTM functions
export const gtm = {
  event: lazyGTMEvent,
  pageView: lazyGTMPageView,
  conversion: lazyGTMConversion,
  init: lazyInitGTM
};

// Re-export for backward compatibility
export const trackGTMEvent = lazyGTMEvent;
export const trackGTMPageView = lazyGTMPageView;
export const trackGTMConversion = lazyGTMConversion;