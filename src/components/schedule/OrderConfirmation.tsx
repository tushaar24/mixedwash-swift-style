
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Home, Loader2, Truck } from "lucide-react";
import { OrderData, SelectedService } from "@/pages/Schedule";
import { format } from "date-fns";

interface OrderConfirmationProps {
  orderData: OrderData;
  onBack: () => void;
  onComplete: () => void;
}

export const OrderConfirmation = ({ orderData, onBack, onComplete }: OrderConfirmationProps) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Submit order to Supabase
  const handleSubmitOrder = async () => {
    // Validate that we have all the required information
    if (
      orderData.services.length === 0 || 
      !orderData.addressId || 
      !orderData.pickupDate || 
      !orderData.pickupSlotId ||
      !orderData.deliveryDate ||
      !orderData.deliverySlotId
    ) {
      console.log("Missing data:", {
        services: orderData.services,
        addressId: orderData.addressId,
        pickupDate: orderData.pickupDate,
        pickupSlotId: orderData.pickupSlotId,
        deliveryDate: orderData.deliveryDate,
        deliverySlotId: orderData.deliverySlotId
      });
      
      // Create a more specific error message
      let missingFields = [];
      if (orderData.services.length === 0) missingFields.push("Services");
      if (!orderData.addressId) missingFields.push("Address");
      if (!orderData.pickupDate || !orderData.pickupSlotId) missingFields.push("Pickup schedule");
      if (!orderData.deliveryDate || !orderData.deliverySlotId) missingFields.push("Delivery schedule");
      
      toast({
        title: "Missing information",
        description: `Please complete these steps: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Get the current authenticated user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData || !authData.user) {
        throw new Error("You must be logged in to place an order");
      }
      
      console.log("Creating orders with data:", {
        pickupSlotId: orderData.pickupSlotId,
        deliverySlotId: orderData.deliverySlotId,
        pickupDate: orderData.pickupDate,
        deliveryDate: orderData.deliveryDate
      });

      // First, fetch all available time slots from the database
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from("time_slots")
        .select("id, label, start_time, end_time");
      
      if (timeSlotsError) {
        console.error("Error fetching time slots:", timeSlotsError);
        throw new Error("Could not fetch time slots");
      }

      console.log("Available time slots:", timeSlots);
      
      // Find the correct time slots based on their labels
      let pickupSlotId = null;
      let deliverySlotId = null;
      
      // If time slots exist in the database
      if (timeSlots && timeSlots.length > 0) {
        // First try to match by label
        const pickupSlot = timeSlots.find(slot => 
          slot.label === orderData.pickupSlotLabel
        );
        
        const deliverySlot = timeSlots.find(slot => 
          slot.label === orderData.deliverySlotLabel
        );
        
        if (pickupSlot) {
          pickupSlotId = pickupSlot.id;
          console.log(`Found pickup slot by label: ${pickupSlotId}`);
        }
        
        if (deliverySlot) {
          deliverySlotId = deliverySlot.id;
          console.log(`Found delivery slot by label: ${deliverySlotId}`);
        }
        
        // If we couldn't find by label, try to match by time
        if (!pickupSlotId) {
          // Try to extract time from label
          const pickupTimeMatch = orderData.pickupSlotLabel?.match(/(\d+)(am|pm)\s*-\s*(\d+)(am|pm)/i);
          if (pickupTimeMatch) {
            const startHour = parseInt(pickupTimeMatch[1]);
            const startAmPm = pickupTimeMatch[2].toLowerCase();
            let startTime = startHour;
            if (startAmPm === 'pm' && startHour < 12) startTime += 12;
            if (startAmPm === 'am' && startHour === 12) startTime = 0;
            
            // Find slot with matching start time
            const matchedSlot = timeSlots.find(slot => {
              const slotHour = parseInt(slot.start_time.split(':')[0]);
              return slotHour === startTime;
            });
            
            if (matchedSlot) {
              pickupSlotId = matchedSlot.id;
              console.log(`Found pickup slot by time: ${pickupSlotId}`);
            }
          }
        }
        
        // Same for delivery slot
        if (!deliverySlotId) {
          const deliveryTimeMatch = orderData.deliverySlotLabel?.match(/(\d+)(am|pm)\s*-\s*(\d+)(am|pm)/i);
          if (deliveryTimeMatch) {
            const startHour = parseInt(deliveryTimeMatch[1]);
            const startAmPm = deliveryTimeMatch[2].toLowerCase();
            let startTime = startHour;
            if (startAmPm === 'pm' && startHour < 12) startTime += 12;
            if (startAmPm === 'am' && startHour === 12) startTime = 0;
            
            const matchedSlot = timeSlots.find(slot => {
              const slotHour = parseInt(slot.start_time.split(':')[0]);
              return slotHour === startTime;
            });
            
            if (matchedSlot) {
              deliverySlotId = matchedSlot.id;
              console.log(`Found delivery slot by time: ${deliverySlotId}`);
            }
          }
        }
        
        // If we have default IDs (from client-side), map them to database IDs
        if (!pickupSlotId && orderData.pickupSlotId?.startsWith('default-')) {
          // Extract time from default ID (e.g., default-12pm)
          const timeStr = orderData.pickupSlotId.replace('default-', '');
          const hour = parseInt(timeStr);
          
          // Find matching time slot in database
          const matchedSlot = timeSlots.find(slot => {
            const slotHour = parseInt(slot.start_time.split(':')[0]);
            return slotHour === hour || 
                  (hour === 12 && slotHour === 12) || 
                  (hour === 3 && slotHour === 15) || 
                  (hour === 6 && slotHour === 18);
          });
          
          if (matchedSlot) {
            pickupSlotId = matchedSlot.id;
            console.log(`Mapped default pickup ID to: ${pickupSlotId}`);
          }
        }
        
        if (!deliverySlotId && orderData.deliverySlotId?.startsWith('default-')) {
          const timeStr = orderData.deliverySlotId.replace('default-', '');
          const hour = parseInt(timeStr);
          
          const matchedSlot = timeSlots.find(slot => {
            const slotHour = parseInt(slot.start_time.split(':')[0]);
            return slotHour === hour || 
                  (hour === 12 && slotHour === 12) || 
                  (hour === 3 && slotHour === 15) || 
                  (hour === 6 && slotHour === 18);
          });
          
          if (matchedSlot) {
            deliverySlotId = matchedSlot.id;
            console.log(`Mapped default delivery ID to: ${deliverySlotId}`);
          }
        }
      }
      
      // If we still don't have valid IDs, use the first available slot as fallback
      if (!pickupSlotId && timeSlots && timeSlots.length > 0) {
        pickupSlotId = timeSlots[0].id;
        console.log(`Using first available slot as fallback for pickup: ${pickupSlotId}`);
      }
      
      if (!deliverySlotId && timeSlots && timeSlots.length > 0) {
        deliverySlotId = timeSlots[0].id;
        console.log(`Using first available slot as fallback for delivery: ${deliverySlotId}`);
      }
      
      // If we still don't have valid slot IDs, we can't proceed
      if (!pickupSlotId) {
        throw new Error(`Pickup slot not found for "${orderData.pickupSlotLabel || orderData.pickupSlotId}"`);
      }
      
      if (!deliverySlotId) {
        throw new Error(`Delivery slot not found for "${deliverySlotLabel || orderData.deliverySlotId}"`);
      }

      // Create a separate order for each service
      const orderPromises = orderData.services.map(service => {
        return supabase
          .from("orders")
          .insert([
            {
              service_id: service.id,
              address_id: orderData.addressId,
              pickup_date: format(orderData.pickupDate!, 'yyyy-MM-dd'),
              pickup_slot_id: pickupSlotId,
              delivery_date: format(orderData.deliveryDate!, 'yyyy-MM-dd'),
              delivery_slot_id: deliverySlotId,
              special_instructions: orderData.specialInstructions || null,
              estimated_weight: orderData.estimatedWeight || null,
              total_amount: orderData.estimatedWeight ? (service.price * orderData.estimatedWeight) : null,
              user_id: authData.user.id
            },
          ])
          .select();
      });

      try {
        // Wait for all orders to be created
        const results = await Promise.all(orderPromises);
        
        // Check if any order failed
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error("Order creation errors:", errors);
          throw new Error(`Failed to create ${errors.length} orders`);
        }
        
        toast({
          title: "Orders placed successfully!",
          description: `${orderData.services.length} laundry services have been scheduled`,
        });
        
        onComplete();
      } catch (error: any) {
        console.error("Error during order creation:", error);
        throw error;
      }
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast({
        title: "Error placing order",
        description: error.message || "Something went wrong during order placement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Confirm Your Order</h1>
        <p className="text-gray-600 mt-2">Please review your order details before confirming</p>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 bg-gray-50">
          <h2 className="text-xl font-bold mb-1">Order Summary</h2>
          <p className="text-gray-600">Please check all details are correct</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Services */}
          <div>
            <h3 className="font-bold mb-3">Selected Services</h3>
            <div className="space-y-3">
              {orderData.services.map((service) => (
                <div key={service.id} className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <span className="text-2xl">
                      {service.name.includes("Wash & Fold") ? "👕" : 
                       service.name.includes("Wash & Iron") ? "👔" : 
                       service.name.includes("Heavy Wash") ? "🧺" : "✨"}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold">{service.name}</h4>
                    {orderData.estimatedWeight && (
                      <div className="mt-1">
                        <p className="text-sm">
                          <span className="font-medium">Price:</span> ₹{service.price}/kg
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Estimated Total:</span> ₹{(service.price * orderData.estimatedWeight).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pickup Schedule */}
          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Pickup</h3>
              {orderData.pickupDate && (
                <p className="text-gray-600">
                  {format(orderData.pickupDate, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
              <p className="text-gray-600">{orderData.pickupSlotLabel}</p>
            </div>
          </div>
          
          {/* Delivery Schedule */}
          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Delivery</h3>
              {orderData.deliveryDate && (
                <p className="text-gray-600">
                  {format(orderData.deliveryDate, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
              <p className="text-gray-600">{orderData.deliverySlotLabel}</p>
            </div>
          </div>
          
          {/* Address */}
          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Home className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Pickup & Delivery Address</h3>
              <p className="text-gray-600">Your selected address</p>
            </div>
          </div>
          
          {/* Special Instructions */}
          {orderData.specialInstructions && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="font-bold mb-2">Special Instructions</h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                {orderData.specialInstructions}
              </p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold">Payment</span>
            <span className="text-gray-600">Cash on delivery</span>
          </div>
          
          {orderData.totalAmount !== null && orderData.estimatedWeight && (
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total</span>
              <span>₹{orderData.totalAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-8 flex justify-between">
        <Button 
          onClick={onBack}
          variant="outline"
          className="px-6 py-6 h-auto text-base group"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Schedule
        </Button>
        
        <Button 
          onClick={handleSubmitOrder}
          className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto text-base"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Confirm Order"
          )}
        </Button>
      </div>
    </div>
  );
};
