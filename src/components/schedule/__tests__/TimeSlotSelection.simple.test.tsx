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

describe('TimeSlotSelection - Basic Functionality', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  
  const mockUpdateOrderData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const defaultOrderData = {
    services: [{ id: '1', name: 'Wash & Fold', price: 20 }],
    addressId: 'addr-1',
    pickupDate: null,
    pickupSlotId: null,
    pickupSlotLabel: null,
    deliveryDate: null,
    deliverySlotId: null,
    deliverySlotLabel: null,
    specialInstructions: '',
    dryCleaningItems: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', async () => {
    render(
      <TimeSlotSelection
        orderData={defaultOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    // Should show loading initially
    expect(screen.getByText('Loading available time slots...')).toBeInTheDocument();

    // Wait for slots to load
    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });
  });

  it('should sync default dates to orderData when null', async () => {
    render(
      <TimeSlotSelection
        orderData={defaultOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    // Should call updateOrderData to sync default dates
    expect(mockUpdateOrderData).toHaveBeenCalledWith(
      expect.objectContaining({
        pickupDate: expect.any(Date),
        deliveryDate: expect.any(Date)
      })
    );
  });

  it('should show time slots after loading', async () => {
    render(
      <TimeSlotSelection
        orderData={{ ...defaultOrderData, pickupDate: today }}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('11:00 AM - 1:00 PM')).toBeInTheDocument();
    });
  });

  it('should disable continue button when data is incomplete', async () => {
    render(
      <TimeSlotSelection
        orderData={defaultOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    const continueButton = screen.getByText('Continue to Confirm');
    expect(continueButton).toBeDisabled();
  });

  it('should enable continue button when all data is present', async () => {
    const completeOrderData = {
      ...defaultOrderData,
      pickupDate: today,
      pickupSlotId: '1',
      pickupSlotLabel: '9:00 AM - 11:00 AM',
      deliveryDate: tomorrow,
      deliverySlotId: '1',
      deliverySlotLabel: '9:00 AM - 11:00 AM'
    };

    render(
      <TimeSlotSelection
        orderData={completeOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    const continueButton = screen.getByText('Continue to Confirm');
    expect(continueButton).not.toBeDisabled();
  });

  it('should call onNext when continue button is clicked with valid data', async () => {
    const completeOrderData = {
      ...defaultOrderData,
      pickupDate: today,
      pickupSlotId: '1',
      pickupSlotLabel: '9:00 AM - 11:00 AM',
      deliveryDate: tomorrow,
      deliverySlotId: '1',
      deliverySlotLabel: '9:00 AM - 11:00 AM'
    };

    render(
      <TimeSlotSelection
        orderData={completeOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    const continueButton = screen.getByText('Continue to Confirm');
    fireEvent.click(continueButton);

    expect(mockOnNext).toHaveBeenCalled();
  });

  it('should call onBack when back button is clicked', async () => {
    render(
      <TimeSlotSelection
        orderData={defaultOrderData}
        updateOrderData={mockUpdateOrderData}
        onNext={mockOnNext}
        onBack={mockOnBack}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back');
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
});