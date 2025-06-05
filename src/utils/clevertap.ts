
import clevertap from 'clevertap-web-sdk';

// Initialize CleverTap with your project configuration
export const initCleverTap = () => {
  try {
    clevertap.init('589-KZZ-947', 'eu1');
    
    // Wait for CleverTap to be ready
    clevertap.onUserLogin.push({});
    
    console.log('=== CLEVERTAP INITIALIZATION ===');
    console.log('CleverTap initialized successfully');
    console.log('CleverTap object:', clevertap);
    
    // Test if CleverTap is working by sending a test event
    setTimeout(() => {
      clevertap.event.push('SDK_Test', {
        'Test': true,
        'Timestamp': new Date().toISOString()
      });
      console.log('Test event sent to CleverTap');
    }, 1000);
    
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
    // Use the correct method for setting user profile
    clevertap.onUserLogin.push({
      Site: profileData
    });
    
    console.log('CleverTap profile set successfully');
  } catch (error) {
    console.error('Error setting CleverTap profile:', error);
  }
};

// Event tracking methods with user info
export const trackEvent = (eventName: string, eventData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
    const eventPayload = {
      ...eventData,
      ...(userInfo?.user_id && { user_id: userInfo.user_id }),
      ...(userInfo?.name && { customer_name: userInfo.name })
    };
    
    console.log('=== CLEVERTAP EVENT ===');
    console.log('Event name:', eventName);
    console.log('Event payload:', eventPayload);
    console.log('User info:', userInfo);
    console.log('CleverTap available:', !!clevertap);
    console.log('CleverTap event method available:', !!clevertap.event);
    
    // Send event to CleverTap
    clevertap.event.push(eventName, eventPayload);
    
    console.log('CleverTap event sent successfully');
    
    // Also log to verify the event was queued
    setTimeout(() => {
      console.log('CleverTap event queue status check completed');
    }, 500);
    
  } catch (error) {
    console.error('Error tracking CleverTap event:', error);
  }
};

// Page view tracking with user info
export const trackPageView = (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  try {
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
    
    clevertap.event.push('Page Viewed', eventPayload);
    
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
    
    clevertap.event.push('Order Placed', eventPayload);
    
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
    
    clevertap.event.push('Service Scheduled', eventPayload);
    
    console.log('CleverTap service scheduled event sent successfully');
  } catch (error) {
    console.error('Error tracking CleverTap service:', error);
  }
};

export default clevertap;
