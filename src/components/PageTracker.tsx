
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
    
    console.log('=== PAGE TRACKER ===');
    console.log('Page name:', pageName);
    console.log('Location:', location.pathname);
    console.log('User exists:', !!user);
    console.log('Profile exists:', !!profile);
    
    const userInfo = user ? {
      user_id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username
    } : undefined;
    
    console.log('User info for tracking:', userInfo);
    
    // Add small delay to ensure CleverTap is fully loaded
    setTimeout(() => {
      // Special handling for Homepage
      if (pageName === 'Homepage') {
        console.log('🏠 Tracking homepage view');
        trackEvent('home_page_viewed', {
          'URL': location.pathname,
          'Search': location.search,
          'timestamp': new Date().toISOString(),
          ...(userInfo?.user_id && { user_id: userInfo.user_id }),
          'customer_name': userInfo?.name || 'anonymous user'
        });
      } else {
        console.log('📄 Tracking page view:', pageName);
        // Use regular page view tracking for other pages
        trackPageView(pageName, {
          'URL': location.pathname,
          'Search': location.search,
          'timestamp': new Date().toISOString()
        }, userInfo);
      }
    }, 100);
    
    hasTrackedRef.current = true;
  }, [user, profile, pageName, location]);

  return <>{children}</>;
};
