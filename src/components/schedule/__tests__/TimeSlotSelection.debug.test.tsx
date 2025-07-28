import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TimeSlotSelection } from '../TimeSlotSelection';
import { startOfToday, addDays } from 'date-fns';

// Mock all dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
            { id: '2', label: '11:00 AM - 1:00 PM', start_time: '11:00', end_time: '13:00', enabled: true },
          ],
          error: null
        }))
      }))
    }))
  }
}));

vi.mock('@/utils/clevertap', () => ({
  trackEvent: vi.fn()
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    session: null,
    user: { id: 'test-user', user_metadata: { full_name: 'Test User' } },
    profile: { mobile_number: '123456789' },
    isLoading: false,
    isFirstLogin: false,
    isProfileChecked: true,
    isProfileComplete: true,
    refreshProfile: vi.fn(),
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

describe('TimeSlotSelection - Debug', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  
  const mockUpdateOrderData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should debug the rendering process', async () => {
    const orderDataWithDate = {
      services: [{ id: '1', name: 'Wash & Fold', price: 20 }],
      addressId: 'addr-1',
      pickupDate: today,
      pickupSlotId: null,
      pickupSlotLabel: null,
      deliveryDate: tomorrow,
      deliverySlotId: null,
      deliverySlotLabel: null,
      specialInstructions: '',
      dryCleaningItems: []
    };

    render(
      <TimeSlotSelection
        orderData={orderDataWithDate}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Should show loading initially
    expect(screen.getByText('Loading available time slots...')).toBeInTheDocument();

    // Wait for component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading available time slots...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Log the current HTML to see what's rendered
    console.log('Current DOM:', document.body.innerHTML);

    // Check if time slots section exists
    const pickupTimeSection = screen.queryByText('Select Pickup Time');
    console.log('Pickup time section:', pickupTimeSection);

    // Check for specific text that should exist
    const scheduleTitle = screen.getByText('Schedule Pickup & Delivery');
    expect(scheduleTitle).toBeInTheDocument();

    // Try to find any text containing "AM"
    const amTexts = screen.queryAllByText(/AM/);
    console.log('Found AM texts:', amTexts.map(el => el.textContent));

    // Wait a bit more and check again
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const amTextsAfterWait = screen.queryAllByText(/AM/);
    console.log('Found AM texts after wait:', amTextsAfterWait.map(el => el.textContent));
  });
});