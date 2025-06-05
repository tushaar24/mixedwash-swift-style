
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/clevertap';
import { useAuth } from '@/context/AuthContext';
import { useScrollTracking } from '@/hooks/useScrollTracking';

interface PageTrackerProps {
  children: React.ReactNode;
  pageName: string;
}

export const PageTracker = ({ children, pageName }: PageTrackerProps) => {
  const { user, profile } = useAuth();
  const location = useLocation();
  
  // Add scroll tracking
  useScrollTracking(pageName);
  
  useEffect(() => {
    const userInfo = user ? {
      user_id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
      phone: profile?.mobile_number
    } : undefined;
    
    trackPageView(pageName, {
      'URL': location.pathname,
      'Search': location.search
    }, userInfo);
  }, [user, profile, pageName, location]);

  return <>{children}</>;
};
