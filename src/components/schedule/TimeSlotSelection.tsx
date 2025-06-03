import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Loader2, Truck } from "lucide-react";
import { ScheduleOrderData } from "@/pages/Schedule";
import { addDays, format, isBefore, startOfToday, isSameDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

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
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [pickupDate, setPickupDate] = useState<Date | null>(orderData.pickupDate || new Date());
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(orderData.deliveryDate || (orderData.pickupDate ? addDays(orderData.pickupDate, 1) : addDays(new Date(), 1)));
  const [selectedPickupSlotId, setSelectedPickupSlotId] = useState<string | null>(orderData.pickupSlotId);
  const [selectedDeliverySlotId, setSelectedDeliverySlotId] = useState<string | null>(orderData.deliverySlotId);

  // Today for date validation
  const today = startOfToday();

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
  const getAvailableTimeSlots = (selectedDate: Date | null) => {
    if (!selectedDate) return [];
    
    // If selected date is today, only show enabled slots
    if (isSameDay(selectedDate, today)) {
      return timeSlots.filter(slot => slot.enabled);
    }
    
    // For future dates, show all slots
    return timeSlots;
  };

  // Select pickup date and reset time slot if needed
  function handlePickupDateSelect(date: Date | null) {
    setPickupDate(date);
    
    // Reset pickup time slot when changing date
    setSelectedPickupSlotId(null);
    
    // Auto-set delivery date to next day if not manually changed
    const newDeliveryDate = date ? addDays(date, 1) : null;
    if (!deliveryDate || (pickupDate && isSameDay(deliveryDate, addDays(pickupDate, 1)))) {
      setDeliveryDate(newDeliveryDate);
    }
    
    updateOrderData({ 
      pickupDate: date,
      deliveryDate: deliveryDate || newDeliveryDate,
      pickupSlotId: null,
      pickupSlotLabel: null,
    });
  }

  // Select delivery date and reset time slot if needed
  function handleDeliveryDateSelect(date: Date | null) {
    setDeliveryDate(date);
    
    // Reset delivery time slot when changing date
    setSelectedDeliverySlotId(null);
    
    updateOrderData({ 
      deliveryDate: date,
      deliverySlotId: null,
      deliverySlotLabel: null,
    });
  }

  // Select pickup time slot
  function handlePickupTimeSlotSelect(timeSlot: TimeSlot) {
    console.log("Selecting pickup time slot:", timeSlot);
    setSelectedPickupSlotId(timeSlot.id);
    
    updateOrderData({
      pickupSlotId: timeSlot.id,
      pickupSlotLabel: timeSlot.label,
    });
  }

  // Select delivery time slot
  function handleDeliveryTimeSlotSelect(timeSlot: TimeSlot) {
    console.log("Selecting delivery time slot:", timeSlot);
    setSelectedDeliverySlotId(timeSlot.id);
    
    updateOrderData({
      deliverySlotId: timeSlot.id,
      deliverySlotLabel: timeSlot.label,
    });
  }

  // Continue to next step - using orderData for validation instead of local state
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

  const availablePickupSlots = getAvailableTimeSlots(pickupDate);
  const availableDeliverySlots = getAvailableTimeSlots(deliveryDate);

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Schedule Pickup & Delivery</h1>
        <p className="text-gray-600 mt-2">Select your preferred pickup and delivery schedule</p>
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
                mode="single"
                selected={pickupDate || undefined}
                onSelect={handlePickupDateSelect}
                disabled={(date) => isBefore(date, today)}
                className="p-3 pointer-events-auto"
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
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery Schedule
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Calendar */}
          <div className="space-y-4">
            <h3 className="font-medium">Select Delivery Date</h3>
            <div className="border rounded-lg p-3 bg-white">
              <Calendar
                mode="single"
                selected={deliveryDate || undefined}
                onSelect={handleDeliveryDateSelect}
                disabled={(date) => isBefore(date, pickupDate || today)}
                className="p-3 pointer-events-auto"
              />
            </div>
            {deliveryDate && isSameDay(deliveryDate, today) && (
              <p className="text-xs text-blue-600">
                Only available time slots are shown for today
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
                      {deliveryDate && isSameDay(deliveryDate, today) 
                        ? "No available time slots for today" 
                        : "No time slots are currently available"
                      }
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
          >
            <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          
          <Button 
            onClick={handleContinue}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 h-auto text-base group"
            disabled={!orderData.pickupDate || !orderData.pickupSlotId || !orderData.deliveryDate || !orderData.deliverySlotId}
          >
            Continue to Confirm
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
