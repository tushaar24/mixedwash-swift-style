
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDiscountEligibility = () => {
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkDiscountEligibility = async () => {
      if (!profile?.mobile_number) {
        // No mobile number means new customer - show new pricing (no discount)
        setIsEligibleForDiscount(false);
        setLoading(false);
        return;
      }

      try {
        // Check if customer exists in phone_numbers table (old customer)
        const { data: phoneData, error: phoneError } = await supabase
          .from("phone_numbers")
          .select("*")
          .eq("phone", profile.mobile_number)
          .limit(1);

        if (phoneError) {
          console.error("Error checking phone numbers:", phoneError);
          setIsEligibleForDiscount(false);
          setLoading(false);
          return;
        }

        // Check if customer has placed any orders (old customer)
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", user?.id)
          .limit(1);

        if (orderError) {
          console.error("Error checking orders:", orderError);
          setIsEligibleForDiscount(false);
          setLoading(false);
          return;
        }

        // If customer exists in phone_numbers table OR has placed orders, they're an old customer
        // Old customers should see the old pricing (with discount pricing shown)
        const isOldCustomer = (phoneData && phoneData.length > 0) || (orderData && orderData.length > 0);
        setIsEligibleForDiscount(isOldCustomer);
        
      } catch (error) {
        console.error("Error in discount eligibility check:", error);
        setIsEligibleForDiscount(false);
      } finally {
        setLoading(false);
      }
    };

    checkDiscountEligibility();
  }, [user, profile?.mobile_number]);

  return { isEligibleForDiscount, loading };
};
