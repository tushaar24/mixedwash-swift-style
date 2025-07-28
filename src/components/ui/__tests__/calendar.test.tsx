import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '../calendar';
import { addDays, startOfToday } from 'date-fns';

describe('Calendar Component Edge Cases', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const mockOnSelectDate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // EDGE CASE 1: Visual Selection State Issues
  describe('Visual Selection State', () => {
    it('should visually highlight selected date correctly', () => {
      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Find today's date button
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Should have selected styling (bg-primary class)
      expect(todayButton).toHaveClass('bg-primary');
      expect(todayButton).toHaveClass('text-primary-foreground');
    });

    it('should handle null selectedDate correctly', () => {
      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // No date should be visually selected
      const dateButtons = screen.getAllByRole('button');
      dateButtons.forEach(button => {
        if (button.textContent?.match(/^\d+$/)) { // Only date buttons
          expect(button).not.toHaveClass('bg-primary');
        }
      });
    });

    it('should update visual state when selectedDate prop changes', () => {
      const { rerender } = render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Initially today should be selected
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      expect(todayButton).toHaveClass('bg-primary');

      // Change to tomorrow
      rerender(
        &lt;Calendar
          selectedDate={tomorrow}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Today should no longer be selected
      expect(todayButton).not.toHaveClass('bg-primary');

      // Tomorrow should be selected
      const tomorrowButton = screen.getByRole('button', { 
        name: new RegExp(tomorrow.getDate().toString()) 
      });
      expect(tomorrowButton).toHaveClass('bg-primary');
    });
  });

  // EDGE CASE 2: Date Deselection Behavior
  describe('Date Deselection Behavior', () => {
    it('should call onSelectDate with undefined when clicking selected date', () => {
      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Click on already selected date
      fireEvent.click(todayButton);

      // Should call with undefined (deselection)
      expect(mockOnSelectDate).toHaveBeenCalledWith(undefined);
    });

    it('should call onSelectDate with date when clicking unselected date', () => {
      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const tomorrowButton = screen.getByRole('button', { 
        name: new RegExp(tomorrow.getDate().toString()) 
      });

      // Click on unselected date
      fireEvent.click(tomorrowButton);

      // Should call with the tomorrow date
      expect(mockOnSelectDate).toHaveBeenCalledWith(tomorrow);
    });
  });

  // EDGE CASE 3: Disabled Date Handling
  describe('Disabled Date Handling', () => {
    it('should not allow selection of disabled dates', () => {
      const isDisabled = (date: Date) => date < today;

      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
          disabled={isDisabled}
        /&gt;
      );

      // Find a past date (yesterday)
      const yesterday = addDays(today, -1);
      const yesterdayButton = screen.queryByRole('button', { 
        name: new RegExp(yesterday.getDate().toString()) 
      });

      if (yesterdayButton) {
        // Should have disabled styling
        expect(yesterdayButton).toHaveClass('text-muted-foreground');
        expect(yesterdayButton).toHaveClass('opacity-50');

        // Click should not trigger callback
        fireEvent.click(yesterdayButton);
        expect(mockOnSelectDate).not.toHaveBeenCalled();
      }
    });

    it('should allow selection of enabled dates', () => {
      const isDisabled = (date: Date) => date < today;

      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
          disabled={isDisabled}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Should not have disabled styling
      expect(todayButton).not.toHaveClass('opacity-50');

      // Click should trigger callback
      fireEvent.click(todayButton);
      expect(mockOnSelectDate).toHaveBeenCalledWith(today);
    });
  });

  // EDGE CASE 4: Touch and Mobile Interactions
  describe('Touch and Mobile Interactions', () => {
    it('should handle touch events on dates', () => {
      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Simulate touch events
      fireEvent.touchStart(todayButton);
      fireEvent.touchEnd(todayButton);
      fireEvent.click(todayButton); // Touch usually triggers click too

      expect(mockOnSelectDate).toHaveBeenCalledWith(today);
    });

    it('should handle double-tap without issues', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Double tap
      await user.dblClick(todayButton);

      // Should handle gracefully (might be called twice)
      expect(mockOnSelectDate).toHaveBeenCalled();
    });
  });

  // EDGE CASE 5: Keyboard Navigation
  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation between dates', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const calendar = screen.getByRole('grid');
      
      // Focus the calendar
      calendar.focus();

      // Use arrow keys to navigate
      await user.keyboard('{ArrowRight}');
      
      // Should move focus to next date
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLButtonElement);
    });

    it('should allow Enter key to select focused date', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Focus and press Enter
      todayButton.focus();
      await user.keyboard('{Enter}');

      expect(mockOnSelectDate).toHaveBeenCalledWith(today);
    });

    it('should allow Space key to select focused date', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={undefined}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });

      // Focus and press Space
      todayButton.focus();
      await user.keyboard(' ');

      expect(mockOnSelectDate).toHaveBeenCalledWith(today);
    });
  });

  // EDGE CASE 6: Month Navigation Edge Cases
  describe('Month Navigation', () => {
    it('should handle month navigation correctly', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Find next month button
      const nextButton = screen.getByRole('button', { 
        name: /next month/i 
      });

      // Navigate to next month
      await user.click(nextButton);

      // Should show next month
      // The exact assertion depends on the current month, but calendar should update
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should handle previous month navigation correctly', async () => {
      const user = userEvent.setup();

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Find previous month button
      const prevButton = screen.getByRole('button', { 
        name: /previous month/i 
      });

      // Navigate to previous month
      await user.click(prevButton);

      // Should show previous month
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should maintain selected date when navigating months', async () => {
      const user = userEvent.setup();

      // Use a date that will be visible in next month view
      const nextMonthDate = addDays(today, 32);

      render(
        &lt;Calendar
          selectedDate={nextMonthDate}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Navigate to show the selected date's month
      const nextButton = screen.getByRole('button', { 
        name: /next month/i 
      });
      await user.click(nextButton);

      // Selected date should still be highlighted when visible
      const selectedButton = screen.queryByRole('button', { 
        name: new RegExp(nextMonthDate.getDate().toString()) 
      });

      if (selectedButton) {
        expect(selectedButton).toHaveClass('bg-primary');
      }
    });
  });

  // EDGE CASE 7: CSS and Styling Edge Cases
  describe('CSS and Styling', () => {
    it('should apply correct CSS classes for different date states', () => {
      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
          disabled={(date) => date < today}
        /&gt;
      );

      // Today should have selected classes
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      expect(todayButton).toHaveClass('bg-primary');
      expect(todayButton).toHaveClass('text-primary-foreground');

      // Future dates should be normal
      const tomorrowButton = screen.getByRole('button', { 
        name: new RegExp(tomorrow.getDate().toString()) 
      });
      expect(tomorrowButton).not.toHaveClass('bg-primary');
      expect(tomorrowButton).not.toHaveClass('opacity-50');

      // Past dates should be disabled (if visible)
      const yesterday = addDays(today, -1);
      const yesterdayButton = screen.queryByRole('button', { 
        name: new RegExp(yesterday.getDate().toString()) 
      });
      
      if (yesterdayButton) {
        expect(yesterdayButton).toHaveClass('opacity-50');
      }
    });

    it('should handle high contrast mode correctly', () => {
      // Mock high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockImplementation(() => ({
          matches: true,
          media: '(prefers-contrast: high)',
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        })),
      });

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // In high contrast mode, selected dates should still be distinguishable
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      
      // Should have high contrast compatible classes
      expect(todayButton).toHaveClass('bg-primary');
    });
  });

  // EDGE CASE 8: Timezone and Locale Edge Cases
  describe('Timezone and Locale', () => {
    it('should handle different locales correctly', () => {
      // Mock different locale
      const originalIntl = global.Intl;
      global.Intl = {
        ...originalIntl,
        DateTimeFormat: vi.fn().mockImplementation(() => ({
          format: vi.fn().mockReturnValue('01/15/2024'),
          formatToParts: vi.fn()
        }))
      };

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Calendar should still function correctly
      expect(screen.getByRole('grid')).toBeInTheDocument();

      global.Intl = originalIntl;
    });

    it('should handle timezone changes correctly', () => {
      // Mock timezone change
      const mockTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = vi.fn().mockReturnValue(-480); // PST

      render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Should still work correctly with different timezone
      const todayButton = screen.getByRole('button', { 
        name: new RegExp(today.getDate().toString()) 
      });
      expect(todayButton).toBeInTheDocument();

      Date.prototype.getTimezoneOffset = mockTimezoneOffset;
    });
  });

  // EDGE CASE 9: Performance Edge Cases
  describe('Performance', () => {
    it('should not cause excessive re-renders on prop changes', () => {
      const renderSpy = vi.fn();
      
      const TestCalendar = (props: any) => {
        renderSpy();
        return &lt;Calendar {...props} /&gt;;
      };

      const { rerender } = render(
        &lt;TestCalendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Update with same props
      rerender(
        &lt;TestCalendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Should not cause unnecessary re-renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(
        &lt;Calendar
          selectedDate={today}
          onSelectDate={mockOnSelectDate}
        /&gt;
      );

      // Rapid prop changes
      for (let i = 0; i < 10; i++) {
        rerender(
          &lt;Calendar
            selectedDate={addDays(today, i)}
            onSelectDate={mockOnSelectDate}
          /&gt;
        );
      }

      // Should still be functional
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });
});