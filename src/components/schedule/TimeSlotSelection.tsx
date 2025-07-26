
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Loader2, Truck, Edit3 } from "lucide-react";
import { ScheduleOrderData } from "@/pages/Schedule";
import { addDays, format, isBefore, startOfToday, isSameDay, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
  enabled: boolean;
}

interface TimeSlotSelectionProps {
  orderData: ScheduleOrderData;
  updateOrderData: (data: Partial<ScheduleOrderData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TimeSlotSelection = ({ orderData, updateOrderData, onNext, onBack }: TimeSlotSelectionProps) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [pickupDate, setPickupDate] = useState<Date | null>(orderData.pickupDate || new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(orderData.deliveryDate || (orderData.pickupDate ? addDays(orderData.pickupDate, 1) : addDays(new Date(), 1)));
  const [selectedPickupSlotId, setSelectedPickupSlotId] = useState<string | null>(orderData.pickupSlotId);
  const [selectedDeliverySlotId, setSelectedDeliverySlotId] = useState<string | null>(orderData.deliverySlotId);
  const [showDeliveryCustomization, setShowDeliveryCustomization] = useState(false);

  // Today for date validation
  const today = startOfToday();

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInfo = () => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined;

  // Fetch all time slots from database (both enabled and disabled)
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
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, []);

  // Filter time slots based on date and enabled status
  const getAvailableTimeSlots = (selectedDate: Date | null, isPickup: boolean = true) => {
    if (!selectedDate) return [];
    
    // For pickup slots
    if (isPickup) {
      // If selected date is today, only show enabled slots
      if (isSameDay(selectedDate, today)) {
        return timeSlots.filter(slot => slot.enabled);
      }
      // For future dates, show all slots
      return timeSlots;
    }
    
    // For delivery slots
    if (!isPickup && pickupDate && selectedPickupSlotId) {
      const pickupSlot = timeSlots.find(slot => slot.id === selectedPickupSlotId);
      
      // If delivery is next day after pickup, filter by pickup slot time or later
      if (pickupSlot && isSameDay(selectedDate, addDays(pickupDate, 1))) {
        return timeSlots.filter(slot => slot.start_time >= pickupSlot.start_time);
      }
      
      // For delivery dates more than 1 day after pickup, show all slots
      if (isAfter(selectedDate, addDays(pickupDate, 1))) {
        return timeSlots;
      }
    }
    
    // Default: show all slots
    return timeSlots;
  };

  // Select pickup date and auto-set delivery
  function handlePickupDateSelect(date: Date | null) {
    // Prevent unselecting the date - only allow valid date selection
    if (!date) return;
    
    const userInfo = getUserInfo();
    
    // Track pickup date selection
    trackEvent('pickup_date_selected', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'selected_date': date.toDateString(),
      'previous_date': pickupDate?.toDateString() || ''
    });

    setPickupDate(date);
    
    // Reset pickup time slot when changing date
    setSelectedPickupSlotId(null);
    
    // Auto-set delivery date to next day (24-hour delivery)
    const newDeliveryDate = addDays(date, 1);
    setDeliveryDate(newDeliveryDate);
    
    // Reset delivery slot selection
    setSelectedDeliverySlotId(null);
    
    updateOrderData({ 
      pickupDate: date,
      deliveryDate: newDeliveryDate,
      pickupSlotId: null,
      pickupSlotLabel: null,
      deliverySlotId: null,
      deliverySlotLabel: null,
    });
  }

  // Select pickup time slot and auto-set same delivery slot
  function handlePickupTimeSlotSelect(timeSlot: TimeSlot) {
    const userInfo = getUserInfo();
    
    // Track pickup time slot selection
    trackEvent('pickup_time_slot_selected', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'selected_time_slot': timeSlot.label,
      'selected_time_slot_id': timeSlot.id,
      'pickup_date': pickupDate?.toDateString() || '',
      'previous_time_slot': timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label || ''
    });

    console.log("Selecting pickup time slot:", timeSlot);
    setSelectedPickupSlotId(timeSlot.id);
    
    // Auto-set delivery slot to the same slot if available, otherwise first available slot
    const deliverySlots = getAvailableTimeSlots(deliveryDate, false);
    let autoDeliverySlot = deliverySlots.find(slot => slot.id === timeSlot.id);
    
    // If same slot not available, pick the first available slot that's equal or later
    if (!autoDeliverySlot) {
      autoDeliverySlot = deliverySlots.find(slot => slot.start_time >= timeSlot.start_time) || deliverySlots[0];
    }
    
    if (autoDeliverySlot) {
      setSelectedDeliverySlotId(autoDeliverySlot.id);
      updateOrderData({
        pickupSlotId: timeSlot.id,
        pickupSlotLabel: timeSlot.label,
        deliverySlotId: autoDeliverySlot.id,
        deliverySlotLabel: autoDeliverySlot.label,
      });
    } else {
      updateOrderData({
        pickupSlotId: timeSlot.id,
        pickupSlotLabel: timeSlot.label,
      });
    }
  }

  // Select delivery date (only when customizing)
  function handleDeliveryDateSelect(date: Date | null) {
    // Prevent unselecting the date - only allow valid date selection
    if (!date) return;
    
    const userInfo = getUserInfo();
    
    // Track delivery date selection
    trackEvent('delivery_date_selected', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'selected_delivery_date': date.toDateString(),
      'previous_delivery_date': deliveryDate?.toDateString() || '',
      'pickup_date': pickupDate?.toDateString() || ''
    });

    setDeliveryDate(date);
    
    // Reset delivery time slot when changing date
    setSelectedDeliverySlotId(null);
    
    updateOrderData({ 
      deliveryDate: date,
      deliverySlotId: null,
      deliverySlotLabel: null,
    });
  }

  // Select delivery time slot (only when customizing)
  function handleDeliveryTimeSlotSelect(timeSlot: TimeSlot) {
    const userInfo = getUserInfo();
    
    // Track delivery time slot selection
    trackEvent('delivery_time_slot_selected', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'selected_delivery_time_slot': timeSlot.label,
      'selected_delivery_time_slot_id': timeSlot.id,
      'delivery_date': deliveryDate?.toDateString() || '',
      'pickup_date': pickupDate?.toDateString() || '',
      'pickup_time_slot': timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label || '',
      'previous_delivery_time_slot': timeSlots.find(slot => slot.id === selectedDeliverySlotId)?.label || ''
    });

    console.log("Selecting delivery time slot:", timeSlot);
    setSelectedDeliverySlotId(timeSlot.id);
    
    updateOrderData({
      deliverySlotId: timeSlot.id,
      deliverySlotLabel: timeSlot.label,
    });
  }

  // Handle change delivery schedule CTA click
  function handleChangeDeliveryClick() {
    const userInfo = getUserInfo();
    
    // Track change delivery schedule CTA click
    trackEvent('change_delivery_schedule_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'current_delivery_date': deliveryDate?.toDateString() || '',
      'current_delivery_time_slot': timeSlots.find(slot => slot.id === selectedDeliverySlotId)?.label || '',
      'pickup_date': pickupDate?.toDateString() || '',
      'pickup_time_slot': timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label || ''
    });

    setShowDeliveryCustomization(true);
  }

  // Continue to next step
  function handleContinue() {
    if (!orderData.pickupDate) {
      toast({
        title: "Please select a pickup date",
        description: "You need to select a pickup date to continue",
      });
      return;
    }
    
    if (!orderData.pickupSlotId) {
      toast({
        title: "Please select a pickup time slot",
        description: "You need to select a pickup time slot to continue",
      });
      return;
    }

    if (!orderData.deliveryDate) {
      toast({
        title: "Please select a delivery date",
        description: "You need to select a delivery date to continue",
      });
      return;
    }
    
    if (!orderData.deliverySlotId) {
      toast({
        title: "Please select a delivery time slot",
        description: "You need to select a delivery time slot to continue",
      });
      return;
    }
    
    // Get the selected time slots
    const selectedPickupSlot = timeSlots.find(slot => slot.id === orderData.pickupSlotId);
    const selectedDeliverySlot = timeSlots.find(slot => slot.id === orderData.deliverySlotId);
    
    if (!selectedPickupSlot || !selectedDeliverySlot) {
      toast({
        title: "Error with time slots",
        description: "The selected time slots could not be found. Please select again.",
        variant: "destructive",
      });
      return;
    }
    
    // Make a final update to ensure all data is set correctly before continuing
    const updatedOrderData = {
      pickupDate: orderData.pickupDate,
      deliveryDate: orderData.deliveryDate,
      pickupSlotId: selectedPickupSlot.id,
      pickupSlotLabel: selectedPickupSlot.label,
      deliverySlotId: selectedDeliverySlot.id,
      deliverySlotLabel: selectedDeliverySlot.label
    };
    
    updateOrderData(updatedOrderData);
    
    // Log the final state for debugging
    console.log("Final order data before continuing:", updatedOrderData);
    
    // Continue to next step
    onNext();
  }

  if (loadingSlots) {
    return (
      <div className="space-y-6 pb-24">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Schedule Pickup & Delivery</h1>
          <p className="text-gray-600 mt-2">Loading available time slots...</p>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  const availablePickupSlots = getAvailableTimeSlots(pickupDate, true);
  const availableDeliverySlots = getAvailableTimeSlots(deliveryDate, false);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Schedule Pickup & Delivery</h1>
        <p className="text-gray-600 mt-2">Select your preferred pickup schedule</p>
      </div>
      
      {/* Pickup Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Pickup Schedule
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pickup Calendar */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Pickup Date</h3>
            <div className="border rounded-lg p-3 bg-white">
              <Calendar
                selectedDate={pickupDate || undefined}
                onSelectDate={handlePickupDateSelect}
                disabled={(date) => isBefore(date, today)}
              />
            </div>
            {pickupDate && isSameDay(pickupDate, today) && (
              <p className="text-xs text-blue-600">
                Only available time slots are shown for today
              </p>
            )}
          </div>
          
          {/* Pickup Time slots */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Pickup Time
            </h3>
            
            {pickupDate ? (
              <div className="space-y-3">
                {availablePickupSlots.length > 0 ? (
                  availablePickupSlots.map((slot) => (
                    <Card 
                      key={slot.id}
                      className={`transition-all cursor-pointer hover:shadow-md ${
                        selectedPickupSlotId === slot.id 
                          ? "ring-2 ring-black shadow-md" 
                          : "hover:scale-[1.01] border-gray-200"
                      }`}
                      onClick={() => handlePickupTimeSlotSelect(slot)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{slot.label}</p>
                          </div>
                          
                          {selectedPickupSlotId === slot.id && (
                            <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center">
                              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="p-6 bg-white rounded-lg text-center border">
                    <p className="text-gray-600">
                      {pickupDate && isSameDay(pickupDate, today) 
                        ? "No available time slots for today" 
                        : "No time slots are currently available"
                      }
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-lg text-center border">
                <p className="text-gray-600">Please select a pickup date first</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Section */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Schedule
          </h2>
          
          {selectedPickupSlotId && !showDeliveryCustomization && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleChangeDeliveryClick}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Change Delivery Schedule
            </Button>
          )}
        </div>

        {/* Default 24-hour delivery display */}
        {selectedPickupSlotId && !showDeliveryCustomization && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">24-Hour Delivery</h3>
                <p className="text-sm text-gray-600">
                  {deliveryDate && format(deliveryDate, 'EEEE, MMMM d, yyyy')} • {timeSlots.find(slot => slot.id === selectedDeliverySlotId)?.label || timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Custom delivery selection */}
        {showDeliveryCustomization && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Calendar */}
            <div className="space-y-4">
              <h3 className="font-medium">Select Delivery Date</h3>
              <div className="border rounded-lg p-3 bg-white">
                <Calendar
                  selectedDate={deliveryDate || undefined}
                  onSelectDate={handleDeliveryDateSelect}
                  disabled={(date) => !pickupDate || isBefore(date, addDays(pickupDate, 1))}
                />
              </div>
              {deliveryDate && pickupDate && isSameDay(deliveryDate, addDays(pickupDate, 1)) && selectedPickupSlotId && (
                <p className="text-xs text-blue-600">
                  Only slots equal or later than pickup time ({timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label}) are shown for next day delivery
                </p>
              )}
            </div>
            
            {/* Delivery Time slots */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Delivery Time
              </h3>
              
              {deliveryDate ? (
                <div className="space-y-3">
                  {availableDeliverySlots.length > 0 ? (
                    availableDeliverySlots.map((slot) => (
                      <Card 
                        key={slot.id}
                        className={`transition-all cursor-pointer hover:shadow-md ${
                          selectedDeliverySlotId === slot.id 
                            ? "ring-2 ring-blue-500 shadow-md" 
                            : "hover:scale-[1.01] border-gray-200"
                        }`}
                        onClick={() => handleDeliveryTimeSlotSelect(slot)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{slot.label}</p>
                            </div>
                            
                            {selectedDeliverySlotId === slot.id && (
                              <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="p-6 bg-white rounded-lg text-center border">
                      <p className="text-gray-600">
                        No time slots are currently available for this date
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-white rounded-lg text-center border">
                  <p className="text-gray-600">Please select a delivery date first</p>
                </div>
              )}
            </div>
          </div>
        )}

        {showDeliveryCustomization && (
          <div className="mt-4 flex justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setShowDeliveryCustomization(false);
                // Reset to 24-hour delivery
                const newDeliveryDate = pickupDate ? addDays(pickupDate, 1) : null;
                setDeliveryDate(newDeliveryDate);
                const pickupSlot = timeSlots.find(slot => slot.id === selectedPickupSlotId);
                if (pickupSlot) {
                  const deliverySlots = getAvailableTimeSlots(newDeliveryDate, false);
                  const autoDeliverySlot = deliverySlots.find(slot => slot.id === pickupSlot.id) || 
                                          deliverySlots.find(slot => slot.start_time >= pickupSlot.start_time) || 
                                          deliverySlots[0];
                  if (autoDeliverySlot) {
                    setSelectedDeliverySlotId(autoDeliverySlot.id);
                    updateOrderData({
                      deliveryDate: newDeliveryDate,
                      deliverySlotId: autoDeliverySlot.id,
                      deliverySlotLabel: autoDeliverySlot.label,
                    });
                  }
                }
              }}
            >
              Use 24-Hour Delivery
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      {pickupDate && selectedPickupSlotId && deliveryDate && selectedDeliverySlotId && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium mb-2 text-green-800">Schedule Summary</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Pickup: </span> 
              {format(pickupDate, 'EEEE, d MMMM yyyy')} • {timeSlots.find(slot => slot.id === selectedPickupSlotId)?.label}
            </p>
            <p>
              <span className="font-medium">Delivery: </span> 
              {format(deliveryDate, 'EEEE, d MMMM yyyy')} • {timeSlots.find(slot => slot.id === selectedDeliverySlotId)?.label}
            </p>
          </div>
        </div>
      )}
      
      {/* Special instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Special Instructions (Optional)</h3>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none"
          placeholder="Any specific instructions for pickup or care requirements..."
          value={orderData.specialInstructions}
          onChange={(e) => updateOrderData({ specialInstructions: e.target.value })}
        ></textarea>
      </div>
      
      {/* Sticky button container */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="max-w-3xl mx-auto flex justify-between">
          <Button 
            onClick={onBack}
            variant="outline"
            className="px-6 py-2 h-auto text-base group"
            aria-label="Go back to address selection"
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 h-auto text-base group"
            disabled={!orderData.pickupDate || !orderData.pickupSlotId || !orderData.deliveryDate || !orderData.deliverySlotId}
            aria-label="Continue to order confirmation"
          >
            Continue to Confirm
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
