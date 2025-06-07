import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AddressParser, type ParsedAddress, type ValidationResult } from "@/utils/addressParser";
import { Address } from "@/types/models";

interface AddressDetailsFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress: string;
  onAddressSaved: (address: Address) => void;
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
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [confidence, setConfidence] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value
    };
    setFormData(newData);
    
    // Validate on every change
    const parsedData: ParsedAddress = {
      ...newData,
      quality: 'approximate' as const,
      confidence: 0
    };
    parsedData.confidence = AddressParser['calculateConfidence'](parsedData);
    const validationResult = AddressParser.validate(parsedData);
    
    setValidation(validationResult);
    setConfidence(parsedData.confidence);
  };

  const handleSave = async () => {
    // Validate before saving
    const parsedData: ParsedAddress = {
      ...formData,
      quality: 'approximate' as const,
      confidence: 0
    };
    const validationResult = AddressParser.validate(parsedData);
    
    if (!validationResult.isValid) {
      toast({
        title: "Invalid address information",
        description: validationResult.errors.join(", "),
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
          description: `Address saved with ${confidence}% confidence`,
        });

        onAddressSaved(data[0] as Address);
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
        setValidation(null);
        setConfidence(0);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error saving address",
        description: errorMessage,
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
      const parsed = AddressParser.parseFromFormattedAddress(initialAddress);
      
      setFormData(prev => ({
        ...prev,
        house_building: parsed.house_building,
        address_line1: parsed.address_line1,
        address_line2: parsed.address_line2,
        area: parsed.area,
        city: parsed.city,
        state: parsed.state,
        postal_code: parsed.postal_code
      }));
      
      const validationResult = AddressParser.validate(parsed);
      setValidation(validationResult);
      setConfidence(parsed.confidence);
    }
  }, [initialAddress, isOpen]);

  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return "text-green-600";
    if (conf >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Address Details</DialogTitle>
          {confidence > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {getConfidenceIcon(confidence)}
              <span className={getConfidenceColor(confidence)}>
                Address confidence: {confidence}%
              </span>
            </div>
          )}
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
              className={validation && !validation.hasRequiredFields && !formData.address_line1 ? "border-red-300" : ""}
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
                className={validation && !validation.isCityValid && formData.city ? "border-red-300" : ""}
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
                className={validation && !validation.isStateValid && formData.state ? "border-red-300" : ""}
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
              className={validation && !validation.isPinValid && formData.postal_code ? "border-red-300" : ""}
            />
          </div>

          {validation && validation.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Please fix the following issues:</span>
              </div>
              <ul className="mt-2 text-sm text-red-600">
                {validation.errors.map((error, index) => (
                  <li key={index} className="ml-4">• {error}</li>
                ))}
              </ul>
            </div>
          )}

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
            disabled={saving || (validation && !validation.isValid)}
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
