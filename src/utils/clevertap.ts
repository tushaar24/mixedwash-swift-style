
// Declare CleverTap as a global variable
declare global {
  interface Window {
    clevertap: any;
  }
}

// Initialize CleverTap - now that it's loaded via script tag
export const initCleverTap = () => {
  try {
    // Simplified initialization - only check once
    if (typeof window !== 'undefined' && window.clevertap) {
      console.log('CleverTap initialized');
      return true;
    }
    
    // Single retry after 2 seconds
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.clevertap) {
        console.log('CleverTap initialized (delayed)');
      }
    }, 2000);
    
  } catch (error) {
    console.error('CleverTap initialization failed:', error);
  }
};

// User profile methods
export const setUserProfile = (profileData: {
  Name?: string;
  Email?: string;
  Phone?: string;
  Identity?: string;
  [key: string]: any;
}) => {
  console.log('=== CLEVERTAP PROFILE SET ===');
  console.log('Profile data being sent:', profileData);
  
  try {
    if (typeof window !== 'undefined' && window.clevertap) {
      // Use the correct method for setting user profile
      window.clevertap.onUserLogin.push({
        Site: profileData
      });
      
      console.log('CleverTap profile set successfully');
    } else {
      console.warn('CleverTap not available for profile setting');
    }
  } catch (error) {
    console.error('Error setting CleverTap profile:', error);
  }
};

// Event tracking methods with user info
export const trackEvent = (eventName: string, eventData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    if (typeof window === 'undefined' || !window.clevertap) {
      return;
    }

    const eventPayload = {
      ...eventData,
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    // Send event to CleverTap
    window.clevertap.event.push(eventName, eventPayload);
    
  } catch (error) {
    console.error('Error tracking CleverTap event:', error);
  }
};

// Page view tracking with user info
export const trackPageView = (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    if (typeof window === 'undefined' || !window.clevertap) {
      console.warn('CleverTap not available for page view tracking');
      return;
    }

    const eventPayload = {
      'Page Name': pageName,
      ...pageData,
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    console.log('=== CLEVERTAP PAGE VIEW ===');
    console.log('Page name:', pageName);
    console.log('Page data:', pageData);
    console.log('Event payload:', eventPayload);
    console.log('User info:', userInfo);
    
    window.clevertap.event.push('Page Viewed', eventPayload);
    
    console.log('CleverTap page view event sent successfully');
  } catch (error) {
    console.error('Error tracking CleverTap page view:', error);
  }
};

// E-commerce events with user info
export const trackOrderPlaced = (orderData: {
  orderId: string;
  amount: number;
  currency?: string;
  items?: any[];
}, userInfo?: { user_id?: string; name?: string }) => {
  try {
    if (typeof window === 'undefined' || !window.clevertap) {
      console.warn('CleverTap not available for order tracking');
      return;
    }

    const eventPayload = {
      'Order ID': orderData.orderId,
      'Amount': orderData.amount,
      'Currency': orderData.currency || 'INR',
      'Items': orderData.items || [],
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    console.log('=== CLEVERTAP ORDER PLACED ===');
    console.log('Order data:', orderData);
    console.log('Event payload:', eventPayload);
    console.log('User info:', userInfo);
    
    window.clevertap.event.push('Order Placed', eventPayload);
    
    console.log('CleverTap order placed event sent successfully');
  } catch (error) {
    console.error('Error tracking CleverTap order:', error);
  }
};

export const trackServiceScheduled = (serviceData: {
  serviceName: string;
  serviceId: string;
  pickupDate: string;
  deliveryDate: string;
  amount?: number;
}, userInfo?: { user_id?: string; name?: string }) => {
  try {
    if (typeof window === 'undefined' || !window.clevertap) {
      console.warn('CleverTap not available for service tracking');
      return;
    }

    const eventPayload = {
      'Service Name': serviceData.serviceName,
      'Service ID': serviceData.serviceId,
      'Pickup Date': serviceData.pickupDate,
      'Delivery Date': serviceData.deliveryDate,
      'Amount': serviceData.amount,
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    console.log('=== CLEVERTAP SERVICE SCHEDULED ===');
    console.log('Service data:', serviceData);
    console.log('Event payload:', eventPayload);
    console.log('User info:', userInfo);
    
    window.clevertap.event.push('Service Scheduled', eventPayload);
    
    console.log('CleverTap service scheduled event sent successfully');
  } catch (error) {
    console.error('Error tracking CleverTap service:', error);
  }
};

// Export the clevertap object for backward compatibility
export default typeof window !== 'undefined' ? window.clevertap : null;
