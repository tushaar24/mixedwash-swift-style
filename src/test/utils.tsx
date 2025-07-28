import { ReactElement, createContext } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { addDays, startOfToday } from 'date-fns';

// Mock auth context
const MockAuthContext = createContext({
  session: null,
  user: { 
    id: 'test-user', 
    user_metadata: { full_name: 'Test User' },
    email: 'test@example.com'
  },
  profile: { 
    mobile_number: '123456789',
    username: 'testuser'
  },
  isLoading: false,
  isFirstLogin: false,
  isProfileChecked: true,
  isProfileComplete: true,
  refreshProfile: vi.fn(),
});

export const mockAuthContext = {
  session: null,
  user: { 
    id: 'test-user', 
    user_metadata: { full_name: 'Test User' },
    email: 'test@example.com'
  },
  profile: { 
    mobile_number: '123456789',
    username: 'testuser'
  },
  isLoading: false,
  isFirstLogin: false,
  isProfileChecked: true,
  isProfileComplete: true,
  refreshProfile: vi.fn(),
};

// Mock time slots data
export const mockTimeSlots = [
  { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
  { id: '2', label: '11:00 AM - 1:00 PM', start_time: '11:00', end_time: '13:00', enabled: true },
  { id: '3', label: '2:00 PM - 4:00 PM', start_time: '14:00', end_time: '16:00', enabled: false },
  { id: '4', label: '4:00 PM - 6:00 PM', start_time: '16:00', end_time: '18:00', enabled: true },
];

// Mock services data
export const mockServices = [
  { id: '1', name: 'Wash & Fold', price: 20 },
  { id: '2', name: 'Dry Cleaning', price: 15 },
  { id: '3', name: 'Premium Wash', price: 30 },
];

// Test dates
export const testDates = {
  today: startOfToday(),
  tomorrow: addDays(startOfToday(), 1),
  yesterday: addDays(startOfToday(), -1),
  nextWeek: addDays(startOfToday(), 7),
};

// Default order data for testing
export const defaultOrderData = {
  services: [],
  addressId: null,
  pickupDate: null,
  pickupSlotId: null,
  pickupSlotLabel: null,
  deliveryDate: null,
  deliverySlotId: null,
  deliverySlotLabel: null,
  specialInstructions: '',
  dryCleaningItems: []
};

// Complete order data for testing
export const completeOrderData = {
  services: [mockServices[0]],
  addressId: 'addr-1',
  pickupDate: testDates.today,
  pickupSlotId: '1',
  pickupSlotLabel: '9:00 AM - 11:00 AM',
  deliveryDate: testDates.tomorrow,
  deliverySlotId: '1',
  deliverySlotLabel: '9:00 AM - 11:00 AM',
  specialInstructions: '',
  dryCleaningItems: []
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MockAuthContext.Provider value={mockAuthContext}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </MockAuthContext.Provider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock Supabase responses
export const mockSupabaseResponses = {
  success: (data: any) => ({
    data,
    error: null
  }),
  error: (message: string) => ({
    data: null,
    error: { message }
  }),
  loading: () => new Promise(() => {}), // Never resolves (for loading tests)
};

// Helper to create mock date at specific time
export const createMockDate = (year: number, month: number, day: number, hour = 10, minute = 0) => {
  return new Date(year, month - 1, day, hour, minute); // month is 0-indexed
};

// Helper to simulate timezone
export const mockTimezone = (offsetMinutes: number) => {
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = vi.fn().mockReturnValue(offsetMinutes);
  
  return () => {
    Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;
  };
};

// Helper to simulate slow network
export const createSlowPromise = <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Helper to simulate failed network
export const createFailedPromise = (error: string, delay = 100): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(error)), delay);
  });
};

// Helper to create mock touch events
export const createTouchEvent = (type: string, element: Element) => {
  const touchEvent = new TouchEvent(type, {
    touches: [{
      identifier: 0,
      target: element,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      screenX: 0,
      screenY: 0,
      radiusX: 0,
      radiusY: 0,
      rotationAngle: 0,
      force: 1,
    }] as any,
    bubbles: true,
    cancelable: true,
  });
  
  return touchEvent;
};

// Helper to mock high contrast mode
export const mockHighContrastMode = (enabled = true) => {
  const mockMatchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-contrast: high)' ? enabled : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  return mockMatchMedia;
};

// Helper to mock reduced motion
export const mockReducedMotion = (enabled = true) => {
  const mockMatchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? enabled : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });

  return mockMatchMedia;
};

// Helper to wait for next tick
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

// Helper to create mock rect for element bounds
export const mockElementBounds = (element: Element, bounds: Partial<DOMRect>) => {
  const defaultBounds: DOMRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: vi.fn(),
  };

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    ...defaultBounds,
    ...bounds,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };