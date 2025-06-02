
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDiscountEligibility = () => {
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(true);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkDiscountEligibility = async () => {
      // If user is not logged in, show discounts
      if (!user || !profile?.mobile_number) {
        setIsEligibleForDiscount(true);
        return;
      }

      setLoading(true);
      
      try {
        // Check if the user's phone number is in the excluded list
        // Using raw SQL query to avoid TypeScript issues with new table
        const { data, error } = await supabase.rpc('check_phone_exclusion', {
          phone_to_check: profile.mobile_number
        });

        if (error) {
          console.error("Error checking discount eligibility:", error);
          // On error, default to showing discounts
          setIsEligibleForDiscount(true);
          return;
        }

        // If phone number found in excluded list, user is NOT eligible for discounts
        setIsEligibleForDiscount(!data);
      } catch (error) {
        console.error("Error in discount eligibility check:", error);
        // On error, default to showing discounts
        setIsEligibleForDiscount(true);
      } finally {
        setLoading(false);
      }
    };

    checkDiscountEligibility();
  }, [user, profile?.mobile_number]);

  return { isEligibleForDiscount, loading };
};
