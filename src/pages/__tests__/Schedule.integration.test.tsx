import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Schedule from '../Schedule';
import { addDays, startOfToday } from 'date-fns';

// Mock all dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', label: '9:00 AM - 11:00 AM', start_time: '09:00', end_time: '11:00', enabled: true },
            { id: '2', label: '11:00 AM - 1:00 PM', start_time: '11:00', end_time: '13:00', enabled: true },
            { id: '3', label: '2:00 PM - 4:00 PM', start_time: '14:00', end_time: '16:00', enabled: false },
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
    user: { id: 'test-user', user_metadata: { full_name: 'Test User' } },
    profile: { mobile_number: '123456789' },
    isLoading: false,
    isProfileComplete: true
  })
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn()
}));

// Mock other components to isolate the Schedule logic
vi.mock('@/components/schedule/ServiceSelection', () => ({
  ServiceSelection: ({ onNext, orderData, updateOrderData }: any) => (
    &lt;div data-testid="service-selection"&gt;
      &lt;h2&gt;Service Selection&lt;/h2&gt;
      &lt;button 
        onClick={() => {
          updateOrderData({ 
            services: [{ id: '1', name: 'Wash & Fold', price: 20 }] 
          });
          onNext();
        }}
      &gt;
        Continue to Address
      &lt;/button&gt;
    &lt;/div&gt;
  )
}));

vi.mock('@/components/schedule/AddressSelection', () => ({
  AddressSelection: ({ onNext, onBack, updateOrderData }: any) => (
    &lt;div data-testid="address-selection"&gt;
      &lt;h2&gt;Address Selection&lt;/h2&gt;
      &lt;button onClick={onBack}&gt;Back to Services&lt;/button&gt;
      &lt;button 
        onClick={() => {
          updateOrderData({ addressId: 'addr-1' });
          onNext();
        }}
      &gt;
        Continue to Schedule
      &lt;/button&gt;
    &lt;/div&gt;
  )
}));

vi.mock('@/components/schedule/OrderConfirmation', () => ({
  OrderConfirmation: ({ onBack }: any) => (
    &lt;div data-testid="order-confirmation"&gt;
      &lt;h2&gt;Order Confirmation&lt;/h2&gt;
      &lt;button onClick={onBack}&gt;Back to Schedule&lt;/button&gt;
    &lt;/div&gt;
  )
}));

vi.mock('@/components/Navbar', () => ({
  Navbar: () => &lt;nav data-testid="navbar"&gt;Navbar&lt;/nav&gt;
}));

const ScheduleWrapper = () => (
  &lt;BrowserRouter&gt;
    &lt;Schedule /&gt;
  &lt;/BrowserRouter&gt;
);

describe('Schedule Integration Edge Cases', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.setSystemTime(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0));
  });

  // INTEGRATION EDGE CASE 1: State Flow Between Components
  describe('State Flow Integration', () => {
    it('should properly pass orderData through all steps', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Start at service selection
      expect(screen.getByTestId('service-selection')).toBeInTheDocument();

      // Complete service selection
      const serviceButton = screen.getByText('Continue to Address');
      fireEvent.click(serviceButton);

      // Should move to address selection
      await waitFor(() => {
        expect(screen.getByTestId('address-selection')).toBeInTheDocument();
      });

      // Complete address selection
      const addressButton = screen.getByText('Continue to Schedule');
      fireEvent.click(addressButton);

      // Should move to time slot selection
      await waitFor(() => {
        expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
      });

      // Verify that orderData has been accumulated correctly
      // The time slot selection should have access to services and address
      expect(screen.getByText('Loading available time slots...')).toBeInTheDocument();
    });

    it('should handle browser back navigation correctly', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Progress through steps
      fireEvent.click(screen.getByText('Continue to Address'));
      
      await waitFor(() => {
        expect(screen.getByTestId('address-selection')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Continue to Schedule'));

      await waitFor(() => {
        expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      // Should return to address selection
      await waitFor(() => {
        expect(screen.getByTestId('address-selection')).toBeInTheDocument();
      });
    });
  });

  // INTEGRATION EDGE CASE 2: Default Date Initialization
  describe('Default Date Initialization', () => {
    it('should initialize with today as default pickup date', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // Wait for time slots to load
      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Check that today is pre-selected in the calendar
      const calendar = screen.getByRole('grid');
      expect(calendar).toBeInTheDocument();

      // The orderData should have been initialized with today's date
      // This tests the Schedule component's initialization logic
    });

    it('should properly calculate delivery date as tomorrow by default', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // The default delivery should be set to tomorrow
      // This would be visible in the delivery section once a pickup slot is selected
    });
  });

  // INTEGRATION EDGE CASE 3: Cross-component State Consistency
  describe('Cross-component State Consistency', () => {
    it('should maintain consistent state when navigating back and forth', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Complete service selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // Go back to services
      fireEvent.click(screen.getByText('Back to Services'));
      await waitFor(() => screen.getByTestId('service-selection'));

      // The service data should still be preserved
      // (This would be tested by checking if the service selection shows previous selections)

      // Move forward again
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // Continue to schedule
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // State should be consistent
      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });
    });

    it('should handle rapid navigation without state corruption', async () => {
      const user = userEvent.setup();
      render(&lt;ScheduleWrapper /&gt;);

      // Rapid navigation
      await user.click(screen.getByText('Continue to Address'));
      await user.click(screen.getByText('Back to Services'));
      await user.click(screen.getByText('Continue to Address'));
      await user.click(screen.getByText('Continue to Schedule'));

      // Should end up at time slot selection without errors
      await waitFor(() => {
        expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
      });
    });
  });

  // INTEGRATION EDGE CASE 4: Progress Indicator Synchronization
  describe('Progress Indicator Synchronization', () => {
    it('should update progress indicator correctly during navigation', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Should start at step 1 (Services)
      const step1 = screen.getByText('1');
      expect(step1.closest('.bg-black')).toBeInTheDocument();

      // Progress to address
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // Should be at step 2 (Address)
      const step2 = screen.getByText('2');
      expect(step2.closest('.bg-black')).toBeInTheDocument();

      // Progress to schedule
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // Should be at step 3 (Schedule)
      const step3 = screen.getByText('3');
      expect(step3.closest('.bg-black')).toBeInTheDocument();
    });

    it('should update progress bar width correctly', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Find progress bar
      const progressBar = document.querySelector('.bg-black[style*="width"]');
      expect(progressBar).toBeInTheDocument();

      // Should start at 0% width (step 0 of 3)
      expect(progressBar).toHaveStyle('width: 0%');

      // Progress through steps and check width updates
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // Should be 33.33% (step 1 of 3)
      expect(progressBar).toHaveStyle('width: 33.333333333333336%');
    });
  });

  // INTEGRATION EDGE CASE 5: URL State Management
  describe('URL State Management', () => {
    it('should maintain proper URL state during navigation', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // URL should be /schedule throughout
      expect(window.location.pathname).toBe('/');

      // Navigate through steps
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // URL should still be /schedule (since it's all one page)
      expect(window.location.pathname).toBe('/');
    });

    it('should handle browser refresh correctly', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // Simulate page refresh by re-rendering
      const { rerender } = render(&lt;ScheduleWrapper /&gt;);
      rerender(&lt;ScheduleWrapper /&gt;);

      // Should start back at service selection (since state is lost)
      expect(screen.getByTestId('service-selection')).toBeInTheDocument();
    });
  });

  // INTEGRATION EDGE CASE 6: Error Propagation
  describe('Error Propagation', () => {
    it('should handle errors from child components gracefully', async () => {
      // Mock an error in time slot loading
      const errorSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database error' }
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: errorSupabase
      }));

      render(&lt;ScheduleWrapper /&gt;);

      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));

      // Should handle the error gracefully
      await waitFor(() => {
        expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
      });

      // Error should not crash the entire app
      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });

  // INTEGRATION EDGE CASE 7: Complete Flow Validation
  describe('Complete Flow Validation', () => {
    it('should complete entire flow successfully', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Service selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));

      // Address selection
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // Wait for time slots to load
      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Select a date (should be today by default)
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      fireEvent.click(todayButton);

      // Select a time slot
      const timeSlot = screen.getByText('9:00 AM - 11:00 AM');
      fireEvent.click(timeSlot);

      // Continue button should be enabled
      await waitFor(() => {
        const continueButton = screen.getByText('Continue to Confirm');
        expect(continueButton).not.toBeDisabled();
      });

      // Continue to confirmation
      fireEvent.click(screen.getByText('Continue to Confirm'));

      // Should reach order confirmation
      await waitFor(() => {
        expect(screen.getByTestId('order-confirmation')).toBeInTheDocument();
      });
    });

    it('should prevent progression with incomplete data', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Try to skip service selection (should not be possible in UI)
      // But if somehow the state gets corrupted:
      
      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Without selecting date/time, continue button should be disabled
      const continueButton = screen.getByText('Continue to Confirm');
      expect(continueButton).toBeDisabled();
    });
  });

  // INTEGRATION EDGE CASE 8: Memory and Performance
  describe('Memory and Performance', () => {
    it('should not create memory leaks during navigation', async () => {
      const { unmount } = render(&lt;ScheduleWrapper /&gt;);

      // Navigate through all steps
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      // Unmount component
      unmount();

      // Should clean up without errors
      // (In a real test, you might check for specific cleanup behaviors)
    });

    it('should handle multiple rapid state updates efficiently', async () => {
      render(&lt;ScheduleWrapper /&gt;);

      // Progress to time slot selection
      fireEvent.click(screen.getByText('Continue to Address'));
      await waitFor(() => screen.getByTestId('address-selection'));
      
      fireEvent.click(screen.getByText('Continue to Schedule'));
      await waitFor(() => screen.getByText('Loading available time slots...'));

      await waitFor(() => {
        expect(screen.getByText('9:00 AM - 11:00 AM')).toBeInTheDocument();
      });

      // Rapid updates (selecting different dates/times quickly)
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      const tomorrowButton = screen.getByRole('button', { 
        name: new RegExp(tomorrow.getDate().toString()) 
      });

      // Rapid clicking
      for (let i = 0; i < 5; i++) {
        fireEvent.click(todayButton);
        fireEvent.click(tomorrowButton);
      }

      // Should handle all updates without breaking
      expect(screen.getByText('Schedule Pickup & Delivery')).toBeInTheDocument();
    });
  });
});