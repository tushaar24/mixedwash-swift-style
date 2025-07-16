
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useDiscountEligibility = () => {
  const [isEligibleForDiscount, setIsEligibleForDiscount] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    const checkDiscountEligibility = async () => {
      // New customers don't get discounted pricing anymore - they get new pricing
      setIsEligibleForDiscount(false);
      setLoading(false);
    };

    checkDiscountEligibility();
  }, [user, profile?.mobile_number]);

  return { isEligibleForDiscount, loading };
};
