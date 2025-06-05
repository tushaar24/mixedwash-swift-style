
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
  clevertap.onUserLogin.push({
    Site: profileData
  });
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
  
  clevertap.event.push(eventName, eventPayload);
};

// Page view tracking with user info
export const trackPageView = (pageName: string, pageData?: Record<string, any>, userInfo?: { user_id?: string; name?: string }) => {
  const eventPayload = {
    'Page Name': pageName,
    ...pageData,
    ...(userInfo?.user_id && { user_id: userInfo.user_id }),
    ...(userInfo?.name && { customer_name: userInfo.name })
  };
  
  clevertap.event.push('Page Viewed', eventPayload);
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
  
  clevertap.event.push('Order Placed', eventPayload);
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
  
  clevertap.event.push('Service Scheduled', eventPayload);
};

export default clevertap;
