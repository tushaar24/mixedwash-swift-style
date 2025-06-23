
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useTempCustomerMigration = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAndMigrateTempCustomer = async (userId: string, phoneNumber: string) => {
    if (!phoneNumber?.trim()) return false;
    
    setIsChecking(true);
    
    try {
      console.log("Checking for temp customer data with phone:", phoneNumber);
      
      const { data, error } = await supabase.rpc('migrate_temp_customer_data', {
        user_phone: phoneNumber,
        authenticated_user_id: userId
      });
      
      if (error) {
        console.error("Error checking temp customer data:", error);
        toast({
          title: "Migration Check Failed",
          description: "Could not check for existing customer data.",
          variant: "destructive",
        });
        return false;
      }
      
      if (data) {
        console.log("Temp customer data migrated successfully!");
        toast({
          title: "Data Migrated!",
          description: "Your existing orders and addresses have been linked to your account.",
        });
        return true;
      } else {
        console.log("No temp customer data found for this phone number");
        return false;
      }
    } catch (error) {
      console.error("Error in checkAndMigrateTempCustomer:", error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkAndMigrateTempCustomer,
    isChecking
  };
};
