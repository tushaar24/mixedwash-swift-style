import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2, AlertCircle, CheckCircle } from "lucide-react";
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [parsePreview, setParsePreview] = useState<ParsedAddress | null>(null);
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

  // Initialize autocomplete when everything is ready - OPTIMIZED
  useEffect(() => {
    if (isOpen && googleReady && inputRef.current && !autocompleteRef.current) {
      console.log("Initializing Google Places Autocomplete...");
      // Reduced delay for faster initialization
      const timer = setTimeout(() => {
        initializeAutocomplete();
      }, 100);
      
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

      // Create new autocomplete instance with optimized settings
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'IN' },
        fields: [
          'formatted_address', 
          'address_components', 
          'place_id', 
          'name', 
          'types'
        ],
        // Remove types restriction for better building/landmark suggestions
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
      
      // Focus the input immediately without delay
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

  const handlePlaceSelect = (place: any) => {
    setIsLoading(true);
    
    try {
      console.log("Processing selected place:", place);
      
      // Use the enhanced AddressParser
      const enhancedResult = AddressParser.enhanceAddressFromPlace(place);
      console.log("Enhanced parsing result:", enhancedResult);
      
      // Format the result for the parent component
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

    // Preview parse the manual input
    const previewResult = AddressParser.parseFromFormattedAddress(searchValue);
    setParsePreview(previewResult);
    
    const validation = AddressParser.validate(previewResult);
    
    if (validation.isValid || previewResult.confidence >= 40) {
      const manualPlace = {
        formatted_address: searchValue,
        address_components: [],
        place_id: ''
      };
      
      handlePlaceSelect(manualPlace);
    } else {
      toast({
        title: "Address seems incomplete",
        description: "Please add more details or try a different format",
        variant: "destructive",
      });
    }
  };

  // Preview parsing as user types
  useEffect(() => {
    if (searchValue.trim().length > 10) {
      const preview = AddressParser.parseFromFormattedAddress(searchValue);
      setParsePreview(preview);
    } else {
      setParsePreview(null);
    }
  }, [searchValue]);

  const getStatusMessage = () => {
    if (!scriptLoaded && !window.google) return "Loading Google Maps...";
    if (scriptLoaded && !googleReady) return "Initializing...";
    if (googleReady && !autocompleteRef.current) return "Setting up suggestions...";
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
            />
            <p className={`text-sm ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* Address Preview */}
          {parsePreview && searchValue.length > 10 && (
            <div className="bg-gray-50 border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2">
                {parsePreview.confidence >= 60 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm font-medium">
                  Address Preview ({parsePreview.confidence}% confidence)
                </span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                {parsePreview.address_line1 && (
                  <div>Street: {parsePreview.address_line1}</div>
                )}
                {parsePreview.area && (
                  <div>Area: {parsePreview.area}</div>
                )}
                {parsePreview.city && (
                  <div>City: {parsePreview.city}</div>
                )}
                {parsePreview.state && (
                  <div>State: {parsePreview.state}</div>
                )}
                {parsePreview.postal_code && (
                  <div>PIN: {parsePreview.postal_code}</div>
                )}
              </div>
            </div>
          )}
          
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
