import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Home, Loader2, Truck, ShoppingBag } from "lucide-react";
import { OrderData, SelectedService } from "@/pages/Schedule";
import { format } from "date-fns";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";

interface OrderConfirmationProps {
  orderData: OrderData;
  onBack: () => void;
  onComplete: () => void;
}

export const OrderConfirmation = ({ orderData, onBack, onComplete }: OrderConfirmationProps) => {
  const [submitting, setSubmitting] = useState(false);
  const { addPhoneNumberToTracking } = useDiscountEligibility();
  
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

      // Create a separate order for each service
      const orderPromises = orderData.services.map(service => {
        return supabase
          .from("orders")
          .insert([
            {
              service_id: service.id,
              address_id: orderData.addressId,
              pickup_date: format(orderData.pickupDate!, 'yyyy-MM-dd'),
              pickup_slot_id: orderData.pickupSlotId,
              delivery_date: format(orderData.deliveryDate!, 'yyyy-MM-dd'),
              delivery_slot_id: orderData.deliverySlotId,
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
        
        // Save dry cleaning items if any
        if (orderData.dryCleaningItems.length > 0) {
          // Find the dry cleaning service order
          const dryCleaningResult = results.find(result => 
            orderData.services.some(service => 
              service.id === result.data?.[0]?.service_id && 
              service.name.toLowerCase().includes('dry cleaning')
            )
          );
          
          if (dryCleaningResult?.data?.[0]) {
            const orderId = dryCleaningResult.data[0].id;
            
            // Insert dry cleaning items
            const itemPromises = orderData.dryCleaningItems.map(item => 
              supabase
                .from("order_dry_cleaning_items")
                .insert([
                  {
                    order_id: orderId,
                    item_name: item.name,
                    item_price: item.price,
                    quantity: item.quantity
                  }
                ])
            );
            
            await Promise.all(itemPromises);
          }
        }
        
        // Add phone number to tracking table after successful order placement
        // This is when we mark that the user has placed their first order
        await addPhoneNumberToTracking();
        
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
          
          {/* Dry Cleaning Items */}
          {orderData.dryCleaningItems.length > 0 && (
            <div className="flex items-start">
              <div className="bg-gray-100 p-2 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <h3 className="font-bold">Dry Cleaning Items</h3>
                <div className="mt-2 space-y-2">
                  {orderData.dryCleaningItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 flex justify-between items-center font-bold text-sm">
                    <span>Items Total</span>
                    <span>₹{orderData.dryCleaningItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
