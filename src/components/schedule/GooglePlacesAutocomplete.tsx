import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if Google is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setScriptLoaded(true);
      setGoogleReady(true);
      console.log("Google Maps already loaded and ready");
    }
  }, []);

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
    }
  }, [isOpen]);

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
    if (isOpen && googleReady && inputRef.current && !autocompleteRef.current) {
      console.log("Initializing Google Places Autocomplete...");
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeAutocomplete();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, googleReady]);

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
        setScriptLoaded(true);
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
        fields: ['formatted_address', 'address_components', 'place_id', 'geometry', 'name', 'types'],
        types: ['address'] // Focus on addresses
      });

      console.log("Autocomplete instance created successfully");

      // Add place changed listener
      autocompleteRef.current.addListener('place_changed', () => {
        console.log("Place changed event triggered");
        const place = autocompleteRef.current.getPlace();
        console.log("Selected place:", place);
        
        if (place && (place.formatted_address || place.name)) {
          handlePlaceSelect(place);
        } else {
          console.warn("No valid place selected");
        }
      });
      
      // Focus the input after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          console.log("Input focused");
        }
      }, 100);
      
    } catch (error) {
      console.error("Error initializing autocomplete:", error);
      toast({
        title: "Error initializing address search",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    }
  };

  const handlePlaceSelect = (place: any) => {
    setIsLoading(true);
    
    try {
      console.log("Processing selected place:", place);
      
      let enhancedAddress = place.formatted_address || place.name;
      
      if (place.formatted_address) {
        enhancedAddress = place.formatted_address;
      } else if (place.address_components && place.address_components.length > 0) {
        const components = place.address_components;
        console.log("Processing address components:", components);
        
        const streetNumber = components.find((c: any) => c.types.includes('street_number'))?.long_name || '';
        const route = components.find((c: any) => c.types.includes('route'))?.long_name || '';
        const sublocality = components.find((c: any) => 
          c.types.includes('sublocality_level_1') || 
          c.types.includes('sublocality_level_2') ||
          c.types.includes('sublocality')
        )?.long_name || '';
        const locality = components.find((c: any) => c.types.includes('locality'))?.long_name || '';
        const administrativeArea = components.find((c: any) => 
          c.types.includes('administrative_area_level_1')
        )?.long_name || '';
        const postalCode = components.find((c: any) => c.types.includes('postal_code'))?.long_name || '';
        const country = components.find((c: any) => c.types.includes('country'))?.long_name || '';
        
        const addressParts = [];
        if (streetNumber && route) {
          addressParts.push(`${streetNumber} ${route}`);
        } else if (route) {
          addressParts.push(route);
        }
        if (sublocality) addressParts.push(sublocality);
        if (locality) addressParts.push(locality);
        if (administrativeArea) {
          if (postalCode) {
            addressParts.push(`${administrativeArea} ${postalCode}`);
          } else {
            addressParts.push(administrativeArea);
          }
        } else if (postalCode) {
          addressParts.push(postalCode);
        }
        if (country) addressParts.push(country);
        
        if (addressParts.length > 0) {
          enhancedAddress = addressParts.join(', ');
        }
      }
      
      onPlaceSelect({
        formatted_address: enhancedAddress,
        address_components: place.address_components || [],
        place_id: place.place_id || ''
      });
      
      toast({
        title: "Address selected",
        description: "Please fill in additional details",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing place:", error);
      toast({
        title: "Error",
        description: "Failed to process the selected address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

    const manualPlace = {
      formatted_address: searchValue,
      address_components: [],
      place_id: ''
    };
    
    handlePlaceSelect(manualPlace);
  };

  const getStatusMessage = () => {
    if (!scriptLoaded && !window.google) return "Loading Google Maps...";
    if (scriptLoaded && !googleReady) return "Initializing Google Places...";
    if (googleReady && !autocompleteRef.current) return "Setting up address suggestions...";
    if (autocompleteRef.current) return "✓ Ready - Start typing for suggestions";
    return "Getting ready...";
  };

  const getStatusColor = () => {
    if (!scriptLoaded) return "text-orange-600";
    if (!googleReady) return "text-blue-600";
    if (!autocompleteRef.current) return "text-blue-600";
    return "text-green-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Search Address in India
          </DialogTitle>
          <DialogDescription>
            Type your address and select from the suggestions that appear
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address-search" className="text-sm font-medium">
              Start typing your Indian address
            </label>
            <Input
              ref={inputRef}
              id="address-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="e.g., HSR Layout, Bangalore or Connaught Place, New Delhi"
              disabled={isLoading}
              autoComplete="off"
            />
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleManualSearch}
              disabled={isLoading || !searchValue.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : "Use This Address"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>
              {googleReady 
                ? "Address suggestions will appear as you type" 
                : "Loading address suggestions..."
              }
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
  );
};
