import { useEffect, useRef, useCallback } from 'react';
import { trackEvent } from '@/utils/clevertap';
import { useAuth } from '@/context/AuthContext';

export const useScrollTracking = (pageName: string) => {
  const { user, profile } = useAuth();
  const scrollTrackingRef = useRef({
    hasTracked25: false,
    hasTracked50: false,
    hasTracked75: false,
    hasTracked100: false,
  });
  const documentHeightRef = useRef<number>(0);
  const ticking = useRef(false);

  const handleScroll = useCallback(() => {
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset;
        // Cache document height to avoid repeated DOM queries
        if (documentHeightRef.current === 0) {
          documentHeightRef.current = document.documentElement.scrollHeight - window.innerHeight;
        }
        const scrollPercentage = (scrollTop / documentHeightRef.current) * 100;

        const userInfo = user ? {
          user_id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
          phone: profile?.mobile_number
        } : undefined;

        // Track 25% scroll
        if (scrollPercentage >= 25 && !scrollTrackingRef.current.hasTracked25) {
          scrollTrackingRef.current.hasTracked25 = true;
          trackEvent('scroll_25_percent', { page: pageName, ...userInfo });
        }

        // Track 50% scroll
        if (scrollPercentage >= 50 && !scrollTrackingRef.current.hasTracked50) {
          scrollTrackingRef.current.hasTracked50 = true;
          trackEvent('scroll_50_percent', { page: pageName, ...userInfo });
        }

        // Track 75% scroll
        if (scrollPercentage >= 75 && !scrollTrackingRef.current.hasTracked75) {
          scrollTrackingRef.current.hasTracked75 = true;
          trackEvent('scroll_75_percent', { page: pageName, ...userInfo });
        }

        // Track 100% scroll
        if (scrollPercentage >= 90 && !scrollTrackingRef.current.hasTracked100) {
          scrollTrackingRef.current.hasTracked100 = true;
          trackEvent('scroll_100_percent', { page: pageName, ...userInfo });
        }

        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [pageName, user, profile]);

  useEffect(() => {
    // Reset cached height on mount and recalculate if needed
    documentHeightRef.current = 0;
    
    // Reset tracking state for new page
    scrollTrackingRef.current = {
      hasTracked25: false,
      hasTracked50: false,
      hasTracked75: false,
      hasTracked100: false,
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};
