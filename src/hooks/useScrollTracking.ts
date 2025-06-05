import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;

      const userInfo = user ? {
        user_id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
        phone: profile?.mobile_number
      } : undefined;

      // Track 25% scroll
      if (scrollPercentage >= 25 && !scrollTrackingRef.current.hasTracked25) {
        scrollTrackingRef.current.hasTracked25 = true;
        
      }

      // Track 50% scroll
      if (scrollPercentage >= 50 && !scrollTrackingRef.current.hasTracked50) {
        scrollTrackingRef.current.hasTracked50 = true;
        
      }

      // Track 75% scroll
      if (scrollPercentage >= 75 && !scrollTrackingRef.current.hasTracked75) {
        scrollTrackingRef.current.hasTracked75 = true;
        
      }

      // Track 100% scroll
      if (scrollPercentage >= 90 && !scrollTrackingRef.current.hasTracked100) {
        scrollTrackingRef.current.hasTracked100 = true;
        
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pageName, user, profile]);
};
