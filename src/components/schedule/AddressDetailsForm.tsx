
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
    address_line1: initialAddress || "",
    address_line2: "",
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
    // Simple parsing - in production, you'd use the Google Places address_components
    const parts = fullAddress.split(',').map(part => part.trim());
    
    if (parts.length >= 3) {
      return {
        address_line1: parts[0] || "",
        city: parts[parts.length - 3] || "",
        state: parts[parts.length - 2] || "",
        postal_code: parts[parts.length - 1] || ""
      };
    }
    
    return {
      address_line1: fullAddress,
      city: "",
      state: "",
      postal_code: ""
    };
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
          address_line1: "",
          address_line2: "",
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
      const extracted = extractAddressComponents(initialAddress);
      setFormData(prev => ({
        ...prev,
        ...extracted
      }));
    }
  }, [initialAddress, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Address Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address_line1" className="text-sm font-medium">
              Address Line 1 *
            </label>
            <Input
              id="address_line1"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleInputChange}
              placeholder="House/Flat No., Building Name, Street"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="address_line2" className="text-sm font-medium">
              Address Line 2 (Optional)
            </label>
            <Input
              id="address_line2"
              name="address_line2"
              value={formData.address_line2}
              onChange={handleInputChange}
              placeholder="Landmark, Area"
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
