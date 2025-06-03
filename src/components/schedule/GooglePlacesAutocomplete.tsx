
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";
import { AddressDetailsForm } from "./AddressDetailsForm";

interface PlaceDetails {
  formatted_address: string;
  address_components: any[];
  place_id: string;
}

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceDetails) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

export const GooglePlacesAutocomplete = ({ onPlaceSelect, isOpen, onOpenChange }: GooglePlacesAutocompleteProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if Google is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleReady(true);
      console.log("Google Maps already loaded and ready");
    }
  }, []);

  // Load Google Maps script when dialog opens
  useEffect(() => {
    if (isOpen && !window.google) {
      console.log("Loading Google Maps script...");
      loadGoogleMapsScript();
    } else if (isOpen && window.google && window.google.maps && window.google.maps.places) {
      setGoogleReady(true);
      console.log("Google Maps is ready");
    }
  }, [isOpen]);

  // Initialize autocomplete when everything is ready
  useEffect(() => {
    if (isOpen && googleReady && inputRef.current && !autocompleteRef.current && !showAddressForm) {
      console.log("Initializing Google Places Autocomplete...");
      initializeAutocomplete();
    }
  }, [isOpen, googleReady, showAddressForm]);

  // Clear autocomplete when dialog closes
  useEffect(() => {
    if (!isOpen) {
      if (autocompleteRef.current) {
        try {
          window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        } catch (error) {
          console.log("Error clearing autocomplete listeners:", error);
        }
        autocompleteRef.current = null;
      }
      setSearchValue("");
      setShowAddressForm(false);
      setSelectedAddress("");
    }
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    // Check if script is already in the document
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log("Google Maps script already exists");
      return;
    }

    console.log("Creating new Google Maps script...");
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDSOihPDFQdD9JampWVU_CD6RpdPM4qbnw&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google Maps script loaded successfully");
    };
    
    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
      toast({
        title: "Error loading Google Maps",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    };
    
    // Global callback function
    window.initGooglePlaces = () => {
      console.log("Google Places callback triggered");
      if (window.google && window.google.maps && window.google.maps.places) {
        setGoogleReady(true);
        console.log("Google Places API is now ready");
      } else {
        console.error("Google Places API not available in callback");
      }
    };
    
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error("Cannot initialize autocomplete - missing requirements");
      return;
    }

    try {
      console.log("Creating new Autocomplete instance...");
      
      // Clear any existing listeners
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Create new autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: [
          'formatted_address', 
          'address_components', 
          'place_id', 
          'name', 
          'types'
        ],
        strictBounds: false,
      });

      console.log("Autocomplete instance created successfully");

      // Set container z-index for proper display
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        (pacContainer as HTMLElement).style.zIndex = '9999';
      }

      // Add place changed listener
      const placeChangedListener = () => {
        console.log("Place changed event triggered");
        try {
          const place = autocompleteRef.current.getPlace();
          console.log("Selected place from autocomplete:", place);
          
          if (place && (place.formatted_address || place.name)) {
            // Set the selected address and show the address form
            setSelectedAddress(place.formatted_address || place.name);
            setShowAddressForm(true);
            setSearchValue(""); // Clear the search input
          } else {
            console.warn("No valid place selected or incomplete place data");
            toast({
              title: "Invalid selection",
              description: "Please select a valid address from the suggestions",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error in place_changed listener:", error);
        }
      };

      autocompleteRef.current.addListener('place_changed', placeChangedListener);
      
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
        console.log("Input focused");
      }
      
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      toast({
        title: "Error initializing address search",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
  };

  const handleManualSearch = () => {
    if (!searchValue.trim()) {
      toast({
        title: "Enter an address",
        description: "Please type an address to search",
        variant: "destructive",
      });
      return;
    }

    // Use the manual input as selected address and show form
    setSelectedAddress(searchValue);
    setShowAddressForm(true);
    setSearchValue("");
  };

  const handleAddressSaved = (address: any) => {
    // Format the address for the parent component
    const formattedAddress = [
      address.house_building,
      address.address_line1,
      address.area,
      address.city,
      address.state && address.postal_code 
        ? `${address.state} ${address.postal_code}`
        : address.state || address.postal_code,
      "India"
    ].filter(Boolean).join(", ");

    onPlaceSelect({
      formatted_address: formattedAddress,
      address_components: [],
      place_id: ''
    });

    // Close both dialogs
    setShowAddressForm(false);
    onOpenChange(false);
  };

  const handleBackToSearch = () => {
    setShowAddressForm(false);
    setSelectedAddress("");
    
    // Reinitialize autocomplete after going back
    setTimeout(() => {
      if (inputRef.current && googleReady) {
        initializeAutocomplete();
      }
    }, 100);
  };

  const getStatusMessage = () => {
    if (!googleReady) return "Loading address suggestions...";
    if (!autocompleteRef.current) return "Setting up suggestions...";
    return "✓ Ready - Start typing for suggestions";
  };

  const getStatusColor = () => {
    if (!googleReady) return "text-orange-600";
    if (!autocompleteRef.current) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <>
      <Dialog open={isOpen && !showAddressForm} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Search Address in India
            </DialogTitle>
            <DialogDescription>
              Type building names, landmarks, or addresses to get suggestions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="address-search" className="text-sm font-medium">
                Enter building name, landmark, or full address
              </label>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="address-search"
                  value={searchValue}
                  onChange={handleInputChange}
                  placeholder="e.g., Phoenix Mall Bangalore, Brigade Road, or DLF Cyber City Gurgaon"
                  autoComplete="off"
                  className="relative z-10"
                />
              </div>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusMessage()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleManualSearch}
                disabled={!searchValue.trim()}
                className="flex-1"
              >
                Use This Address
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>
                {googleReady 
                  ? "Building and landmark suggestions will appear as you type" 
                  : "Loading address suggestions..."
                }
              </p>
              <p className="text-blue-600">
                Try typing: mall names, office complexes, apartment buildings, or landmarks
              </p>
              {!googleReady && (
                <p className="text-orange-500">
                  Make sure you have an internet connection
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddressDetailsForm
        isOpen={showAddressForm}
        onOpenChange={setShowAddressForm}
        initialAddress={selectedAddress}
        onAddressSaved={handleAddressSaved}
      />
    </>
  );
};
