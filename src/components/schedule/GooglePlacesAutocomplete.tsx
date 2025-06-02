
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
  const [initializationAttempts, setInitializationAttempts] = useState(0);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear autocomplete when dialog closes
  useEffect(() => {
    if (!isOpen && autocompleteRef.current) {
      console.log("Dialog closed, clearing autocomplete");
      autocompleteRef.current = null;
      setSearchValue("");
    }
  }, [isOpen]);

  // Initialize autocomplete when conditions are met
  useEffect(() => {
    if (isOpen && window.google && inputRef.current && !autocompleteRef.current) {
      console.log("Attempting to initialize autocomplete...");
      // Multiple timeouts to ensure proper initialization
      const timer1 = setTimeout(() => {
        if (inputRef.current && !autocompleteRef.current) {
          initializeAutocomplete();
        }
      }, 200);
      
      const timer2 = setTimeout(() => {
        if (inputRef.current && !autocompleteRef.current && initializationAttempts < 3) {
          console.log("Retry autocomplete initialization");
          setInitializationAttempts(prev => prev + 1);
          initializeAutocomplete();
        }
      }, 500);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen, scriptLoaded, initializationAttempts]);

  useEffect(() => {
    console.log("Dialog opened:", isOpen);
    if (isOpen && !window.google) {
      console.log("Loading Google Maps script...");
      loadGoogleMapsScript();
    } else if (isOpen && window.google) {
      console.log("Google Maps already available");
      setScriptLoaded(true);
    }
  }, [isOpen]);

  const loadGoogleMapsScript = () => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      console.log("Google Maps script already exists");
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Places library is available");
        setScriptLoaded(true);
      }
      return;
    }

    console.log("Creating new Google Maps script");
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDSOihPDFQdD9JampWVU_CD6RpdPM4qbnw&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log("Google Maps script loaded successfully");
    };
    
    script.onerror = (error) => {
      console.error("Failed to load Google Maps script:", error);
      toast({
        title: "Error loading Google Maps",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      });
    };
    
    window.initGooglePlaces = () => {
      console.log("Google Maps callback executed");
      if (window.google && window.google.maps && window.google.maps.places) {
        console.log("Google Places library confirmed available");
        setScriptLoaded(true);
      } else {
        console.error("Google Places library not available in callback");
      }
    };
    
    document.head.appendChild(script);
    console.log("Google Maps script added to head");
  };

  const initializeAutocomplete = () => {
    if (!inputRef.current) {
      console.log("Input ref not available");
      return;
    }
    
    if (!window.google) {
      console.log("Google Maps not loaded yet");
      return;
    }
    
    if (!window.google.maps || !window.google.maps.places) {
      console.log("Google Places library not available");
      return;
    }

    try {
      console.log("Initializing autocomplete with input:", inputRef.current);
      
      // Clear any existing autocomplete
      if (autocompleteRef.current) {
        console.log("Clearing existing autocomplete");
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: [], // Remove type restrictions to get all places
        componentRestrictions: { country: 'in' }, // Use lowercase 'in' for India
        fields: ['formatted_address', 'address_components', 'place_id', 'geometry', 'name', 'types']
      });

      console.log("Autocomplete object created:", autocompleteRef.current);

      autocompleteRef.current.addListener('place_changed', () => {
        console.log("Place changed event triggered");
        const place = autocompleteRef.current.getPlace();
        console.log("Selected place:", place);
        if (place && (place.formatted_address || place.name)) {
          handlePlaceSelect(place);
        } else {
          console.log("No place details received or incomplete place data");
        }
      });
      
      // Test if autocomplete is working
      setTimeout(() => {
        if (inputRef.current) {
          console.log("Testing autocomplete with focus");
          inputRef.current.focus();
        }
      }, 100);
      
      console.log("Autocomplete initialized successfully");
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
      onPlaceSelect({
        formatted_address: place.formatted_address || place.name,
        address_components: place.address_components || [],
        place_id: place.place_id
      });
      
      toast({
        title: "Address selected",
        description: "Please fill in additional details",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing place selection:", error);
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

  // Debug information
  const debugInfo = {
    isOpen,
    scriptLoaded,
    hasGoogle: !!window.google,
    hasGoogleMaps: !!(window.google && window.google.maps),
    hasGooglePlaces: !!(window.google && window.google.maps && window.google.maps.places),
    hasAutocomplete: !!autocompleteRef.current,
    hasInputRef: !!inputRef.current,
    initializationAttempts
  };

  console.log("Debug info:", debugInfo);

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
            <div className="text-xs space-y-1">
              {!window.google && (
                <p className="text-orange-600">Loading Google Maps...</p>
              )}
              {window.google && !autocompleteRef.current && (
                <p className="text-blue-600">Setting up address suggestions...</p>
              )}
              {autocompleteRef.current && (
                <p className="text-green-600">✓ Address suggestions ready</p>
              )}
              <p className="text-gray-500">
                Debug: G:{debugInfo.hasGoogle ? '✓' : '✗'} 
                P:{debugInfo.hasGooglePlaces ? '✓' : '✗'} 
                A:{debugInfo.hasAutocomplete ? '✓' : '✗'}
                ({initializationAttempts} attempts)
              </p>
            </div>
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
