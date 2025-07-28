import { describe, it, expect } from 'vitest';
import { 
  getTodayDate, 
  getTomorrowDate, 
  isDateSame, 
  isDateBefore, 
  isDateAfter,
  getDateString,
  addDaysToDate,
  compareTimeStrings,
  isTimeAfterOrEqual,
  isValidFutureDate
} from '../dateHelpers';
import { addDays, startOfToday } from 'date-fns';

describe('dateHelpers', () => {
  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  describe('date functions', () => {
    it('should get consistent today date', () => {
      const result = getTodayDate();
      expect(result).toEqual(today);
    });

    it('should get consistent tomorrow date', () => {
      const result = getTomorrowDate();
      expect(result).toEqual(tomorrow);
    });

    it('should compare dates safely', () => {
      expect(isDateSame(today, today)).toBe(true);
      expect(isDateSame(today, tomorrow)).toBe(false);
      expect(isDateSame(null, today)).toBe(false);
      expect(isDateSame(today, null)).toBe(false);
      expect(isDateSame(null, null)).toBe(false);
    });

    it('should check if date is before another', () => {
      expect(isDateBefore(yesterday, today)).toBe(true);
      expect(isDateBefore(today, yesterday)).toBe(false);
      expect(isDateBefore(null, today)).toBe(false);
      expect(isDateBefore(today, null)).toBe(false);
    });

    it('should check if date is after another', () => {
      expect(isDateAfter(tomorrow, today)).toBe(true);
      expect(isDateAfter(today, tomorrow)).toBe(false);
      expect(isDateAfter(null, today)).toBe(false);
      expect(isDateAfter(today, null)).toBe(false);
    });

    it('should get date string safely', () => {
      expect(getDateString(today)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(getDateString(null)).toBe('');
    });

    it('should add days safely', () => {
      expect(addDaysToDate(today, 1)).toEqual(tomorrow);
      expect(addDaysToDate(null, 1)).toBe(null);
    });

    it('should validate future dates', () => {
      expect(isValidFutureDate(tomorrow)).toBe(true);
      expect(isValidFutureDate(today)).toBe(true);
      expect(isValidFutureDate(yesterday)).toBe(false);
      expect(isValidFutureDate(null)).toBe(false);
    });
  });

  describe('time comparison functions', () => {
    it('should compare time strings correctly', () => {
      expect(compareTimeStrings('09:00', '10:00')).toBe(-1);
      expect(compareTimeStrings('10:00', '09:00')).toBe(1);
      expect(compareTimeStrings('10:00', '10:00')).toBe(0);
      expect(compareTimeStrings('12:00', '13:00')).toBe(-1);
      expect(compareTimeStrings('13:00', '12:00')).toBe(1);
      expect(compareTimeStrings('9:00', '10:00')).toBe(-1); // Test padding
      expect(compareTimeStrings('9', '10')).toBe(-1); // Test no minutes
    });

    it('should check if time is after or equal', () => {
      expect(isTimeAfterOrEqual('10:00', '09:00')).toBe(true);
      expect(isTimeAfterOrEqual('09:00', '10:00')).toBe(false);
      expect(isTimeAfterOrEqual('10:00', '10:00')).toBe(true);
      expect(isTimeAfterOrEqual('13:00', '12:00')).toBe(true);
      expect(isTimeAfterOrEqual('12:00', '13:00')).toBe(false);
    });

    it('should handle edge cases in time comparison', () => {
      // Test 12-hour vs 24-hour edge cases
      expect(isTimeAfterOrEqual('12:00', '11:59')).toBe(true);
      expect(isTimeAfterOrEqual('00:00', '23:59')).toBe(false);
      expect(isTimeAfterOrEqual('23:59', '00:00')).toBe(true);
    });
  });
});