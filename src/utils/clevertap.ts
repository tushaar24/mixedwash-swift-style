
import clevertap from 'clevertap-web-sdk';

// Initialize CleverTap with your project configuration
export const initCleverTap = () => {
  clevertap.init('589-KZZ-947', 'eu1');
  
  // Enable debugging in development
  if (import.meta.env.DEV) {
    clevertap.setDebugLevel(1);
  }
  
  console.log('CleverTap initialized successfully');
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
  
  clevertap.onUserLogin.push({
    Site: profileData
  });
  
  console.log('CleverTap profile set successfully');
};

// Get current user info for events
const getCurrentUserInfo = () => {
  // Try to get user info from CleverTap profile or return empty object
  return {};
};

// Event tracking methods with user info
export const trackEvent = (eventName: string, eventData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  const eventPayload = {
    ...eventData,
    ...(userInfo?.user_id && { user_id: userInfo.user_id }),
    ...(userInfo?.name && { customer_name: userInfo.name })
  };
  
  console.log('=== CLEVERTAP EVENT ===');
  console.log('Event name:', eventName);
  console.log('Event payload:', eventPayload);
  console.log('User info:', userInfo);
  
  clevertap.event.push(eventName, eventPayload);
  
  console.log('CleverTap event sent successfully');
};

// Page view tracking with user info
export const trackPageView = (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
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
};

// E-commerce events with user info
export const trackOrderPlaced = (orderData: {
  orderId: string;
  amount: number;
  currency?: string;
  items?: any[];
}, userInfo?: { user_id?: string; name?: string }) => {
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
};

export const trackServiceScheduled = (serviceData: {
  serviceName: string;
  serviceId: string;
  pickupDate: string;
  deliveryDate: string;
  amount?: number;
}, userInfo?: { user_id?: string; name?: string }) => {
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
};

export default clevertap;
