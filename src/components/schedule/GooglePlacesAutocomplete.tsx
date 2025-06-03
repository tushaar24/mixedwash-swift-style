
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2, AlertCircle, CheckCircle, ArrowRight, Edit } from "lucide-react";
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
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [showPlacePreview, setShowPlacePreview] = useState(false);
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
      setSelectedPlace(null);
      setShowPlacePreview(false);
      setParsePreview(null);
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
    if (isOpen && googleReady && inputRef.current && !autocompleteRef.current && !showPlacePreview) {
      console.log("Initializing Google Places Autocomplete...");
      const timer = setTimeout(() => {
        initializeAutocomplete();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, googleReady, showPlacePreview]);

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
      });

      console.log("Autocomplete instance created successfully");

      // Add place changed listener - this is the key fix
      autocompleteRef.current.addListener('place_changed', () => {
        console.log("Place changed event triggered");
        const place = autocompleteRef.current.getPlace();
        console.log("Selected place from autocomplete:", place);
        
        if (place && (place.formatted_address || place.name)) {
          // Clear the input to show we've captured the selection
          setSearchValue("");
          handlePlaceSelect(place);
        } else {
          console.warn("No valid place selected or incomplete place data");
          toast({
            title: "Invalid selection",
            description: "Please select a valid address from the suggestions",
            variant: "destructive",
          });
        }
      });
      
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

  const handlePlaceSelect = (place: any) => {
    console.log("Processing selected place:", place);
    
    // Parse the place data
    const enhancedResult = AddressParser.enhanceAddressFromPlace(place);
    console.log("Enhanced parsing result:", enhancedResult);
    
    setSelectedPlace(place);
    setParsePreview(enhancedResult);
    setShowPlacePreview(true);
  };

  const handleUseThisAddress = () => {
    if (!selectedPlace || !parsePreview) return;
    
    // Format the result for the parent component
    const enhancedAddress = [
      parsePreview.house_building,
      parsePreview.address_line1,
      parsePreview.area,
      parsePreview.city,
      parsePreview.state && parsePreview.postal_code 
        ? `${parsePreview.state} ${parsePreview.postal_code}`
        : parsePreview.state || parsePreview.postal_code,
      "India"
    ].filter(Boolean).join(", ");
    
    onPlaceSelect({
      formatted_address: enhancedAddress,
      address_components: selectedPlace.address_components || [],
      place_id: selectedPlace.place_id || ''
    });
    
    const confidenceMessage = parsePreview.confidence >= 80 
      ? "High confidence address detected"
      : parsePreview.confidence >= 60 
      ? "Good address match found"
      : "Address found - please review details";
    
    toast({
      title: "Address selected",
      description: `${confidenceMessage} (${parsePreview.confidence}%)`,
    });
    
    onOpenChange(false);
  };

  const handleBackToSearch = () => {
    setShowPlacePreview(false);
    setSelectedPlace(null);
    setParsePreview(null);
    setSearchValue("");
    
    // Reinitialize autocomplete after going back
    setTimeout(() => {
      if (inputRef.current && googleReady) {
        initializeAutocomplete();
      }
    }, 100);
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
        place_id: '',
        name: searchValue
      };
      
      setSelectedPlace(manualPlace);
      setShowPlacePreview(true);
    } else {
      toast({
        title: "Address seems incomplete",
        description: "Please add more details or try a different format",
        variant: "destructive",
      });
    }
  };

  // Handle input changes - prevent clearing when autocomplete is active
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    
    // Only do preview parsing if we're not in autocomplete mode and value is substantial
    if (value.trim().length > 10 && !showPlacePreview && !autocompleteRef.current) {
      const preview = AddressParser.parseFromFormattedAddress(value);
      setParsePreview(preview);
    } else if (!showPlacePreview && value.trim().length <= 10) {
      setParsePreview(null);
    }
  };

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
            {showPlacePreview ? "Confirm Address" : "Search Address in India"}
          </DialogTitle>
          <DialogDescription>
            {showPlacePreview 
              ? "Review the address details below and click 'Use This Address' to continue"
              : "Type building names, landmarks, or addresses to get suggestions"
            }
          </DialogDescription>
        </DialogHeader>

        {!showPlacePreview ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="address-search" className="text-sm font-medium">
                Enter building name, landmark, or full address
              </label>
              <Input
                ref={inputRef}
                id="address-search"
                value={searchValue}
                onChange={handleInputChange}
                placeholder="e.g., Phoenix Mall Bangalore, Brigade Road, or DLF Cyber City Gurgaon"
                disabled={isLoading}
                autoComplete="off"
              />
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusMessage()}
              </p>
            </div>

            {/* Address Preview */}
            {parsePreview && searchValue.length > 10 && !autocompleteRef.current && (
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
        ) : (
          /* Place Preview Section */
          <div className="space-y-4 py-4">
            {/* Selected Place Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">
                    {selectedPlace?.name || "Selected Location"}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {selectedPlace?.formatted_address}
                  </p>
                </div>
              </div>
            </div>

            {/* Parsed Address Details */}
            {parsePreview && (
              <div className="bg-gray-50 border rounded-md p-4">
                <div className="flex items-center gap-2 mb-3">
                  {parsePreview.confidence >= 60 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    Parsed Address Details ({parsePreview.confidence}% confidence)
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {parsePreview.house_building && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Building:</span>
                      <span className="font-medium">{parsePreview.house_building}</span>
                    </div>
                  )}
                  {parsePreview.address_line1 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Street:</span>
                      <span className="font-medium">{parsePreview.address_line1}</span>
                    </div>
                  )}
                  {parsePreview.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{parsePreview.area}</span>
                    </div>
                  )}
                  {parsePreview.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{parsePreview.city}</span>
                    </div>
                  )}
                  {parsePreview.state && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{parsePreview.state}</span>
                    </div>
                  )}
                  {parsePreview.postal_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">PIN Code:</span>
                      <span className="font-medium">{parsePreview.postal_code}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={handleUseThisAddress}
                className="flex-1 bg-black hover:bg-gray-800"
              >
                <Edit className="mr-2 h-4 w-4" />
                Use This Address
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBackToSearch}
              >
                Back
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              Click "Use This Address" to open the address form where you can edit and add more details
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
