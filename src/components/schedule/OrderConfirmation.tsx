
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Home, Loader2, Truck, ShoppingBag } from "lucide-react";
import { ScheduleOrderData, SelectedService } from "@/pages/Schedule";
import { format } from "date-fns";
import { trackOrderPlaced, trackServiceScheduled } from "@/utils/clevertap";

// Declare dataLayer for GTM
declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface OrderConfirmationProps {
  orderData: ScheduleOrderData;
  onBack: () => void;
  onComplete: () => void;
}

export const OrderConfirmation = ({ orderData, onBack, onComplete }: OrderConfirmationProps) => {
  const [submitting, setSubmitting] = useState(false);
  
  // Submit order to Supabase
  const handleSubmitOrder = async () => {
    console.log("=== ORDER SUBMISSION DEBUG ===");
    console.log("Starting order submission with data:", orderData);
    
    // Validate that we have all the required information
    if (
      orderData.services.length === 0 || 
      !orderData.addressId || 
      !orderData.pickupDate || 
      !orderData.pickupSlotId ||
      !orderData.deliveryDate ||
      !orderData.deliverySlotId
    ) {
      console.log("=== VALIDATION FAILED ===");
      console.log("Missing data:", {
        services: orderData.services,
        servicesLength: orderData.services.length,
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
      
      console.log("Missing fields:", missingFields);
      
      toast({
        title: "Missing information",
        description: `Please complete these steps: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    console.log("=== VALIDATION PASSED ===");
    console.log("All required fields are present");
    
    setSubmitting(true);
    
    try {
      // Get the current authenticated user
      console.log("=== CHECKING AUTHENTICATION ===");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log("Auth data:", authData);
      console.log("Auth error:", authError);
      
      if (authError) {
        console.log("Authentication error:", authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!authData || !authData.user) {
        console.log("No authenticated user found");
        throw new Error("You must be logged in to place an order");
      }
      
      console.log("User authenticated:", authData.user.id);
      
      console.log("=== PREPARING ORDER DATA ===");
      console.log("Creating orders with data:", {
        userId: authData.user.id,
        pickupSlotId: orderData.pickupSlotId,
        deliverySlotId: orderData.deliverySlotId,
        pickupDate: orderData.pickupDate,
        deliveryDate: orderData.deliveryDate,
        addressId: orderData.addressId,
        servicesCount: orderData.services.length
      });

      // Create a separate order for each service
      const orderPromises = orderData.services.map((service, index) => {
        const orderToInsert = {
          service_id: service.id,
          address_id: orderData.addressId,
          pickup_date: format(orderData.pickupDate!, 'yyyy-MM-dd'),
          pickup_slot_id: orderData.pickupSlotId,
          delivery_date: format(orderData.deliveryDate!, 'yyyy-MM-dd'),
          delivery_slot_id: orderData.deliverySlotId,
          special_instructions: orderData.specialInstructions || null,
          user_id: authData.user.id
        };
        
        console.log(`=== ORDER ${index + 1} DATA ===`, orderToInsert);
        
        return supabase
          .from("orders")
          .insert([orderToInsert])
          .select();
      });

      console.log("=== EXECUTING ORDER INSERTS ===");
      console.log(`Creating ${orderPromises.length} orders`);
      
      try {
        // Wait for all orders to be created
        const results = await Promise.all(orderPromises);
        
        console.log("=== ORDER CREATION RESULTS ===");
        console.log("Results:", results);
        
        // Check if any order failed
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          console.error("=== ORDER CREATION ERRORS ===");
          console.error("Errors:", errors);
          throw new Error(`Failed to create ${errors.length} orders. Details: ${JSON.stringify(errors)}`);
        }
        
        console.log("=== ALL ORDERS CREATED SUCCESSFULLY ===");
        console.log(`${results.length} orders created`);
        
        // Get user profile to check phone number
        const { data: profileData } = await supabase
          .from("profiles")
          .select("mobile_number")
          .eq("id", authData.user.id)
          .single();
        
        // Add phone number to phone_numbers table if user has a mobile number and order was successful
        if (profileData?.mobile_number) {
          console.log("=== CHECKING PHONE NUMBER IN PHONE_NUMBERS TABLE ===");
          
          // Check if phone number already exists
          const { data: existingPhone, error: phoneCheckError } = await supabase
            .from("phone_numbers")
            .select("phone")
            .eq("phone", profileData.mobile_number)
            .maybeSingle();
          
          if (phoneCheckError) {
            console.error("Error checking existing phone number:", phoneCheckError);
          } else if (!existingPhone) {
            // Phone number doesn't exist, add it
            console.log("Adding phone number to phone_numbers table:", profileData.mobile_number);
            
            const { error: insertPhoneError } = await supabase
              .from("phone_numbers")
              .insert({ phone: profileData.mobile_number });
            
            if (insertPhoneError) {
              console.error("Error adding phone number to table:", insertPhoneError);
            } else {
              console.log("Phone number successfully added to phone_numbers table");
            }
          } else {
            console.log("Phone number already exists in phone_numbers table");
          }
        }
        
        // Prepare user info for tracking
        const userInfo = {
          user_id: authData.user.id,
          name: authData.user.user_metadata?.full_name || authData.user.user_metadata?.name
        };
        
        // Track order placement in CleverTap
        const totalAmount = orderData.dryCleaningItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Track each service individually
        orderData.services.forEach((service, index) => {
          const orderResult = results[index];
          if (orderResult.data?.[0]) {
            trackServiceScheduled({
              serviceName: service.name,
              serviceId: service.id,
              pickupDate: format(orderData.pickupDate!, 'yyyy-MM-dd'),
              deliveryDate: format(orderData.deliveryDate!, 'yyyy-MM-dd'),
              amount: service.price
            }, userInfo);
          }
        });
        
        // Track overall order if there are dry cleaning items
        if (orderData.dryCleaningItems.length > 0) {
          trackOrderPlaced({
            orderId: results[0]?.data?.[0]?.id || 'unknown',
            amount: totalAmount,
            currency: 'INR',
            items: orderData.dryCleaningItems
          }, userInfo);
        }
        
        // Save dry cleaning items if any
        if (orderData.dryCleaningItems.length > 0) {
          console.log("=== PROCESSING DRY CLEANING ITEMS ===");
          console.log("Dry cleaning items:", orderData.dryCleaningItems);
          
          // Find the dry cleaning service order
          const dryCleaningResult = results.find(result => 
            orderData.services.some(service => 
              service.id === result.data?.[0]?.service_id && 
              service.name.toLowerCase().includes('dry cleaning')
            )
          );
          
          console.log("Dry cleaning result:", dryCleaningResult);
          
          if (dryCleaningResult?.data?.[0]) {
            const orderId = dryCleaningResult.data[0].id;
            console.log("Adding items to order:", orderId);
            
            // Insert dry cleaning items
            const itemPromises = orderData.dryCleaningItems.map(item => {
              const itemToInsert = {
                order_id: orderId,
                item_name: item.name,
                item_price: item.price,
                quantity: item.quantity
              };
              console.log("Inserting item:", itemToInsert);
              
              return supabase
                .from("order_dry_cleaning_items")
                .insert([itemToInsert]);
            });
            
            const itemResults = await Promise.all(itemPromises);
            console.log("Dry cleaning items results:", itemResults);
            
            const itemErrors = itemResults.filter(result => result.error);
            if (itemErrors.length > 0) {
              console.error("Dry cleaning items errors:", itemErrors);
            } else {
              console.log("All dry cleaning items added successfully");
            }
          } else {
            console.log("No dry cleaning service found in results");
          }
        }
        
        console.log("=== ORDER PLACEMENT COMPLETE ===");
        
        // Track conversion for Google Tag Manager (only first time)
        const hasConverted = localStorage.getItem('hasConverted');
        if (!hasConverted) {
          console.log("=== TRACKING FIRST CONVERSION ===");
          
          // Push event to dataLayer for GTM
          if (typeof window !== 'undefined' && window.dataLayer) {
            window.dataLayer.push({
              event: 'first_conversion',
              order_count: orderData.services.length,
              services: orderData.services.map(service => service.name)
            });
            console.log("GTM first_conversion event pushed to dataLayer");
          }
          
          // Set flag in localStorage
          localStorage.setItem('hasConverted', 'true');
          console.log("hasConverted flag set in localStorage");
        } else {
          console.log("User has already converted before, skipping GTM tracking");
        }
        
        toast({
          title: "Orders placed successfully!",
          description: `${orderData.services.length} laundry services have been scheduled`,
        });
        
        onComplete();
      } catch (error: any) {
        console.error("=== ERROR DURING ORDER CREATION ===");
        console.error("Error details:", error);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
        throw error;
      }
    } catch (error: any) {
      console.error("=== FINAL ERROR HANDLER ===");
      console.error("Final error:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error.constructor.name);
      
      toast({
        title: "Error placing order",
        description: error.message || "Something went wrong during order placement",
        variant: "destructive",
      });
    } finally {
      console.log("=== CLEANING UP ===");
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
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> ₹{service.price}{!service.name.toLowerCase().includes('dry cleaning') ? '/kg' : ''}
                    </p>
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
