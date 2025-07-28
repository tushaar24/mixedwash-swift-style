import { onCLS, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

export const initWebVitals = () => {
  const handleMetric = (metric: Metric) => {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.log(`${metric.name}:`, metric.value, metric);
    }
    
    // In production, you could send to analytics service
    // For now, we'll just store in sessionStorage for review
    const existingMetrics = JSON.parse(sessionStorage.getItem('webVitals') || '[]');
    existingMetrics.push({
      name: metric.name,
      value: metric.value,
      timestamp: Date.now(),
      url: window.location.pathname
    });
    sessionStorage.setItem('webVitals', JSON.stringify(existingMetrics));
  };

  // Measure Core Web Vitals
  onCLS(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
};

// Utility to retrieve stored metrics for analysis
export const getStoredMetrics = () => {
  return JSON.parse(sessionStorage.getItem('webVitals') || '[]');
};

// Utility to clear stored metrics
export const clearMetrics = () => {
  sessionStorage.removeItem('webVitals');
};