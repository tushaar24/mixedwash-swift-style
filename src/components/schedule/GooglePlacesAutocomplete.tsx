
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2 } from "lucide-react";
import { AddressParser, type ParsedAddress } from "@/utils/addressParser";

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
  const [googleReady, setGoogleReady] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if Google is already loaded
  useEffect(() => {
    if (window.google && window.google.maps && window.google.maps.places) {
      setGoogleReady(true);
      console.log("Google Maps already loaded and ready");
    } else {
      console.log("Google Maps not yet loaded");
    }
  }, []);

  // Load Google Maps script when dialog opens
  useEffect(() => {
    if (isOpen && !googleReady) {
      console.log("Loading Google Maps script...");
      loadGoogleMapsScript();
    }
  }, [isOpen, googleReady]);

  // Initialize autocomplete when everything is ready
  useEffect(() => {
    if (isOpen && googleReady && inputRef.current && !autocompleteRef.current) {
      console.log("Initializing Google Places Autocomplete...");
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        initializeAutocomplete();
      }, 50);
    }
  }, [isOpen, googleReady]);

  // Clean up when dialog closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Dialog closed, cleaning up autocomplete");
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
      console.log("Input ref:", inputRef.current);
      console.log("Google Places:", window.google?.maps?.places);
      return;
    }

    try {
      console.log("Creating new Autocomplete instance...");
      
      // Clear any existing listeners first
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Create new autocomplete instance
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: ['formatted_address', 'address_components', 'place_id', 'name', 'types', 'geometry'],
        types: ['establishment', 'geocode'] // Allow both places and addresses
      });

      console.log("Autocomplete instance created:", autocompleteRef.current);

      // Add place changed listener
      const listener = autocompleteRef.current.addListener('place_changed', () => {
        console.log("Place changed event triggered");
        const place = autocompleteRef.current.getPlace();
        console.log("Selected place:", place);
        
        if (place && (place.formatted_address || place.name)) {
          handlePlaceSelect(place);
        } else {
          console.warn("No valid place selected or place is incomplete");
          toast({
            title: "Incomplete selection",
            description: "Please select a complete address from the suggestions",
            variant: "destructive",
          });
        }
      });

      console.log("Place changed listener added:", listener);
      
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
        console.log("Input focused for autocomplete");
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

  const handlePlaceSelect = (place: any) => {
    console.log("Processing selected place:", place);
    setIsLoading(true);
    
    try {
      // Parse the place data using the existing parser
      const enhancedResult = AddressParser.enhanceAddressFromPlace(place);
      console.log("Enhanced parsing result:", enhancedResult);
      
      // Format the result for the parent component (AddressSelection)
      const enhancedAddress = [
        enhancedResult.house_building,
        enhancedResult.address_line1,
        enhancedResult.area,
        enhancedResult.city,
        enhancedResult.state && enhancedResult.postal_code 
          ? `${enhancedResult.state} ${enhancedResult.postal_code}`
          : enhancedResult.state || enhancedResult.postal_code,
        "India"
      ].filter(Boolean).join(", ");
      
      // Call the parent's onPlaceSelect with the formatted data
      onPlaceSelect({
        formatted_address: enhancedAddress,
        address_components: place.address_components || [],
        place_id: place.place_id || ''
      });
      
      const confidenceMessage = enhancedResult.confidence >= 80 
        ? "High confidence address detected"
        : enhancedResult.confidence >= 60 
        ? "Good address match found"
        : "Address found - please review details";
      
      toast({
        title: "Address selected",
        description: `${confidenceMessage} (${enhancedResult.confidence}%)`,
      });
      
      // Close the dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error processing place selection:", error);
      toast({
        title: "Error processing address",
        description: "Please try selecting the address again",
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

    setIsLoading(true);
    
    try {
      // Parse the manual input
      const parseResult = AddressParser.parseFromFormattedAddress(searchValue);
      const validation = AddressParser.validate(parseResult);
      
      if (validation.isValid || parseResult.confidence >= 40) {
        // Format the manual address
        const formattedAddress = [
          parseResult.house_building,
          parseResult.address_line1,
          parseResult.area,
          parseResult.city,
          parseResult.state && parseResult.postal_code 
            ? `${parseResult.state} ${parseResult.postal_code}`
            : parseResult.state || parseResult.postal_code,
          "India"
        ].filter(Boolean).join(", ");
        
        // Call the parent's onPlaceSelect
        onPlaceSelect({
          formatted_address: formattedAddress || searchValue,
          address_components: [],
          place_id: ''
        });
        
        toast({
          title: "Address added",
          description: "Manual address has been processed",
        });
        
        onOpenChange(false);
      } else {
        toast({
          title: "Address seems incomplete",
          description: "Please add more details or try a different format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing manual address:", error);
      toast({
        title: "Error processing address",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusMessage = () => {
    if (!googleReady) return "Loading Google Maps...";
    if (googleReady && !autocompleteRef.current) return "Setting up suggestions...";
    if (autocompleteRef.current) return "✓ Ready - Start typing for suggestions";
    return "Getting ready...";
  };

  const getStatusColor = () => {
    if (!googleReady) return "text-orange-600";
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
            Type building names, landmarks, or addresses to get suggestions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="address-search" className="text-sm font-medium">
              Enter building name, landmark, or full address
            </label>
            <Input
              ref={inputRef}
              id="address-search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="e.g., Phoenix Mall Bangalore, Brigade Road, or DLF Cyber City Gurgaon"
              disabled={isLoading}
              autoComplete="off"
              className="w-full"
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
  );
};
