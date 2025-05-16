
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Home, Loader2, Truck } from "lucide-react";
import { OrderData } from "@/pages/Schedule";
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
      !orderData.serviceId || 
      !orderData.addressId || 
      !orderData.pickupDate || 
      !orderData.pickupSlotId ||
      !orderData.deliveryDate ||
      !orderData.deliverySlotId
    ) {
      toast({
        title: "Missing information",
        description: "Please complete all the previous steps before confirming your order",
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

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            service_id: orderData.serviceId,
            address_id: orderData.addressId,
            pickup_date: format(orderData.pickupDate, 'yyyy-MM-dd'),
            pickup_slot_id: orderData.pickupSlotId,
            delivery_date: format(orderData.deliveryDate, 'yyyy-MM-dd'),
            delivery_slot_id: orderData.deliverySlotId,
            special_instructions: orderData.specialInstructions || null,
            estimated_weight: orderData.estimatedWeight || null,
            total_amount: orderData.totalAmount || null,
            user_id: authData.user.id // Add user_id here
          },
        ])
        .select();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Order placed successfully!",
        description: "Your laundry pickup has been scheduled",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
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
          {/* Service */}
          <div className="flex items-start">
            <div className="bg-gray-100 p-2 rounded-lg">
              <span className="text-2xl">{orderData.serviceName === "Wash & Fold" ? "👕" : 
                orderData.serviceName === "Wash & Iron" ? "👔" : 
                orderData.serviceName === "Heavy Wash" ? "🧺" : "✨"}</span>
            </div>
            <div className="ml-4">
              <h3 className="font-bold">Service</h3>
              <p className="text-gray-600">{orderData.serviceName}</p>
              {orderData.estimatedWeight && orderData.servicePrice && (
                <div className="mt-1">
                  <p className="text-sm">
                    <span className="font-medium">Estimated Weight:</span> {orderData.estimatedWeight}kg
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Price per kg:</span> ₹{orderData.servicePrice}
                  </p>
                  <p className="font-medium">
                    <span>Estimated Total:</span> ₹{(orderData.estimatedWeight * orderData.servicePrice).toFixed(2)}
                  </p>
                </div>
              )}
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
          
          {orderData.totalAmount && (
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
