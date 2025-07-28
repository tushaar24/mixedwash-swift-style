import { startOfToday, addDays, isSameDay, isBefore, isAfter, format } from 'date-fns';

/**
 * Consistent date helper functions to avoid timezone and boundary issues
 */

// Get consistent "today" reference
export const getTodayDate = () => startOfToday();

// Get consistent "tomorrow" reference  
export const getTomorrowDate = () => addDays(getTodayDate(), 1);

// Safe date comparison that handles null/undefined
export const isDateSame = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return isSameDay(date1, date2);
};

// Safe date before comparison
export const isDateBefore = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return isBefore(date1, date2);
};

// Safe date after comparison
export const isDateAfter = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return isAfter(date1, date2);
};

// Consistent date string for comparisons (avoids timezone issues)
export const getDateString = (date: Date | null): string => {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
};

// Safe date addition
export const addDaysToDate = (date: Date | null, days: number): Date | null => {
  if (!date) return null;
  return addDays(date, days);
};

// Time comparison helper (24-hour format strings)
export const compareTimeStrings = (time1: string, time2: string): number => {
  // Ensure both times are in HH:MM format
  const normalizeTime = (time: string): string => {
    const [hours, minutes = '00'] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const t1 = normalizeTime(time1);
  const t2 = normalizeTime(time2);
  
  return t1.localeCompare(t2);
};

// Check if time1 >= time2
export const isTimeAfterOrEqual = (time1: string, time2: string): boolean => {
  return compareTimeStrings(time1, time2) >= 0;
};

// Debounce helper for rapid state updates
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Validate date is not in the past
export const isValidFutureDate = (date: Date | null): boolean => {
  if (!date) return false;
  const today = getTodayDate();
  return !isBefore(date, today);
};