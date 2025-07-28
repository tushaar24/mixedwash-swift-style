import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ScheduleOrderData } from '@/pages/Schedule';
import { 
  getTodayDate, 
  getTomorrowDate, 
  isDateSame, 
  addDaysToDate, 
  isTimeAfterOrEqual,
  debounce 
} from '@/utils/dateHelpers';

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface UseSlotSelectionProps {
  orderData: ScheduleOrderData;
  updateOrderData: (data: Partial<ScheduleOrderData>) => void;
}

export const useSlotSelection = ({ orderData, updateOrderData }: UseSlotSelectionProps) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [showDeliveryCustomization, setShowDeliveryCustomization] = useState(false);
  
  // Use refs to prevent stale closures
  const timeSlotsRef = useRef<TimeSlot[]>([]);
  const orderDataRef = useRef<ScheduleOrderData>(orderData);

  // Update refs when data changes
  useEffect(() => {
    timeSlotsRef.current = timeSlots;
  }, [timeSlots]);

  useEffect(() => {
    orderDataRef.current = orderData;
  }, [orderData]);

  // Today reference
  const today = getTodayDate();

  // Initialize default dates if not set
  useEffect(() => {
    if (!orderData.pickupDate || !orderData.deliveryDate) {
      const defaultPickupDate = orderData.pickupDate || today;
      const defaultDeliveryDate = orderData.deliveryDate || getTomorrowDate();
      
      updateOrderData({
        pickupDate: defaultPickupDate,
        deliveryDate: defaultDeliveryDate,
      });
    }
  }, [orderData.pickupDate, orderData.deliveryDate, today, updateOrderData]);

  // Fetch time slots with error handling
  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setLoadingSlots(true);
        const { data, error } = await supabase
          .from("time_slots")
          .select("*")
          .order("start_time");

        if (error) {
          console.error("Error fetching time slots:", error);
          toast({
            title: "Error loading time slots",
            description: "Failed to load available time slots. Please try again.",
            variant: "destructive",
          });
          setTimeSlots([]);
        } else {
          console.log("Fetched all time slots:", data);
          setTimeSlots(data || []);
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Error loading time slots",
          description: "Failed to load available time slots. Please try again.",
          variant: "destructive",
        });
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  // Get available time slots with proper filtering
  const getAvailableTimeSlots = useCallback((selectedDate: Date | null, isPickup: boolean = true): TimeSlot[] => {
    if (!selectedDate) return [];
    
    const currentSlots = timeSlotsRef.current;
    const currentOrderData = orderDataRef.current;
    
    // For pickup slots
    if (isPickup) {
      // If selected date is today, only show enabled slots
      if (isDateSame(selectedDate, today)) {
        return currentSlots.filter(slot => slot.enabled);
      }
      // For future dates, show all slots
      return currentSlots;
    }
    
    // For delivery slots
    if (!isPickup && currentOrderData.pickupDate && currentOrderData.pickupSlotId) {
      const pickupSlot = currentSlots.find(slot => slot.id === currentOrderData.pickupSlotId);
      
      // If delivery is next day after pickup, filter by pickup slot time or later
      if (pickupSlot && isDateSame(selectedDate, addDaysToDate(currentOrderData.pickupDate, 1))) {
        return currentSlots.filter(slot => isTimeAfterOrEqual(slot.start_time, pickupSlot.start_time));
      }
      
      // For delivery dates more than 1 day after pickup, show all slots
      const dayAfterPickup = addDaysToDate(currentOrderData.pickupDate, 1);
      if (dayAfterPickup && selectedDate > dayAfterPickup) {
        return currentSlots;
      }
    }
    
    // Default: show all slots
    return currentSlots;
  }, [today]);

  // Debounced state update to prevent race conditions
  const debouncedUpdateOrderData = useCallback(
    debounce((data: Partial<ScheduleOrderData>) => {
      updateOrderData(data);
    }, 100),
    [updateOrderData]
  );

  // Handle pickup date selection with proper state management
  const handlePickupDateSelect = useCallback((date: Date | null) => {
    console.log('Pickup date selected:', date);
    
    // Allow deselection
    if (!date) {
      debouncedUpdateOrderData({
        pickupDate: null,
        deliveryDate: null,
        pickupSlotId: null,
        pickupSlotLabel: null,
        deliverySlotId: null,
        deliverySlotLabel: null,
      });
      return;
    }
    
    // Auto-set delivery date to next day (24-hour delivery)
    const newDeliveryDate = addDaysToDate(date, 1);
    
    // Reset slot selections when changing date
    debouncedUpdateOrderData({
      pickupDate: date,
      deliveryDate: newDeliveryDate,
      pickupSlotId: null,
      pickupSlotLabel: null,
      deliverySlotId: null,
      deliverySlotLabel: null,
    });
  }, [debouncedUpdateOrderData]);

  // Handle pickup time slot selection with auto-delivery logic
  const handlePickupTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
    console.log("Selecting pickup time slot:", timeSlot);
    
    const currentOrderData = orderDataRef.current;
    const currentSlots = timeSlotsRef.current;
    
    // Auto-set delivery slot to the same slot if available, otherwise first available slot
    const deliverySlots = getAvailableTimeSlots(currentOrderData.deliveryDate, false);
    let autoDeliverySlot = deliverySlots.find(slot => slot.id === timeSlot.id);
    
    // If same slot not available, pick the first available slot that's equal or later
    if (!autoDeliverySlot) {
      autoDeliverySlot = deliverySlots.find(slot => 
        isTimeAfterOrEqual(slot.start_time, timeSlot.start_time)
      ) || deliverySlots[0];
    }
    
    if (autoDeliverySlot) {
      debouncedUpdateOrderData({
        pickupSlotId: timeSlot.id,
        pickupSlotLabel: timeSlot.label,
        deliverySlotId: autoDeliverySlot.id,
        deliverySlotLabel: autoDeliverySlot.label,
      });
    } else {
      // Only update pickup if no delivery slot available
      debouncedUpdateOrderData({
        pickupSlotId: timeSlot.id,
        pickupSlotLabel: timeSlot.label,
        deliverySlotId: null,
        deliverySlotLabel: null,
      });
    }
  }, [getAvailableTimeSlots, debouncedUpdateOrderData]);

  // Handle delivery date selection
  const handleDeliveryDateSelect = useCallback((date: Date | null) => {
    console.log('Delivery date selected:', date);
    
    // Allow deselection
    if (!date) {
      debouncedUpdateOrderData({
        deliveryDate: null,
        deliverySlotId: null,
        deliverySlotLabel: null,
      });
      return;
    }
    
    // Reset delivery time slot when changing date
    debouncedUpdateOrderData({
      deliveryDate: date,
      deliverySlotId: null,
      deliverySlotLabel: null,
    });
  }, [debouncedUpdateOrderData]);

  // Handle delivery time slot selection
  const handleDeliveryTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
    console.log("Selecting delivery time slot:", timeSlot);
    
    debouncedUpdateOrderData({
      deliverySlotId: timeSlot.id,
      deliverySlotLabel: timeSlot.label,
    });
  }, [debouncedUpdateOrderData]);

  // Validation function
  const isValidForContinue = useCallback((): boolean => {
    const { pickupDate, pickupSlotId, deliveryDate, deliverySlotId } = orderDataRef.current;
    return !!(pickupDate && pickupSlotId && deliveryDate && deliverySlotId);
  }, []);

  // Get validation errors
  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];
    const { pickupDate, pickupSlotId, deliveryDate, deliverySlotId } = orderDataRef.current;
    
    if (!pickupDate) errors.push("Please select a pickup date");
    if (!pickupSlotId) errors.push("Please select a pickup time slot");
    if (!deliveryDate) errors.push("Please select a delivery date");
    if (!deliverySlotId) errors.push("Please select a delivery time slot");
    
    return errors;
  }, []);

  return {
    // State
    timeSlots,
    loadingSlots,
    showDeliveryCustomization,
    today,
    
    // Handlers
    handlePickupDateSelect,
    handlePickupTimeSlotSelect,
    handleDeliveryDateSelect,
    handleDeliveryTimeSlotSelect,
    setShowDeliveryCustomization,
    
    // Utilities
    getAvailableTimeSlots,
    isValidForContinue,
    getValidationErrors,
  };
};