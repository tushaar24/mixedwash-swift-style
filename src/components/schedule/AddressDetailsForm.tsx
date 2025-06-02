
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AddressDetailsFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress: string;
  onAddressSaved: (address: any) => void;
}

export const AddressDetailsForm = ({ isOpen, onOpenChange, initialAddress, onAddressSaved }: AddressDetailsFormProps) => {
  const [formData, setFormData] = useState({
    house_building: "",
    address_line1: "",
    address_line2: "",
    area: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const extractAddressComponents = (fullAddress: string) => {
    console.log("Extracting address from:", fullAddress);
    
    // More sophisticated parsing for Indian addresses
    const parts = fullAddress.split(',').map(part => part.trim());
    
    let extractedData = {
      address_line1: "",
      area: "",
      city: "",
      state: "",
      postal_code: ""
    };

    if (parts.length >= 2) {
      // For Indian addresses, typically:
      // Format: Street/Road, Area/Locality, City, State PIN
      
      // Extract PIN code (usually 6 digits at the end)
      const lastPart = parts[parts.length - 1];
      const pinMatch = lastPart.match(/\b\d{6}\b/);
      if (pinMatch) {
        extractedData.postal_code = pinMatch[0];
        // Remove PIN from the last part to get state
        extractedData.state = lastPart.replace(pinMatch[0], "").trim();
      } else if (parts.length >= 2) {
        // If no PIN found, assume last part is state
        extractedData.state = lastPart;
      }

      // Extract city (second last part, or last if no PIN)
      if (parts.length >= 3) {
        const cityIndex = pinMatch ? parts.length - 2 : parts.length - 1;
        extractedData.city = parts[cityIndex];
      } else if (parts.length === 2 && !pinMatch) {
        extractedData.city = parts[1];
      }

      // Extract area/locality (usually before city)
      if (parts.length >= 4) {
        extractedData.area = parts[parts.length - 3];
      } else if (parts.length === 3 && pinMatch) {
        extractedData.area = parts[0];
      }

      // Extract street address (first part or combination of first parts)
      if (parts.length >= 4) {
        extractedData.address_line1 = parts.slice(0, parts.length - 3).join(", ");
      } else if (parts.length === 3) {
        extractedData.address_line1 = parts[0];
      } else if (parts.length === 2) {
        extractedData.address_line1 = parts[0];
      } else {
        extractedData.address_line1 = fullAddress;
      }
    } else {
      // Fallback: put everything in address_line1
      extractedData.address_line1 = fullAddress;
    }

    // Clean up empty strings and trim
    Object.keys(extractedData).forEach(key => {
      extractedData[key as keyof typeof extractedData] = extractedData[key as keyof typeof extractedData].trim();
    });

    console.log("Extracted address data:", extractedData);
    return extractedData;
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.address_line1 || !formData.city || !formData.state || !formData.postal_code) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData || !authData.user) {
        throw new Error("You must be logged in to add an address");
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert([{
          ...formData,
          user_id: authData.user.id
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // If setting this as default, update other addresses
        if (formData.is_default) {
          await supabase
            .from("addresses")
            .update({ is_default: false })
            .neq("id", data[0].id);
        }

        toast({
          title: "Address saved",
          description: "Your address has been saved successfully",
        });

        onAddressSaved(data[0]);
        onOpenChange(false);
        
        // Reset form
        setFormData({
          house_building: "",
          address_line1: "",
          address_line2: "",
          area: "",
          city: "",
          state: "",
          postal_code: "",
          is_default: false
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-populate fields when initialAddress changes
  useEffect(() => {
    if (initialAddress && isOpen) {
      console.log("Initial address received:", initialAddress);
      const extracted = extractAddressComponents(initialAddress);
      setFormData(prev => ({
        ...prev,
        ...extracted
      }));
    }
  }, [initialAddress, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Address Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="house_building" className="text-sm font-medium">
              House/Flat No., Building Name
            </label>
            <Input
              id="house_building"
              name="house_building"
              value={formData.house_building}
              onChange={handleInputChange}
              placeholder="e.g., 123, ABC Apartments"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address_line1" className="text-sm font-medium">
              Street Address *
            </label>
            <Input
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              placeholder="Street Name, Road"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="area" className="text-sm font-medium">
              Area/Locality
            </label>
            <Input
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., HSR Sector 6, Koramangala"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address_line2" className="text-sm font-medium">
              Landmark (Optional)
            </label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="Near Metro Station, Opposite Mall"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City *
              </label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="state" className="text-sm font-medium">
                State *
              </label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="State"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="postal_code" className="text-sm font-medium">
              Postal Code *
            </label>
            <Input
              id="postal_code"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleInputChange}
              placeholder="Postal Code"
              required
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleInputChange}
              className="rounded border-gray-300"
            />
            <label htmlFor="is_default" className="text-sm">
              Set as default address
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black hover:bg-gray-800"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Address"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
