
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
    
    // Split by comma and clean up each part
    const parts = fullAddress.split(',').map(part => part.trim()).filter(part => part.length > 0);
    console.log("Address parts:", parts);
    
    let extractedData = {
      address_line1: "",
      area: "",
      city: "",
      state: "",
      postal_code: ""
    };

    if (parts.length === 0) {
      extractedData.address_line1 = fullAddress;
      return extractedData;
    }

    // For Indian addresses from Google Places API, the format is typically:
    // "Street Address, Area/Locality, City, State PIN, Country"
    
    // Extract PIN code (6 digits) from any part
    let pinFound = false;
    for (let i = 0; i < parts.length; i++) {
      const pinMatch = parts[i].match(/\b(\d{6})\b/);
      if (pinMatch) {
        extractedData.postal_code = pinMatch[1];
        // Remove PIN from this part to get state
        const stateWithoutPin = parts[i].replace(pinMatch[0], "").trim();
        if (stateWithoutPin) {
          extractedData.state = stateWithoutPin;
        }
        pinFound = true;
        // Remove this part from further processing
        parts.splice(i, 1);
        break;
      }
    }

    // Remove "India" if it's the last part
    if (parts.length > 0 && parts[parts.length - 1].toLowerCase().includes('india')) {
      parts.pop();
    }

    // Now process remaining parts
    if (parts.length >= 3) {
      // Format: Street, Area, City, (State PIN already processed)
      extractedData.address_line1 = parts[0];
      extractedData.area = parts[1];
      extractedData.city = parts[2];
      
      // If we didn't find PIN/state in a combined part, check if there's a separate state part
      if (!pinFound && parts.length >= 4) {
        extractedData.state = parts[3];
      }
    } else if (parts.length === 2) {
      // Format: Street/Area, City
      extractedData.address_line1 = parts[0];
      extractedData.city = parts[1];
    } else if (parts.length === 1) {
      // Only one part left, could be city or full address
      if (!extractedData.city) {
        extractedData.city = parts[0];
      } else {
        extractedData.address_line1 = parts[0];
      }
    }

    // Clean up empty strings and trim all fields
    Object.keys(extractedData).forEach(key => {
      const value = extractedData[key as keyof typeof extractedData];
      extractedData[key as keyof typeof extractedData] = typeof value === 'string' ? value.trim() : value;
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
