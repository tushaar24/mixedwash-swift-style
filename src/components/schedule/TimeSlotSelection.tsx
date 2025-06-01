
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { OrderData } from "@/pages/Schedule";
import { addDays, format, isBefore, startOfToday } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
}

interface TimeSlotSelectionProps {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const TimeSlotSelection = ({ orderData, updateOrderData, onNext, onBack }: TimeSlotSelectionProps) => {
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [pickupDate, setPickupDate] = useState<Date | null>(orderData.pickupDate || new Date());
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<string | null>(orderData.pickupSlotId);

  // Today for date validation
  const today = startOfToday();
  // Next day delivery date
  const deliveryDate = pickupDate ? addDays(pickupDate, 1) : null;

  // Fetch time slots from database
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
          console.log("Fetched time slots:", data);
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

  // Select a date and reset time slot if needed
  const handleDateSelect = (date: Date | null) => {
    setPickupDate(date);
    
    // Reset time slot when changing date
    setSelectedTimeSlotId(null);
    updateOrderData({ 
      pickupDate: date,
      deliveryDate: date ? addDays(date, 1) : null,
      pickupSlotId: null,
      pickupSlotLabel: null,
      deliverySlotId: null,
      deliverySlotLabel: null
    });
  };

  // Select a time slot
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    console.log("Selecting time slot:", timeSlot);
    setSelectedTimeSlotId(timeSlot.id);
    
    // Update both pickup and delivery slot information
    updateOrderData({
      pickupSlotId: timeSlot.id,
      pickupSlotLabel: timeSlot.label,
      // Use same time slot for delivery next day
      deliverySlotId: timeSlot.id,
      deliverySlotLabel: timeSlot.label,
    });
  };

  // Continue to next step
  const handleContinue = () => {
    if (!pickupDate) {
      toast({
        title: "Please select a date",
        description: "You need to select a pickup date to continue",
      });
      return;
    }
    
    if (!selectedTimeSlotId) {
      toast({
        title: "Please select a time slot",
        description: "You need to select a pickup time slot to continue",
      });
      return;
    }
    
    // Get the selected time slot
    const selectedSlot = timeSlots.find(slot => slot.id === selectedTimeSlotId);
    if (!selectedSlot) {
      toast({
        title: "Error with time slot",
        description: "The selected time slot could not be found. Please select again.",
        variant: "destructive",
      });
      return;
    }
    
    // Make a final update to ensure all data is set correctly before continuing
    const updatedOrderData = {
      pickupDate: pickupDate,
      deliveryDate: deliveryDate,
      pickupSlotId: selectedSlot.id,
      pickupSlotLabel: selectedSlot.label,
      deliverySlotId: selectedSlot.id,
      deliverySlotLabel: selectedSlot.label
    };
    
    updateOrderData(updatedOrderData);
    
    // Log the final state for debugging
    console.log("Final order data before continuing:", updatedOrderData);
    
    // Continue to next step
    onNext();
  };

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

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Schedule Pickup & Delivery</h1>
        <p className="text-gray-600 mt-2">Select when you want us to pick up your laundry</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="space-y-4">
          <h2 className="font-medium flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select a Pickup Date
          </h2>
          <div className="border rounded-lg p-3 bg-white">
            <Calendar
              mode="single"
              selected={pickupDate || undefined}
              onSelect={handleDateSelect}
              disabled={(date) => isBefore(date, today)}
              className="p-3 pointer-events-auto"
            />
          </div>
          {pickupDate && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Delivery Date: </span> 
                {deliveryDate && format(deliveryDate, 'EEEE, d MMMM yyyy')}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Your laundry will be delivered the next day in the same time slot
              </p>
            </div>
          )}
        </div>
        
        {/* Time slots */}
        <div className="space-y-4">
          <h2 className="font-medium flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select a Time Slot
          </h2>
          
          {pickupDate ? (
            <div className="space-y-3">
              {timeSlots.map((slot) => (
                <Card 
                  key={slot.id}
                  className={`transition-all cursor-pointer hover:shadow-md ${
                    selectedTimeSlotId === slot.id 
                      ? "ring-2 ring-black shadow-md" 
                      : "hover:scale-[1.01] border-gray-200"
                  }`}
                  onClick={() => handleTimeSlotSelect(slot)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{slot.label}</p>
                      </div>
                      
                      {selectedTimeSlotId === slot.id && (
                        <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">Please select a pickup date first</p>
            </div>
          )}
          
          {pickupDate && selectedTimeSlotId && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Summary: </span> 
                {pickupDate && format(pickupDate, 'EEEE, d MMMM')} • {timeSlots.find(slot => slot.id === selectedTimeSlotId)?.label}
              </p>
              <p className="text-sm mt-1">
                <span className="font-medium">Delivery: </span> 
                {deliveryDate && format(deliveryDate, 'EEEE, d MMMM')} • {timeSlots.find(slot => slot.id === selectedTimeSlotId)?.label}
              </p>
            </div>
          )}
        </div>
      </div>
      
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
            disabled={!pickupDate || !selectedTimeSlotId}
          >
            Continue to Confirm
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
