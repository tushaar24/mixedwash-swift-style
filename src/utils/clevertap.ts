
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

// Event tracking methods
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  clevertap.event.push(eventName, eventData);
};

// Page view tracking
export const trackPageView = (pageName: string, pageData?: Record<string, any>) => {
  clevertap.event.push('Page Viewed', {
    'Page Name': pageName,
    ...pageData
  });
};

// E-commerce events
export const trackOrderPlaced = (orderData: {
  orderId: string;
  amount: number;
  currency?: string;
  items?: any[];
}) => {
  clevertap.event.push('Order Placed', {
    'Order ID': orderData.orderId,
    'Amount': orderData.amount,
    'Currency': orderData.currency || 'INR',
    'Items': orderData.items || []
  });
};

export const trackServiceScheduled = (serviceData: {
  serviceName: string;
  serviceId: string;
  pickupDate: string;
  deliveryDate: string;
  amount?: number;
}) => {
  clevertap.event.push('Service Scheduled', {
    'Service Name': serviceData.serviceName,
    'Service ID': serviceData.serviceId,
    'Pickup Date': serviceData.pickupDate,
    'Delivery Date': serviceData.deliveryDate,
    'Amount': serviceData.amount
  });
};

export default clevertap;
