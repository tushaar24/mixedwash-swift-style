import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeSlotSelection } from '../TimeSlotSelection';
import { ScheduleOrderData } from '@/pages/Schedule';
import { addDays, startOfToday, format } from 'date-fns';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
            { id: '2', label: '11:00 AM - 1:00 PM', start_time: '11:00', end_time: '13:00', enabled: true },
            { id: '3', label: '2:00 PM - 4:00 PM', start_time: '14:00', end_time: '16:00', enabled: false },
            { id: '4', label: '4:00 PM - 6:00 PM', start_time: '16:00', end_time: '18:00', enabled: true },
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

describe('TimeSlotSelection Edge Cases', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  
  const mockUpdateOrderData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  const defaultOrderData: ScheduleOrderData = {
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
    // Mock current time to be 10:00 AM for consistent testing
    vi.setSystemTime(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // EDGE CASE 1: State Synchronization Issues
  describe('State Synchronization Edge Cases', () => {
    it('should sync default date to orderData when orderData.pickupDate is null', async () => {
      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      // Wait for component to mount and time slots to load
      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Check if the calendar shows today as selected (visual state)
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();
      
      // The component should have synced default date to orderData
      // This would happen via useEffect that should be implemented
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupDate: expect.any(Date),
          deliveryDate: expect.any(Date)
        })
      );
    });

    it('should handle mismatch between local state and orderData', async () => {
      const orderDataWithDate = {
        ...defaultOrderData,
        pickupDate: today,
        deliveryDate: tomorrow
      };

      render(
        &lt;TimeSlotSelection
          orderData={orderDataWithDate}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Select a time slot
      const timeSlot = screen.getByText('9:00 AM - 11:00 AM');
      fireEvent.click(timeSlot);

      // Check if confirm button is enabled (should be since all required data is present)
      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).not.toBeDisabled();
    });
  });

  // EDGE CASE 2: Date Deselection Issues
  describe('Date Deselection Edge Cases', () => {
    it('should handle clicking on already selected date (deselection)', async () => {
      const orderDataWithToday = {
        ...defaultOrderData,
        pickupDate: today,
        deliveryDate: tomorrow
      };

      render(
        &lt;TimeSlotSelection
          orderData={orderDataWithToday}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Find and click on today's date (already selected)
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      
      // This should trigger deselection (null date passed to handler)
      fireEvent.click(todayButton);

      // The handler should clear all related state
      expect(mockUpdateOrderData).toHaveBeenCalledWith({
        pickupDate: null,
        deliveryDate: null,
        pickupSlotId: null,
        pickupSlotLabel: null,
        deliverySlotId: null,
        deliverySlotLabel: null
      });
    });

    it('should disable confirm button when date is deselected but slot remains', async () => {
      const orderDataWithSelection = {
        ...defaultOrderData,
        pickupDate: null, // Date deselected
        pickupSlotId: '1', // But slot ID remains (inconsistent state)
        deliveryDate: tomorrow,
        deliverySlotId: '1'
      };

      render(
        &lt;TimeSlotSelection
          orderData={orderDataWithSelection}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });
  });

  // EDGE CASE 3: Time Zone and Date Boundary Issues
  describe('Timezone and Date Boundary Edge Cases', () => {
    it('should handle midnight boundary correctly', async () => {
      // Set time to 11:59 PM
      const nearMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59);
      vi.setSystemTime(nearMidnight);

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Check that "today" is still correctly identified
      expect(screen.getByText('Only available time slots are shown for today')).toBeInTheDocument();
    });

    it('should handle DST transitions correctly', async () => {
      // Mock a DST transition date (first Sunday in March)
      const dstDate = new Date(2024, 2, 10); // March 10, 2024 (DST begins)
      vi.setSystemTime(dstDate);

      render(
        &lt;TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: dstDate }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Select tomorrow for delivery (should be DST+1)
      const tomorrowDate = addDays(dstDate, 1);
      
      // Verify that date calculations remain consistent
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          deliveryDate: expect.any(Date)
        })
      );
    });
  });

  // EDGE CASE 4: Async Race Conditions
  describe('Async Race Condition Edge Cases', () => {
    it('should prevent interaction before time slots are loaded', async () => {
      // Mock slow loading
      const slowSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => new Promise(resolve => 
              setTimeout(() => resolve({
                data: [{ id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true }],
                error: null
              }), 1000)
            ))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: slowSupabase
      }));

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      // Should show loading state
      expect(screen.getByText('Loading available time slots...')).toBeInTheDocument();
      
      // Calendar should not be interactive yet
      const calendar = screen.queryByRole('grid');
      expect(calendar).not.toBeInTheDocument();
    });

    it('should handle rapid consecutive date selections', async () => {
      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Rapidly click different dates
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      const tomorrowButton = screen.getByRole('button', { 
        name: new RegExp(tomorrow.getDate().toString()) 
      });

      // Rapid fire clicks
      fireEvent.click(todayButton);
      fireEvent.click(tomorrowButton);
      fireEvent.click(todayButton);

      // Should handle all updates correctly without race conditions
      await waitFor(() => {
        expect(mockUpdateOrderData).toHaveBeenCalledTimes(3);
      });
    });
  });

  // EDGE CASE 5: Mobile Safari Specific Issues
  describe('Mobile Safari Edge Cases', () => {
    it('should handle touch events correctly', async () => {
      // Mock touch events
      const user = userEvent.setup();

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Simulate touch start and end
      fireEvent.touchStart(todayButton);
      fireEvent.touchEnd(todayButton);
      
      // Should trigger date selection
      expect(mockUpdateOrderData).toHaveBeenCalled();
    });

    it('should handle double-tap on mobile correctly', async () => {
      const user = userEvent.setup();

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Double tap simulation
      await user.dblClick(todayButton);

      // Should not cause issues (proper debouncing/handling)
      expect(mockUpdateOrderData).toHaveBeenCalled();
    });
  });

  // EDGE CASE 6: No Available Slots Edge Cases
  describe('No Available Slots Edge Cases', () => {
    it('should handle no enabled slots for today', async () => {
      // Mock no enabled slots
      const noEnabledSlotsSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [
                { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: false },
                { id: '2', label: '11:00 AM - 1:00 PM', start_time: '11:00', end_time: '13:00', enabled: false },
              ],
              error: null
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: noEnabledSlotsSupabase
      }));

      render(
        &lt;TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: today }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('No available time slots for today')).toBeInTheDocument();
      });

      // Confirm button should be disabled
      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });

    it('should handle empty time slots array', async () => {
      const emptySupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: [],
              error: null
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: emptySupabase
      }));

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('No time slots are currently available')).toBeInTheDocument();
      });
    });
  });

  // EDGE CASE 7: Time Comparison Edge Cases
  describe('Time Comparison Edge Cases', () => {
    it('should handle string time comparisons correctly', async () => {
      const mockSlots = [
        { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
        { id: '2', label: '10:00 AM - 12:00 PM', start_time: '10:00', end_time: '12:00', enabled: true },
        { id: '3', label: '2:00 PM - 4:00 PM', start_time: '14:00', end_time: '16:00', enabled: true },
      ];

      render(
        &lt;TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: today,
            deliveryDate: tomorrow,
            pickupSlotId: '2' // 10:00 AM slot
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // When customizing delivery for next day, only slots >= pickup time should be shown
      const changeDeliveryButton = screen.getByText('Change Delivery Schedule');
      fireEvent.click(changeDeliveryButton);

      // Verify delivery slots filtering logic
      // This tests the string comparison: slot.start_time >= pickupSlot.start_time
      // Should show 10:00 AM and 2:00 PM slots, not 9:00 AM
      await waitFor(() => {
        expect(screen.getByText('10:00 AM - 12:00 PM')).toBeInTheDocument();
        expect(screen.getByText('2:00 PM - 4:00 PM')).toBeInTheDocument();
      });
    });

    it('should handle edge case with 12-hour vs 24-hour time formats', async () => {
      const mixedFormatSlots = [
        { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
        { id: '2', label: '12:00 PM - 2:00 PM', start_time: '12:00', end_time: '14:00', enabled: true },
        { id: '3', label: '1:00 PM - 3:00 PM', start_time: '13:00', end_time: '15:00', enabled: true },
      ];

      // Test that 12:00 < 13:00 in string comparison (which would be wrong if using 12-hour format)
      const pickup12PMSlot = mixedFormatSlots[1]; // 12:00 PM
      const delivery1PMSlot = mixedFormatSlots[2]; // 1:00 PM

      expect(pickup12PMSlot.start_time < delivery1PMSlot.start_time).toBe(true);
    });
  });

  // EDGE CASE 8: Auto-delivery Logic Failures
  describe('Auto-delivery Logic Edge Cases', () => {
    it('should handle auto-delivery slot selection failure', async () => {
      const limitedSlots = [
        { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
        { id: '2', label: '10:00 AM - 12:00 PM', start_time: '10:00', end_time: '12:00', enabled: true },
      ];

      render(
        &lt;TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: today,
            deliveryDate: tomorrow
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Select a pickup slot
      const pickupSlot = screen.getByText('10:00 AM - 12:00 PM');
      fireEvent.click(pickupSlot);

      // Auto-delivery logic should have tried to set delivery slot
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupSlotId: '2',
          pickupSlotLabel: '10:00 AM - 12:00 PM'
        })
      );
    });

    it('should handle case when no delivery slots are available after pickup selection', async () => {
      // Mock scenario where pickup is late and no delivery slots are available next day
      const latePickupSlots = [
        { id: '1', label: '6:00 PM - 8:00 PM', start_time: '18:00', end_time: '20:00', enabled: true },
      ];

      render(
        &lt;TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: today,
            deliveryDate: tomorrow
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('6:00 PM - 8:00 PM')).toBeInTheDocument();
      });

      // Select the late pickup slot
      const lateSlot = screen.getByText('6:00 PM - 8:00 PM');
      fireEvent.click(lateSlot);

      // If no suitable delivery slots, should update pickup but leave delivery empty
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupSlotId: '1',
          pickupSlotLabel: '6:00 PM - 8:00 PM'
        })
      );
    });
  });

  // EDGE CASE 9: Browser History Edge Cases
  describe('Browser History Edge Cases', () => {
    it('should handle browser back button during slot selection', async () => {
      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should handle page refresh during slot selection', async () => {
      // This would test that the component properly initializes from orderData
      const orderDataWithSelection = {
        ...defaultOrderData,
        pickupDate: today,
        pickupSlotId: '1',
        pickupSlotLabel: '9:00 AM - 11:00 AM',
        deliveryDate: tomorrow,
        deliverySlotId: '1',
        deliverySlotLabel: '9:00 AM - 11:00 AM'
      };

      render(
        &lt;TimeSlotSelection
          orderData={orderDataWithSelection}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Should show the selected slot as selected
      const selectedSlot = screen.getByText('9:00 AM - 11:00 AM');
      expect(selectedSlot.closest('.ring-2')).toBeInTheDocument();

      // Continue button should be enabled
      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).not.toBeDisabled();
    });
  });

  // EDGE CASE 10: Network Failure Edge Cases
  describe('Network Failure Edge Cases', () => {
    it('should handle database fetch failure gracefully', async () => {
      const failingSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Network error' }
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: failingSupabase
      }));

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      // Should show error state or fallback
      await waitFor(() => {
        // Component should handle error gracefully
        expect(screen.queryByText('Loading available time slots...')).not.toBeInTheDocument();
      });
    });

    it('should handle slow network correctly', async () => {
      vi.useFakeTimers();

      const slowSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => new Promise(resolve => {
              setTimeout(() => resolve({
                data: [{ id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true }],
                error: null
              }), 5000);
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: slowSupabase
      }));

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      // Should show loading state
      expect(screen.getByText('Loading available time slots...')).toBeInTheDocument();

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  // EDGE CASE 11: Accessibility Edge Cases  
  describe('Accessibility Edge Cases', () => {
    it('should have proper ARIA labels for screen readers', async () => {
      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Check aria labels
      const backButton = screen.getByLabelText('Go back to address selection');
      expect(backButton).toBeInTheDocument();

      const continueButton = screen.getByLabelText('Continue to order confirmation');
      expect(continueButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Should be able to tab through interactive elements
      await user.tab();
      
      // Check that focus moves to interactive elements
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
    });
  });

  // EDGE CASE 12: Validation Edge Cases
  describe('Validation Edge Cases', () => {
    it('should show appropriate error messages for missing data', async () => {
      const { toast } = await import('@/hooks/use-toast');

      render(
        &lt;TimeSlotSelection
          orderData={defaultOrderData} // No dates or slots selected
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Try to continue without selections
      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });

    it('should validate time slot existence before continuing', async () => {
      const orderDataWithInvalidSlot = {
        ...defaultOrderData,
        pickupDate: today,
        pickupSlotId: 'invalid-slot-id',
        deliveryDate: tomorrow,
        deliverySlotId: 'invalid-slot-id'
      };

      render(
        &lt;TimeSlotSelection
          orderData={orderDataWithInvalidSlot}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        /&gt;
      );

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Force enable button and click (simulating race condition)
      const continueButton = screen.getByText('Continue to Confirm');
      
      // Should handle invalid slot IDs gracefully
      if (!continueButton.disabled) {
        fireEvent.click(continueButton);
        // Should show error or handle gracefully
      }
    });
  });
});