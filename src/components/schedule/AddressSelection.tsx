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
import { ArrowLeft, ArrowRight, Home, Loader2, Plus, Locate } from "lucide-react";
import { AddressParser } from "@/utils/addressParser";

interface Address {
  id: string;
  house_building?: string;
  address_line1: string;
  address_line2?: string;
  area?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
  latitude?: number;
  longitude?: number;
}

export interface OrderData {
  services: any[];
  addressId: string | null;
  pickupDate: Date | null;
  pickupSlotId: string | null;
  pickupSlotLabel: string | null;
  deliveryDate: Date | null;
  deliverySlotId: string | null;
  deliverySlotLabel: string | null;
  specialInstructions: string;
  estimatedWeight: number | null;
  totalAmount: number | null;
  dryCleaningItems: any[];
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
  const [locatingUser, setLocatingUser] = useState(false);
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    house_building: "",
    address_line1: "",
    address_line2: "",
    area: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
    latitude: null as number | null,
    longitude: null as number | null,
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

  // Reverse geocode coordinates to get address using Google Geocoding API
  const reverseGeocode = async (latitude: number, longitude: number) => {
    const GOOGLE_API_KEY = "AIzaSyDSOihPDFQdD9JampWVU_CD6RpdPM4qbnw";
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch address from coordinates');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        console.log("Geocoding result:", result);
        
        // Use the AddressParser to parse the address properly
        const parsedAddress = AddressParser.parseFromGoogleComponents(result.address_components);
        
        // Convert to the format expected by the form, including coordinates
        return {
          house_building: parsedAddress.house_building,
          address_line1: parsedAddress.address_line1,
          address_line2: parsedAddress.address_line2,
          area: parsedAddress.area,
          city: parsedAddress.city,
          state: parsedAddress.state,
          postal_code: parsedAddress.postal_code,
          is_default: addresses.length === 0, // Make it default if it's the first address
          latitude: latitude, // Save the actual coordinates
          longitude: longitude,
        };
      } else {
        throw new Error(data.error_message || 'No address found for these coordinates');
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
  };

  // Get user's current location and reverse geocode it
  const handleUseCurrentLocation = () => {
    console.log("Starting geolocation request...");
    
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    setLocatingUser(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log("Location obtained:", position.coords);
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode the coordinates
          const addressData = await reverseGeocode(latitude, longitude);
          
          // Populate the form with the geocoded address (including coordinates)
          setNewAddress(addressData);
          
          // Open the address dialog for editing
          setDialogOpen(true);
          
          toast({
            title: "Location found",
            description: "Address has been populated. Please review and edit if needed.",
          });
          
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          toast({
            title: "Address lookup failed",
            description: "Could not determine address from your location. Please enter it manually.",
            variant: "destructive",
          });
          
          // Still open the dialog for manual entry
          setDialogOpen(true);
        } finally {
          setLocatingUser(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocatingUser(false);
        
        let errorMessage = "Could not access your location";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location services and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try searching for an address instead.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or search manually.";
            break;
          default:
            errorMessage = "An unexpected error occurred while getting your location.";
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  // Select an address
  const handleAddressSelect = (address: Address) => {
    setSelectedAddressId(address.id);
    updateOrderData({ addressId: address.id });
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
      
      // Prepare the data for insertion, including coordinates if available
      const addressDataToInsert = {
        ...newAddress,
        user_id: authData.user.id,
        latitude: newAddress.latitude,
        longitude: newAddress.longitude,
      };
      
      const { data, error } = await supabase
        .from("addresses")
        .insert([addressDataToInsert])
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
          house_building: "",
          address_line1: "",
          address_line2: "",
          area: "",
          city: "",
          state: "",
          postal_code: "",
          is_default: false,
          latitude: null,
          longitude: null,
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
        <h1 className="text-2xl font-bold">Select Pickup Address</h1>
        <p className="text-gray-600 mt-2">Choose where we should pick up your laundry</p>
      </div>
      
      {/* Primary Address Options */}
      <div className="space-y-4">
        {/* Use Current Location */}
        <Button 
          onClick={handleUseCurrentLocation}
          disabled={locatingUser}
          className="w-full h-16 bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-3 text-lg font-medium"
        >
          {locatingUser ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Locate className="h-6 w-6" />
          )}
          {locatingUser ? "Getting your location..." : "Use Current Location"}
        </Button>

        {/* Manual Entry Option */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full h-16 border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center gap-3 text-lg font-medium"
            >
              <Plus className="h-6 w-6" />
              Enter Address Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="house_building" className="text-sm font-medium">
                  House/Flat No., Building Name
                </label>
                <Input 
                  id="house_building"
                  name="house_building"
                  value={newAddress.house_building}
                  onChange={handleAddressChange}
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
                  value={newAddress.address_line1}
                  onChange={handleAddressChange}
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
                  value={newAddress.area}
                  onChange={handleAddressChange}
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
                  value={newAddress.address_line2}
                  onChange={handleAddressChange}
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

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-8 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span>OR CHOOSE FROM SAVED ADDRESSES</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
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
                      <h3 className="font-bold">
                        {address.house_building && `${address.house_building}, `}
                        {address.address_line1}
                      </h3>
                      {address.is_default && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    {address.address_line2 && (
                      <p className="text-sm text-gray-600">{address.address_line2}</p>
                    )}
                    {address.area && (
                      <p className="text-sm text-gray-600">{address.area}</p>
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
      )}
      
      {/* Manual Entry Option */}
      {/* <div className="pt-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Enter Address Manually
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add a New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="house_building" className="text-sm font-medium">
                  House/Flat No., Building Name
                </label>
                <Input 
                  id="house_building"
                  name="house_building"
                  value={newAddress.house_building}
                  onChange={handleAddressChange}
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
                  value={newAddress.address_line1}
                  onChange={handleAddressChange}
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
                  value={newAddress.area}
                  onChange={handleAddressChange}
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
                  value={newAddress.address_line2}
                  onChange={handleAddressChange}
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
      </div> */}
      
      {/* Back button */}
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
      
      {/* Sticky Continue button */}
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
