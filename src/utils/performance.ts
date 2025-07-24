import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

// Track Core Web Vitals and send to analytics
function sendToAnalytics(metric: any) {
  // Send to CleverTap for tracking
  if (typeof window !== 'undefined' && (window as any).clevertap) {
    (window as any).clevertap.event.push('core_web_vitals', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      url: window.location.pathname,
      timestamp: Date.now()
    });
  }
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Core Web Vital:', metric);
  }
}

export function initPerformanceTracking() {
  // Track all Core Web Vitals
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}