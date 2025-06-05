
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/utils/clevertap';

interface ServiceDetailTrackerProps {
  serviceName: string;
  eventType: 'schedule_pickup' | 'get_estimate';
}

export const ServiceDetailTracker = ({ serviceName, eventType }: ServiceDetailTrackerProps) => {
  const { user, profile } = useAuth();
  
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInfo = () => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined;

  const trackServiceDetailEvent = () => {
    const userInfo = getUserInfo();
    const eventName = eventType === 'schedule_pickup' 
      ? 'service_detail_screen_schedule_pickup_clicked'
      : 'service_detail_screen_get_estimate_clicked';
    
    trackEvent(eventName, {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'service_type': serviceName
    });
  };

  useEffect(() => {
    trackServiceDetailEvent();
  }, []);

  return null;
};
