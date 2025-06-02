
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
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !window.google) {
      loadGoogleMapsScript();
    } else if (isOpen && window.google) {
      initializeAutocomplete();
    }
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDSOihPDFQdD9JampWVU_CD6RpdPM4qbnw&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    
    window.initGooglePlaces = () => {
      if (isOpen) {
        initializeAutocomplete();
      }
    };
    
    document.head.appendChild(script);
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'address_components', 'place_id']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place && place.formatted_address) {
        handlePlaceSelect(place);
      }
    });
  };

  const handlePlaceSelect = (place: any) => {
    setIsLoading(true);
    
    try {
      onPlaceSelect({
        formatted_address: place.formatted_address,
        address_components: place.address_components || [],
        place_id: place.place_id
      });
      
      toast({
        title: "Address selected",
        description: "Please fill in additional details",
      });
      
      onOpenChange(false);
    } catch (error) {
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

    // Fallback for manual search if autocomplete fails
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
            Search Address
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address-search" className="text-sm font-medium">
              Start typing your address
            </label>
            <Input
              ref={inputRef}
              id="address-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="e.g., 123 Main Street, City, State"
              disabled={isLoading}
            />
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
            Address suggestions will appear as you type
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
