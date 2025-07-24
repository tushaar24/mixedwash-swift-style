
// Declare CleverTap as a global variable
declare global {
  interface Window {
    clevertap: any;
    ctLoaded?: boolean;
  }
}

// Lazy initialization function - only loads when needed
const lazyInitCleverTap = (() => {
  let initPromise: Promise<boolean> | null = null;
  
  return () => {
    if (initPromise) return initPromise;
    
    initPromise = new Promise((resolve) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.clevertap && window.ctLoaded) {
        resolve(true);
        return;
      }
      
      // Wait for the script tag initialization
      const checkInterval = setInterval(() => {
        if (typeof window !== 'undefined' && window.clevertap && window.ctLoaded) {
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

// Initialize CleverTap - simplified version
export const initCleverTap = () => lazyInitCleverTap();

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

// Event tracking methods with user info - lazy loaded
export const trackEvent = async (eventName: string, eventData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    // Lazy initialize CleverTap first
    const isInitialized = await lazyInitCleverTap();
    if (!isInitialized || typeof window === 'undefined' || !window.clevertap) {
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

// Page view tracking with user info - lazy loaded
export const trackPageView = async (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const isInitialized = await lazyInitCleverTap();
    if (!isInitialized || typeof window === 'undefined' || !window.clevertap) {
      return;
    }

    const eventPayload = {
      'Page Name': pageName,
      ...pageData,
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    window.clevertap.event.push('Page Viewed', eventPayload);
    
  } catch (error) {
    console.error('Error tracking CleverTap page view:', error);
  }
};

// E-commerce events with user info - lazy loaded
export const trackOrderPlaced = async (orderData: {
  orderId: string;
  amount: number;
  currency?: string;
  items?: any[];
}, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const isInitialized = await lazyInitCleverTap();
    if (!isInitialized || typeof window === 'undefined' || !window.clevertap) {
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
    
    window.clevertap.event.push('Order Placed', eventPayload);
    
  } catch (error) {
    console.error('Error tracking CleverTap order:', error);
  }
};

export const trackServiceScheduled = async (serviceData: {
  serviceName: string;
  serviceId: string;
  pickupDate: string;
  deliveryDate: string;
  amount?: number;
}, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const isInitialized = await lazyInitCleverTap();
    if (!isInitialized || typeof window === 'undefined' || !window.clevertap) {
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
    
    window.clevertap.event.push('Service Scheduled', eventPayload);
    
  } catch (error) {
    console.error('Error tracking CleverTap service:', error);
  }
};

// Export the clevertap object for backward compatibility
export default typeof window !== 'undefined' ? window.clevertap : null;
