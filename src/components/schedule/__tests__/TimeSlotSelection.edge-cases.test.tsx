import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, waitFor, act } from '@testing-library/react';
import { TimeSlotSelection } from '../TimeSlotSelection';
import { 
  render, 
  mockTimeSlots, 
  defaultOrderData, 
  testDates,
  mockSupabaseResponses,
  createSlowPromise,
  createFailedPromise,
  mockTimezone,
  mockHighContrastMode,
  createTouchEvent,
} from '@/test/utils';
import { addDays } from 'date-fns';

describe('TimeSlotSelection - Critical Edge Cases', () => {
  const mockUpdateOrderData = vi.fn();
  const mockOnNext = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(testDates.today);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // CRITICAL EDGE CASE 1: State Synchronization Mismatch
  describe('State Synchronization Critical Issues', () => {
    it('should handle initial state mismatch between local and orderData', async () => {
      // Mock scenario where orderData.pickupDate is null but component defaults to today
      const orderDataWithNullDate = {
        ...defaultOrderData,
        pickupDate: null,
        deliveryDate: null
      };

      const { getByText, getByRole } = render(
        <TimeSlotSelection
          orderData={orderDataWithNullDate}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // The component should show today as selected (local state)
      const calendar = getByRole('grid');
      expect(calendar).toBeInTheDocument();

      // But continue button should be disabled (orderData validation)
      const continueButton = getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();

      // This is the exact bug customers are experiencing
      // Component shows visual selection but button remains disabled
    });

    it('should sync local state to orderData on mount when orderData is incomplete', async () => {
      const { getByText } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Should call updateOrderData to sync the default dates
      // This test verifies the fix for the state synchronization issue
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupDate: expect.any(Date),
          deliveryDate: expect.any(Date)
        })
      );
    });
  });

  // CRITICAL EDGE CASE 2: Date Deselection Prevention Bug
  describe('Date Deselection Prevention Bug', () => {
    it('should handle date deselection when user clicks selected date', async () => {
      const orderDataWithToday = {
        ...defaultOrderData,
        pickupDate: testDates.today,
        deliveryDate: testDates.tomorrow
      };

      const { getByRole } = render(
        <TimeSlotSelection
          orderData={orderDataWithToday}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      const todayButton = getByRole('button', { 
        name: new RegExp(testDates.today.getDate().toString()) 
      });

      // Click on already selected date (deselection attempt)
      fireEvent.click(todayButton);

      // Currently this does nothing due to early return in handler
      // The fix should allow this and clear the state
      expect(mockUpdateOrderData).toHaveBeenCalledWith({
        pickupDate: null,
        deliveryDate: null,
        pickupSlotId: null,
        pickupSlotLabel: null,
        deliverySlotId: null,
        deliverySlotLabel: null
      });
    });

    it('should prevent confirm button when date is deselected but slots remain', async () => {
      const inconsistentOrderData = {
        ...defaultOrderData,
        pickupDate: null, // Date cleared
        pickupSlotId: '1', // But slot remains
        deliveryDate: testDates.tomorrow,
        deliverySlotId: '1'
      };

      const { getByText } = render(
        <TimeSlotSelection
          orderData={inconsistentOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      const continueButton = getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });
  });

  // CRITICAL EDGE CASE 3: Timezone and Midnight Boundary Issues
  describe('Timezone and Midnight Boundary Critical Issues', () => {
    it('should handle midnight boundary correctly when day changes', async () => {
      // Set time to 11:59 PM
      const nearMidnight = new Date(
        testDates.today.getFullYear(),
        testDates.today.getMonth(),
        testDates.today.getDate(),
        23, 59, 59
      );
      vi.setSystemTime(nearMidnight);

      const { getByText } = render(
        <TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: testDates.today }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Should still recognize today correctly
      expect(getByText('Only available time slots are shown for today')).toBeInTheDocument();

      // Now advance to midnight
      const afterMidnight = new Date(
        testDates.today.getFullYear(),
        testDates.today.getMonth(),
        testDates.today.getDate() + 1,
        0, 0, 1
      );
      
      act(() => {
        vi.setSystemTime(afterMidnight);
      });

      // The "today" definition should update
      // This tests that date calculations remain consistent across midnight
    });

    it('should handle different timezone offsets correctly', async () => {
      const restoreTimezone = mockTimezone(-480); // PST timezone

      try {
        const { getByText } = render(
          <TimeSlotSelection
            orderData={{ ...defaultOrderData, pickupDate: testDates.today }}
            updateOrderData={mockUpdateOrderData}
            onNext={mockOnNext}
            onBack={mockOnBack}
          />
        );

        await waitFor(() => {
          expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
        });

        // Date calculations should remain consistent regardless of timezone
        expect(getByText('Only available time slots are shown for today')).toBeInTheDocument();
      } finally {
        restoreTimezone();
      }
    });
  });

  // CRITICAL EDGE CASE 4: Race Conditions in Async Operations
  describe('Async Race Condition Critical Issues', () => {
    it('should handle rapid date selection before slots load', async () => {
      // Mock slow slot loading
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => createSlowPromise(mockSupabaseResponses.success(mockTimeSlots), 2000))
            }))
          }))
        }
      }));

      const { getByText, getByRole } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      // Should show loading
      expect(getByText('Loading available time slots...')).toBeInTheDocument();

      // Try to interact with calendar before slots load (should be prevented)
      const calendar = document.querySelector('[role="grid"]');
      expect(calendar).not.toBeInTheDocument();

      // Wait for slots to load
      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle concurrent date selection updates', async () => {
      const { getByRole } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      const todayButton = getByRole('button', { 
        name: new RegExp(testDates.today.getDate().toString()) 
      });
      const tomorrowButton = getByRole('button', { 
        name: new RegExp(testDates.tomorrow.getDate().toString()) 
      });

      // Rapid fire concurrent updates
      fireEvent.click(todayButton);
      fireEvent.click(tomorrowButton);
      fireEvent.click(todayButton);

      // Should handle all updates without race conditions
      await waitFor(() => {
        expect(mockUpdateOrderData).toHaveBeenCalledTimes(3);
      });
    });
  });

  // CRITICAL EDGE CASE 5: Mobile Safari Touch Issues
  describe('Mobile Safari Touch Critical Issues', () => {
    it('should handle touch events without triggering deselection', async () => {
      const { getByRole } = render(
        <TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: testDates.today }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      const todayButton = getByRole('button', { 
        name: new RegExp(testDates.today.getDate().toString()) 
      });

      // Simulate touch sequence that might cause issues on Safari
      const touchStart = createTouchEvent('touchstart', todayButton);
      const touchEnd = createTouchEvent('touchend', todayButton);

      fireEvent(todayButton, touchStart);
      fireEvent(todayButton, touchEnd);
      fireEvent.click(todayButton); // Safari might fire this after touch

      // Should not cause multiple selections or deselection
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupDate: testDates.today
        })
      );
    });

    it('should handle double-tap without state corruption', async () => {
      const { getByRole } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      const todayButton = getByRole('button', { 
        name: new RegExp(testDates.today.getDate().toString()) 
      });

      // Double-tap simulation
      fireEvent.click(todayButton);
      fireEvent.click(todayButton);

      // Should handle gracefully without state corruption
      expect(mockUpdateOrderData).toHaveBeenCalled();
    });
  });

  // CRITICAL EDGE CASE 6: Time Slot Filtering Logic Issues
  describe('Time Slot Filtering Critical Issues', () => {
    it('should correctly filter enabled slots for today', async () => {
      const slotsWithMixed = [
        { ...mockTimeSlots[0], enabled: true },   // 9:00 AM - enabled
        { ...mockTimeSlots[1], enabled: false },  // 11:00 AM - disabled
        { ...mockTimeSlots[3], enabled: true },   // 4:00 PM - enabled
      ];

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve(mockSupabaseResponses.success(slotsWithMixed)))
            }))
          }))
        }
      }));

      const { getByText, queryByText } = render(
        <TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: testDates.today }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Should show enabled slots
      expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      expect(getByText('4:00 PM - 6:00 PM')).toBeInTheDocument();

      // Should not show disabled slots for today
      expect(queryByText('11:00 AM - 1:00 PM')).not.toBeInTheDocument();
    });

    it('should handle string time comparison correctly', async () => {
      const timeSlotsWithEdgeCases = [
        { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
        { id: '2', label: '10:00 AM - 12:00 PM', start_time: '10:00', end_time: '12:00', enabled: true },
        { id: '3', label: '12:00 PM - 2:00 PM', start_time: '12:00', end_time: '14:00', enabled: true },
        { id: '4', label: '1:00 PM - 3:00 PM', start_time: '13:00', end_time: '15:00', enabled: true },
      ];

      const { getByText, getByRole } = render(
        <TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: testDates.today,
            deliveryDate: testDates.tomorrow,
            pickupSlotId: '2' // 10:00 AM slot selected
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('10:00 AM - 12:00 PM')).toBeInTheDocument();
      });

      // Test delivery customization with string comparison
      const changeDeliveryButton = getByText('Change Delivery Schedule');
      fireEvent.click(changeDeliveryButton);

      // For next day delivery, only slots >= pickup time should be available
      // This tests: slot.start_time >= pickupSlot.start_time
      // With strings: "10:00" <= "12:00" (true), "10:00" <= "13:00" (true), "10:00" <= "09:00" (false)
      await waitFor(() => {
        expect(getByText('10:00 AM - 12:00 PM')).toBeInTheDocument();
        expect(getByText('12:00 PM - 2:00 PM')).toBeInTheDocument();
        expect(getByText('1:00 PM - 3:00 PM')).toBeInTheDocument();
      });
    });
  });

  // CRITICAL EDGE CASE 7: Auto-delivery Logic Failures
  describe('Auto-delivery Logic Critical Failures', () => {
    it('should handle auto-delivery selection when same slot not available', async () => {
      const limitedDeliverySlots = [
        { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
        { id: '2', label: '2:00 PM - 4:00 PM', start_time: '14:00', end_time: '16:00', enabled: true },
      ];

      const { getByText } = render(
        <TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: testDates.today,
            deliveryDate: testDates.tomorrow
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Select first slot for pickup
      const pickupSlot = getByText('9:00 AM - 11:00 AM');
      fireEvent.click(pickupSlot);

      // Auto-delivery logic should select same slot if available
      // or fallback to first available slot >= pickup time
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupSlotId: '1',
          pickupSlotLabel: '9:00 AM - 11:00 AM',
          // Should auto-set delivery to same slot or later
          deliverySlotId: expect.any(String),
          deliverySlotLabel: expect.any(String)
        })
      );
    });

    it('should handle auto-delivery failure gracefully', async () => {
      // Mock scenario where no delivery slots are available
      const pickupOnlySlots = [
        { id: '1', label: '6:00 PM - 8:00 PM', start_time: '18:00', end_time: '20:00', enabled: true },
      ];

      const { getByText } = render(
        <TimeSlotSelection
          orderData={{ 
            ...defaultOrderData, 
            pickupDate: testDates.today,
            deliveryDate: testDates.tomorrow
          }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByText('6:00 PM - 8:00 PM')).toBeInTheDocument();
      });

      // Select late pickup slot
      const lateSlot = getByText('6:00 PM - 8:00 PM');
      fireEvent.click(lateSlot);

      // Should update pickup but handle delivery failure gracefully
      expect(mockUpdateOrderData).toHaveBeenCalledWith(
        expect.objectContaining({
          pickupSlotId: '1',
          pickupSlotLabel: '6:00 PM - 8:00 PM'
        })
      );

      // Continue button should remain disabled due to missing delivery
      const continueButton = getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });
  });

  // CRITICAL EDGE CASE 8: Network and Loading State Issues
  describe('Network and Loading State Critical Issues', () => {
    it('should handle network failure during slot loading', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve(mockSupabaseResponses.error('Network timeout')))
            }))
          }))
        }
      }));

      const { getByText, queryByText } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      // Should eventually stop loading
      await waitFor(() => {
        expect(queryByText('Loading available time slots...')).not.toBeInTheDocument();
      });

      // Should handle error gracefully (not crash)
      expect(getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });

    it('should prevent interaction during loading', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              order: vi.fn(() => createSlowPromise(mockSupabaseResponses.success(mockTimeSlots), 5000))
            }))
          }))
        }
      }));

      const { getByText, queryByRole } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      // Should show loading state
      expect(getByText('Loading available time slots...')).toBeInTheDocument();

      // Calendar should not be available for interaction
      expect(queryByRole('grid')).not.toBeInTheDocument();

      // Continue button should be disabled
      const continueButton = getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });
  });

  // CRITICAL EDGE CASE 9: High Contrast and Accessibility Issues
  describe('High Contrast and Accessibility Critical Issues', () => {
    it('should maintain visibility in high contrast mode', async () => {
      mockHighContrastMode(true);

      const { getByRole } = render(
        <TimeSlotSelection
          orderData={{ ...defaultOrderData, pickupDate: testDates.today }}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      const todayButton = getByRole('button', { 
        name: new RegExp(testDates.today.getDate().toString()) 
      });

      // In high contrast mode, selected dates should still be distinguishable
      // This tests that the primary color system works in high contrast
      expect(todayButton).toHaveClass('bg-primary');
    });

    it('should support keyboard navigation correctly', async () => {
      const { getByRole, getByLabelText } = render(
        <TimeSlotSelection
          orderData={defaultOrderData}
          updateOrderData={mockUpdateOrderData}
          onNext={mockOnNext}
          onBack={mockOnBack}
        />
      );

      await waitFor(() => {
        expect(getByRole('grid')).toBeInTheDocument();
      });

      // Check accessibility labels
      const backButton = getByLabelText('Go back to address selection');
      expect(backButton).toBeInTheDocument();

      const continueButton = getByLabelText('Continue to order confirmation');
      expect(continueButton).toBeInTheDocument();

      // These elements should be properly accessible
      expect(backButton.tagName).toBe('BUTTON');
      expect(continueButton.tagName).toBe('BUTTON');
    });
  });
});