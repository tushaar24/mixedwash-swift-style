
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Home, Loader2, MapPin, Plus, Search } from "lucide-react";
import { OrderData } from "@/pages/Schedule";
import { GooglePlacesAutocomplete } from "./GooglePlacesAutocomplete";
import { AddressDetailsForm } from "./AddressDetailsForm";

interface Address {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface AddressSelectionProps {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const AddressSelection = ({ orderData, updateOrderData, onNext, onBack }: AddressSelectionProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(orderData.addressId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [googlePlacesOpen, setGooglePlacesOpen] = useState(false);
  const [addressDetailsOpen, setAddressDetailsOpen] = useState(false);
  const [selectedPlaceAddress, setSelectedPlaceAddress] = useState("");
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Fetch addresses from Supabase
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .order("is_default", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setAddresses(data || []);
        
        // If there's only one address, select it automatically
        if (data && data.length === 1 && !selectedAddressId) {
          setSelectedAddressId(data[0].id);
          updateOrderData({ addressId: data[0].id });
        }
        
        // If there's a default address and no selection, select it
        if (data && data.length > 0 && !selectedAddressId) {
          const defaultAddress = data.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            updateOrderData({ addressId: defaultAddress.id });
          }
        }
      } catch (error: any) {
        toast({
          title: "Error fetching addresses",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, [selectedAddressId, updateOrderData]);

  // Select an address
  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id);
    updateOrderData({ addressId: address.id });
  };

  // Handle Google Places selection
  const handleGooglePlaceSelect = (place: any) => {
    setSelectedPlaceAddress(place.formatted_address);
    setGooglePlacesOpen(false);
    setAddressDetailsOpen(true);
  };

  // Handle address saved from details form
  const handleAddressSaved = (savedAddress: Address) => {
    setAddresses(prev => [...prev, savedAddress]);
    setSelectedAddressId(savedAddress.id);
    updateOrderData({ addressId: savedAddress.id });
    setAddressDetailsOpen(false);
    setSelectedPlaceAddress("");
  };

  // Handle address form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Save new address
  const handleSaveAddress = async () => {
    // Basic validation
    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setSavingAddress(true);
    
    try {
      // Get the current authenticated user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData || !authData.user) {
        throw new Error("You must be logged in to add an address");
      }

      // Check if this is the first address, make it default if so
      if (addresses.length === 0) {
        newAddress.is_default = true;
      }
      
      const { data, error } = await supabase
        .from("addresses")
        .insert([{
          ...newAddress,
          user_id: authData.user.id // Add the user_id here
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // If setting this as default, update other addresses
        if (newAddress.is_default) {
          await supabase
            .from("addresses")
            .update({ is_default: false })
            .neq("id", data[0].id);
        }
        
        toast({
          title: "Address saved",
          description: "Your address has been saved successfully",
        });
        
        // Add the new address to the list and select it
        setAddresses([...addresses, data[0]]);
        setSelectedAddressId(data[0].id);
        updateOrderData({ addressId: data[0].id });
        
        // Close the dialog
        setDialogOpen(false);
        
        // Reset form
        setNewAddress({
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
      setSavingAddress(false);
    }
  };

  // Continue to next step
  const handleContinue = () => {
    if (!selectedAddressId) {
      toast({
        title: "Please select an address",
        description: "You need to select an address or add a new one to continue",
      });
      return;
    }
    
    onNext();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Select a Pickup Address</h1>
        <p className="text-gray-600 mt-2">Choose where we should pick up your laundry</p>
      </div>
      
      {addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card 
              key={address.id}
              className={`transition-all cursor-pointer hover:shadow-md ${
                selectedAddressId === address.id 
                  ? "ring-2 ring-black shadow-md" 
                  : "hover:scale-[1.01] border-gray-200"
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <CardContent className="p-4">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-lg mr-4">
                    <Home className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-bold">{address.address_line1}</h3>
                      {address.is_default && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {address.address_line2 && (
                      <p className="text-sm text-gray-600">{address.address_line2}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postal_code}
                    </p>
                  </div>
                  
                  {selectedAddressId === address.id && (
                    <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium">No addresses found</h3>
          <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
        </div>
      )}
      
      {/* Add new address options */}
      <div className="space-y-3">
        {/* Google Places search button */}
        <Button 
          onClick={() => setGooglePlacesOpen(true)}
          variant="outline" 
          className="w-full border-dashed border-gray-300 py-6 h-auto flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <Search className="h-5 w-5 text-blue-600" />
          <span className="text-blue-700 font-medium">Search Address with Google Places</span>
        </Button>

        {/* Manual address entry */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-dashed border-gray-300 py-6 h-auto flex items-center justify-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Address Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="address_line1" className="text-sm font-medium">
                  Address Line 1 *
                </label>
                <Input 
                  id="address_line1"
                  name="address_line1"
                  value={newAddress.address_line1}
                  onChange={handleAddressChange}
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
                  value={newAddress.address_line2}
                  onChange={handleAddressChange}
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
                    value={newAddress.city}
                    onChange={handleAddressChange}
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
                    value={newAddress.state}
                    onChange={handleAddressChange}
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
                  value={newAddress.postal_code}
                  onChange={handleAddressChange}
                  placeholder="Postal Code"
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={newAddress.is_default}
                  onChange={handleAddressChange}
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
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAddress} 
                disabled={savingAddress}
                className="bg-black hover:bg-gray-800"
              >
                {savingAddress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Google Places Autocomplete Dialog */}
      <GooglePlacesAutocomplete 
        isOpen={googlePlacesOpen}
        onOpenChange={setGooglePlacesOpen}
        onPlaceSelect={handleGooglePlaceSelect}
      />

      {/* Address Details Form Dialog */}
      <AddressDetailsForm 
        isOpen={addressDetailsOpen}
        onOpenChange={setAddressDetailsOpen}
        initialAddress={selectedPlaceAddress}
        onAddressSaved={handleAddressSaved}
      />
      
      {/* Back button (not sticky) */}
      <div className="pt-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="px-6 py-6 h-auto text-base group"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Services
        </Button>
      </div>
      
      {/* Sticky Continue button at bottom center */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-10">
        <Button 
          onClick={handleContinue}
          className="bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto text-base group min-w-48"
          disabled={!selectedAddressId}
        >
          Continue to Schedule
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
