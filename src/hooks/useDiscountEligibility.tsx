
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
        // Check if the user's phone number is in the phone_numbers table
        const { data, error } = await supabase
          .from("phone_numbers")
          .select("phone")
          .eq("phone", profile.mobile_number)
          .maybeSingle();

        if (error) {
          console.error("Error checking discount eligibility:", error);
          // On error, default to showing discounts
          setIsEligibleForDiscount(true);
          return;
        }

        // If phone number found in the table, user is NOT eligible for discounts
        if (data) {
          setIsEligibleForDiscount(false);
        } else {
          // Phone number not found, user is eligible for discounts
          setIsEligibleForDiscount(true);
        }
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

  // Function to add phone number to tracking table when first order is placed
  const addPhoneNumberToTracking = async () => {
    if (!profile?.mobile_number) {
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("phone_numbers")
        .insert({ phone: profile.mobile_number });
        
      if (insertError) {
        console.error("Error adding phone number to table:", insertError);
      } else {
        console.log("Phone number added to discount tracking table");
        // Update local state to reflect that user is no longer eligible for discounts
        setIsEligibleForDiscount(false);
      }
    } catch (insertError) {
      console.error("Error inserting phone number:", insertError);
    }
  };

  return { isEligibleForDiscount, loading, addPhoneNumberToTracking };
};
