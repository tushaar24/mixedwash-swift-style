export interface ParsedAddress {
  house_building: string;
  address_line1: string;
  address_line2: string;
  area: string;
  city: string;
  state: string;
  postal_code: string;
  quality: 'exact' | 'approximate' | 'poor';
  confidence: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  hasRequiredFields: boolean;
  isCityValid: boolean;
  isStateValid: boolean;
  isPinValid: boolean;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlace {
  formatted_address?: string;
  address_components?: GoogleAddressComponent[];
  name?: string;
  types?: string[];
}

export class AddressParser {
  private static readonly INDIAN_STATES = [
    'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
    'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
    'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
    'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
    'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
    'andaman and nicobar islands', 'chandigarh', 'dadra and nagar haveli',
    'daman and diu', 'delhi', 'lakshadweep', 'puducherry'
  ];

  private static readonly INDIAN_CITIES = [
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'ahmedabad', 'chennai',
    'kolkata', 'surat', 'pune', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
    'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad',
    'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik',
    'faridabad', 'meerut', 'rajkot', 'kalyan-dombivli', 'vasai-virar',
    'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
    'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore',
    'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai',
    'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur'
  ];

  static parseFromFormattedAddress(formattedAddress: string): ParsedAddress {
    console.log("Parsing formatted address:", formattedAddress);
    
    const parts = formattedAddress.split(',').map(part => part.trim());
    
    const result: ParsedAddress = {
      house_building: "",
      address_line1: "",
      address_line2: "",
      area: "",
      city: "",
      state: "",
      postal_code: "",
      quality: 'approximate',
      confidence: 0
    };

    // Extract postal code (6 digits)
    const postalCodeMatch = formattedAddress.match(/\b(\d{6})\b/);
    if (postalCodeMatch) {
      result.postal_code = postalCodeMatch[1];
    }

    // Extract state
    const stateFound = this.INDIAN_STATES.find(state => 
      formattedAddress.toLowerCase().includes(state)
    );
    if (stateFound) {
      result.state = this.capitalizeWords(stateFound);
    }

    // Extract city
    const cityFound = this.INDIAN_CITIES.find(city => 
      formattedAddress.toLowerCase().includes(city)
    );
    if (cityFound) {
      result.city = this.capitalizeWords(cityFound);
    }

    // Process remaining parts for address lines and area
    const filteredParts = parts.filter(part => {
      const lowerPart = part.toLowerCase();
      return !this.INDIAN_STATES.includes(lowerPart) && 
             !this.INDIAN_CITIES.includes(lowerPart) &&
             !/\b\d{6}\b/.test(part) &&
             part.length > 0;
    });

    if (filteredParts.length > 0) {
      result.address_line1 = filteredParts[0];
    }
    if (filteredParts.length > 1) {
      result.area = filteredParts[1];
    }
    if (filteredParts.length > 2) {
      result.address_line2 = filteredParts[2];
    }

    result.confidence = this.calculateConfidence(result);
    
    console.log("Parsed result:", result);
    return result;
  }

  static parseFromGoogleComponents(addressComponents: GoogleAddressComponent[]): ParsedAddress {
    console.log("Parsing Google address components:", addressComponents);
    
    const result: ParsedAddress = {
      house_building: "",
      address_line1: "",
      address_line2: "",
      area: "",
      city: "",
      state: "",
      postal_code: "",
      quality: 'exact',
      confidence: 0
    };

    // Parse each component based on its type
    for (const component of addressComponents) {
      const types = component.types;
      const longName = component.long_name;
      const shortName = component.short_name;

      if (types.includes('street_number')) {
        result.house_building = longName;
      } else if (types.includes('route')) {
        result.address_line1 = result.house_building 
          ? `${result.house_building}, ${longName}` 
          : longName;
      } else if (types.includes('sublocality_level_2') || types.includes('sublocality_level_1')) {
        if (!result.area) {
          result.area = longName;
        }
      } else if (types.includes('locality')) {
        result.city = longName;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = longName;
      } else if (types.includes('postal_code')) {
        result.postal_code = longName;
      } else if (types.includes('neighborhood') || types.includes('sublocality')) {
        if (!result.area) {
          result.area = longName;
        }
      }
    }

    // If address_line1 is empty, use area or any available location info
    if (!result.address_line1 && result.area) {
      result.address_line1 = result.area;
      result.area = "";
    }

    result.confidence = this.calculateConfidence(result);
    
    console.log("Parsed Google components result:", result);
    return result;
  }

  static enhanceAddressFromPlace(place: GooglePlace): ParsedAddress {
    console.log("Enhancing address from Google place:", place);
    
    let result: ParsedAddress;
    
    // First try to parse from address components if available
    if (place.address_components && place.address_components.length > 0) {
      result = this.parseFromGoogleComponents(place.address_components);
    } else {
      // Fallback to parsing formatted address
      const addressToParse = place.formatted_address || place.name || "";
      result = this.parseFromFormattedAddress(addressToParse);
    }

    // Enhance with place name if it's more specific than what we found
    if (place.name && place.types) {
      const isEstablishment = place.types.includes('establishment') || 
                             place.types.includes('point_of_interest') ||
                             place.types.includes('store');
      
      if (isEstablishment && !result.address_line2) {
        result.address_line2 = place.name;
      } else if (isEstablishment && !result.address_line1.includes(place.name)) {
        result.address_line1 = place.name;
      }
    }

    // Update quality based on source
    if (place.address_components && place.address_components.length > 0) {
      result.quality = 'exact';
    } else {
      result.quality = 'approximate';
    }

    // Recalculate confidence after enhancement
    result.confidence = this.calculateConfidence(result);
    
    console.log("Enhanced place result:", result);
    return result;
  }

  static calculateConfidence(address: ParsedAddress): number {
    let score = 0;
    const weights = {
      postal_code: 25,
      city: 25,
      state: 20,
      address_line1: 15,
      area: 10,
      house_building: 5
    };

    if (address.postal_code && /^\d{6}$/.test(address.postal_code)) {
      score += weights.postal_code;
    }
    
    if (address.city && this.INDIAN_CITIES.includes(address.city.toLowerCase())) {
      score += weights.city;
    } else if (address.city) {
      score += weights.city * 0.5; // Partial credit for unknown cities
    }
    
    if (address.state && this.INDIAN_STATES.includes(address.state.toLowerCase())) {
      score += weights.state;
    } else if (address.state) {
      score += weights.state * 0.5; // Partial credit for unknown states
    }
    
    if (address.address_line1) score += weights.address_line1;
    if (address.area) score += weights.area;
    if (address.house_building) score += weights.house_building;

    return Math.round(score);
  }

  static validate(address: ParsedAddress): ValidationResult {
    const errors: string[] = [];
    
    // Required fields validation
    const hasRequiredFields = !!(address.address_line1 && address.city && address.state && address.postal_code);
    if (!address.address_line1) errors.push("Street address is required");
    if (!address.city) errors.push("City is required");
    if (!address.state) errors.push("State is required");
    if (!address.postal_code) errors.push("Postal code is required");

    // Postal code validation
    const isPinValid = /^\d{6}$/.test(address.postal_code);
    if (address.postal_code && !isPinValid) {
      errors.push("Postal code must be 6 digits");
    }

    // City validation (check if it's a known Indian city)
    const isCityValid = !address.city || this.INDIAN_CITIES.includes(address.city.toLowerCase());
    if (address.city && !isCityValid) {
      // Don't add error for unknown cities, just mark as invalid for styling
    }

    // State validation (check if it's a known Indian state)
    const isStateValid = !address.state || this.INDIAN_STATES.includes(address.state.toLowerCase());
    if (address.state && !isStateValid) {
      // Don't add error for unknown states, just mark as invalid for styling
    }

    return {
      isValid: hasRequiredFields && isPinValid,
      errors,
      hasRequiredFields,
      isCityValid,
      isStateValid,
      isPinValid
    };
  }

  private static capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
}
