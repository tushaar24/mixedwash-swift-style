
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear autocomplete when dialog closes
  useEffect(() => {
    if (!isOpen && autocompleteRef.current) {
      autocompleteRef.current = null;
      setSearchValue("");
    }
  }, [isOpen]);

  // Initialize autocomplete when dialog opens and Google is ready
  useEffect(() => {
    if (isOpen && window.google && window.google.maps && window.google.maps.places && inputRef.current && !autocompleteRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current && !autocompleteRef.current) {
          initializeAutocomplete();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, scriptLoaded]);

  useEffect(() => {
    if (isOpen && !window.google) {
      loadGoogleMapsScript();
    } else if (isOpen && window.google) {
      setScriptLoaded(true);
    }
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (window.google && window.google.maps && window.google.maps.places) {
        setScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDSOihPDFQdD9JampWVU_CD6RpdPM4qbnw&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      toast({
        title: "Error loading Google Maps",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    };
    
    window.initGooglePlaces = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setScriptLoaded(true);
      }
    };
    
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    try {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: ['formatted_address', 'address_components', 'place_id', 'geometry', 'name', 'types']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place && (place.formatted_address || place.name)) {
          handlePlaceSelect(place);
        }
      });
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } catch (error) {
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
      console.log("Google Place selected:", place);
      
      // Enhanced address processing for Google Places
      let enhancedAddress = place.formatted_address || place.name;
      
      // If we have address components, try to build a better formatted address
      if (place.address_components && place.address_components.length > 0) {
        const components = place.address_components;
        console.log("Address components:", components);
        
        // Extract components for better parsing
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
        
        // Build a better formatted address
        const addressParts = [];
        if (streetNumber && route) {
          addressParts.push(`${streetNumber} ${route}`);
        } else if (route) {
          addressParts.push(route);
        }
        if (sublocality) addressParts.push(sublocality);
        if (locality) addressParts.push(locality);
        if (administrativeArea) addressParts.push(administrativeArea);
        if (postalCode) addressParts.push(postalCode);
        
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Search Address in India
          </DialogTitle>
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
              placeholder="e.g., Connaught Place, New Delhi or Mumbai Central"
              disabled={isLoading}
              autoComplete="off"
            />
            {!window.google && (
              <p className="text-sm text-orange-600">Loading Google Maps...</p>
            )}
            {window.google && !autocompleteRef.current && (
              <p className="text-sm text-blue-600">Setting up address suggestions...</p>
            )}
            {autocompleteRef.current && (
              <p className="text-sm text-green-600">✓ Address suggestions ready</p>
            )}
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
          
          <p className="text-xs text-gray-500 text-center">
            {autocompleteRef.current ? "Indian address suggestions will appear as you type" : "Loading address suggestions..."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
