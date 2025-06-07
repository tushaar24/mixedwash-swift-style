
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent } from '@/utils/clevertap';
import { useAuth } from '@/context/AuthContext';
import { useScrollTracking } from '@/hooks/useScrollTracking';

interface PageTrackerProps {
  children: React.ReactNode;
  pageName: string;
}

export const PageTracker = ({ children, pageName }: PageTrackerProps) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const hasTrackedRef = useRef(false);
  
  // Add scroll tracking
  useScrollTracking(pageName);
  
  useEffect(() => {
    // Reset tracking flag when location changes
    hasTrackedRef.current = false;
  }, [location.pathname]);
  
  useEffect(() => {
    // Skip if already tracked for this location
    if (hasTrackedRef.current) return;
    
    const userInfo = user ? {
      user_id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username
    } : undefined;
    
    // Special handling for Homepage
    if (pageName === 'Homepage') {
      trackEvent('home_page_viewed', {
        'URL': location.pathname,
        'Search': location.search,
        ...(userInfo?.user_id && { user_id: userInfo.user_id }),
        'customer_name': userInfo?.name || 'anonymous user'
      });
    } else {
      // Use regular page view tracking for other pages
      trackPageView(pageName, {
        'URL': location.pathname,
        'Search': location.search
      }, userInfo);
    }
    
    hasTrackedRef.current = true;
  }, [user, profile, pageName, location]);

  return <>{children}</>;
};
