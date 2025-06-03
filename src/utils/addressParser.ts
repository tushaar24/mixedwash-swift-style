export interface ParsedAddress {
  house_building: string;
  address_line1: string;
  address_line2: string;
  area: string;
  city: string;
  state: string;
  postal_code: string;
  quality: 'precise' | 'approximate' | 'fallback';
  confidence: number;
}

export interface ValidationResult {
  isValid: boolean;
  hasRequiredFields: boolean;
  isPinValid: boolean;
  isCityValid: boolean;
  isStateValid: boolean;
  errors: string[];
}

export class AddressParser {
  private static readonly PIN_PATTERNS = [
    /\b(\d{6})\b/,           // Standard 6 digits
    /PIN[:\s]*(\d{6})/i,     // "PIN: 560034"
    /(\d{6})\s*PIN/i,        // "560034 PIN"
    /PINCODE[:\s]*(\d{6})/i  // "PINCODE: 560034"
  ];

  private static readonly STATE_NORMALIZER: Record<string, string> = {
    'karnataka': 'Karnataka',
    'kr': 'Karnataka',
    'tn': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'tamil nadu': 'Tamil Nadu',
    'maharashtra': 'Maharashtra',
    'mh': 'Maharashtra',
    'delhi': 'Delhi',
    'dl': 'Delhi',
    'gujarat': 'Gujarat',
    'gj': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'rj': 'Rajasthan',
    'punjab': 'Punjab',
    'pb': 'Punjab',
    'haryana': 'Haryana',
    'hr': 'Haryana',
    'uttar pradesh': 'Uttar Pradesh',
    'up': 'Uttar Pradesh',
    'west bengal': 'West Bengal',
    'wb': 'West Bengal',
    'odisha': 'Odisha',
    'or': 'Odisha',
    'kerala': 'Kerala',
    'kl': 'Kerala',
    'andhra pradesh': 'Andhra Pradesh',
    'ap': 'Andhra Pradesh',
    'telangana': 'Telangana',
    'ts': 'Telangana'
  };

  private static readonly CITY_NORMALIZER: Record<string, string> = {
    'bangalore': 'Bengaluru',
    'bombay': 'Mumbai',
    'calcutta': 'Kolkata',
    'madras': 'Chennai',
    'mysore': 'Mysuru',
    'mangalore': 'Mangaluru',
    'hubli': 'Hubballi'
  };

  static parseFromGoogleComponents(components: any[]): ParsedAddress {
    console.log("Parsing from Google components:", components);
    
    const getComponent = (types: string[]) => {
      return components.find(c => types.some(type => c.types.includes(type)))?.long_name || '';
    };

    const getShortComponent = (types: string[]) => {
      return components.find(c => types.some(type => c.types.includes(type)))?.short_name || '';
    };

    // Extract all relevant components
    const streetNumber = getComponent(['street_number']);
    const route = getComponent(['route']);
    const premise = getComponent(['premise']);
    const subpremise = getComponent(['subpremise']);
    const establishment = getComponent(['establishment']);
    const pointOfInterest = getComponent(['point_of_interest']);
    
    // Sublocality levels for area detection
    const sublocality1 = getComponent(['sublocality_level_1', 'sublocality']);
    const sublocality2 = getComponent(['sublocality_level_2']);
    const sublocality3 = getComponent(['sublocality_level_3']);
    const neighborhood = getComponent(['neighborhood']);
    
    const locality = getComponent(['locality']);
    const administrativeArea2 = getComponent(['administrative_area_level_2']);
    const administrativeArea = getComponent(['administrative_area_level_1']);
    const postalCode = getComponent(['postal_code']);
    const country = getComponent(['country']);

    console.log("Extracted components:", {
      streetNumber,
      route,
      premise,
      subpremise,
      establishment,
      pointOfInterest,
      sublocality1,
      sublocality2,
      sublocality3,
      neighborhood,
      locality,
      administrativeArea2,
      administrativeArea,
      postalCode
    });

    // Build house/building info with priority order
    let houseBuilding = '';
    const buildingParts = [];
    
    if (subpremise) buildingParts.push(subpremise); // Flat/Unit number
    if (premise) buildingParts.push(premise); // Building name
    if (establishment && !premise) buildingParts.push(establishment); // Establishment name if no premise
    if (pointOfInterest && !premise && !establishment) buildingParts.push(pointOfInterest); // POI as fallback
    
    houseBuilding = buildingParts.join(', ');

    // Build street address with better logic
    let addressLine1 = '';
    if (streetNumber && route) {
      addressLine1 = `${streetNumber} ${route}`;
    } else if (route) {
      addressLine1 = route;
    } else if (streetNumber) {
      addressLine1 = streetNumber;
    } else if (establishment && !houseBuilding) {
      // If we have establishment but didn't use it for building, use it for street
      addressLine1 = establishment;
    } else if (pointOfInterest && !houseBuilding && !establishment) {
      addressLine1 = pointOfInterest;
    }

    // Area determination with comprehensive fallback
    let area = '';
    const areaCandidates = [
      sublocality1,
      sublocality2, 
      sublocality3,
      neighborhood,
      administrativeArea2 // Sometimes contains area info
    ].filter(Boolean);
    
    // Use the most specific area available
    if (areaCandidates.length > 0) {
      area = areaCandidates[0]; // Most specific first
    }

    // City determination
    let city = locality;
    if (!city && administrativeArea2) {
      // Sometimes city is in administrative_area_level_2
      city = administrativeArea2;
    }

    const result: ParsedAddress = {
      house_building: houseBuilding,
      address_line1: addressLine1,
      address_line2: '',
      area: area,
      city: this.normalizeCity(city),
      state: this.normalizeState(administrativeArea),
      postal_code: postalCode,
      quality: 'precise',
      confidence: 0
    };

    result.confidence = this.calculateConfidence(result);
    console.log("Parsed from components:", result);
    return result;
  }

  static parseFromFormattedAddress(formattedAddress: string): ParsedAddress {
    console.log("Parsing from formatted address:", formattedAddress);
    
    // Split by comma and clean up each part
    const parts = formattedAddress.split(',').map(part => part.trim()).filter(part => part.length > 0);
    console.log("Address parts:", parts);
    
    let extractedData: Partial<ParsedAddress> = {
      house_building: "",
      address_line1: "",
      address_line2: "",
      area: "",
      city: "",
      state: "",
      postal_code: ""
    };

    if (parts.length === 0) {
      extractedData.address_line1 = formattedAddress;
      const result = this.finalizeParsingResult(extractedData, 'fallback');
      console.log("Fallback parsing result:", result);
      return result;
    }

    // Extract PIN code using multiple patterns
    let pinFound = false;
    let stateFromPinPart = '';
    
    for (let i = 0; i < parts.length; i++) {
      for (const pattern of this.PIN_PATTERNS) {
        const pinMatch = parts[i].match(pattern);
        if (pinMatch) {
          extractedData.postal_code = pinMatch[1];
          // Extract state from the same part
          stateFromPinPart = parts[i].replace(pinMatch[0], "").trim();
          pinFound = true;
          // Remove this part from further processing
          parts.splice(i, 1);
          break;
        }
      }
      if (pinFound) break;
    }

    // Remove "India" if it's the last part
    if (parts.length > 0 && parts[parts.length - 1].toLowerCase().includes('india')) {
      parts.pop();
    }

    // Enhanced parsing logic for better area and building extraction
    if (parts.length >= 4) {
      // Format: Building/House, Street, Area, City, (State PIN already processed)
      const firstPart = parts[0];
      const secondPart = parts[1];
      const thirdPart = parts[2];
      const fourthPart = parts[3];
      
      // Check if first part looks like a building/house number
      if (this.looksLikeBuildingInfo(firstPart)) {
        extractedData.house_building = firstPart;
        extractedData.address_line1 = secondPart;
        extractedData.area = thirdPart;
        extractedData.city = fourthPart;
      } else {
        // First part is likely street address
        extractedData.address_line1 = firstPart;
        extractedData.area = secondPart;
        extractedData.city = thirdPart;
        // Fourth part might be district or additional area info
      }
    } else if (parts.length === 3) {
      // Format: Street/Building, Area, City
      const firstPart = parts[0];
      
      if (this.looksLikeBuildingInfo(firstPart)) {
        extractedData.house_building = firstPart;
        // Need to extract street from area or use area as street
        extractedData.address_line1 = parts[1];
        extractedData.city = parts[2];
      } else {
        extractedData.address_line1 = firstPart;
        extractedData.area = parts[1];
        extractedData.city = parts[2];
      }
    } else if (parts.length === 2) {
      // Format: Street/Area, City
      extractedData.address_line1 = parts[0];
      extractedData.city = parts[1];
    } else if (parts.length === 1) {
      // Only one part left
      if (!extractedData.city) {
        extractedData.city = parts[0];
      } else {
        extractedData.address_line1 = parts[0];
      }
    }

    // Set state
    if (stateFromPinPart) {
      extractedData.state = stateFromPinPart;
    }

    const result = this.finalizeParsingResult(extractedData, 'approximate');
    console.log("Formatted address parsing result:", result);
    return result;
  }

  private static looksLikeBuildingInfo(text: string): boolean {
    // Check if text looks like building/house information
    const buildingPatterns = [
      /^\d+/,                    // Starts with number
      /\d+[a-zA-Z]$/,           // Number followed by letter (like 123A)
      /flat|apartment|apt|house|building|bldg|tower|complex/i,
      /^[a-zA-Z]\s*\d+/,        // Letter followed by number (like A 123)
      /floor|flr|#/i,           // Contains floor indicators
    ];
    
    return buildingPatterns.some(pattern => pattern.test(text.trim()));
  }

  private static finalizeParsingResult(data: Partial<ParsedAddress>, quality: 'precise' | 'approximate' | 'fallback'): ParsedAddress {
    // Clean up and normalize
    const cleaned: ParsedAddress = {
      house_building: (data.house_building || "").trim(),
      address_line1: (data.address_line1 || "").trim(),
      address_line2: (data.address_line2 || "").trim(),
      area: (data.area || "").trim(),
      city: this.normalizeCity((data.city || "").trim()),
      state: this.normalizeState((data.state || "").trim()),
      postal_code: (data.postal_code || "").trim(),
      quality,
      confidence: 0
    };

    cleaned.confidence = this.calculateConfidence(cleaned);
    return cleaned;
  }

  private static normalizeCity(city: string): string {
    if (!city) return city;
    const normalized = this.CITY_NORMALIZER[city.toLowerCase()];
    return normalized || this.toTitleCase(city);
  }

  private static normalizeState(state: string): string {
    if (!state) return state;
    const normalized = this.STATE_NORMALIZER[state.toLowerCase()];
    return normalized || this.toTitleCase(state);
  }

  private static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  private static calculateConfidence(address: ParsedAddress): number {
    let score = 0;
    
    if (address.postal_code && /^\d{6}$/.test(address.postal_code)) score += 30;
    if (address.city && address.city.length >= 2) score += 25;
    if (address.state && address.state.length >= 2) score += 20;
    if (address.address_line1 && address.address_line1.length >= 3) score += 15;
    if (address.area && address.area.length >= 2) score += 10;
    
    return Math.min(score, 100);
  }

  static validate(address: ParsedAddress): ValidationResult {
    const errors: string[] = [];
    
    const hasRequiredFields = !!(address.address_line1 && address.city && address.state && address.postal_code);
    const isPinValid = /^\d{6}$/.test(address.postal_code);
    const isCityValid = address.city.length >= 2;
    const isStateValid = address.state.length >= 2;
    
    if (!address.address_line1) errors.push("Street address is required");
    if (!address.city) errors.push("City is required");
    if (!address.state) errors.push("State is required");
    if (!address.postal_code) errors.push("Postal code is required");
    if (address.postal_code && !isPinValid) errors.push("Postal code must be 6 digits");
    if (address.city && !isCityValid) errors.push("City name is too short");
    if (address.state && !isStateValid) errors.push("State name is too short");
    
    return {
      isValid: errors.length === 0,
      hasRequiredFields,
      isPinValid,
      isCityValid,
      isStateValid,
      errors
    };
  }

  static enhanceAddressFromPlace(place: any): ParsedAddress {
    console.log("Enhancing address from place:", place);
    
    // Try structured parsing first
    if (place.address_components && place.address_components.length > 0) {
      const structuredResult = this.parseFromGoogleComponents(place.address_components);
      if (structuredResult.confidence > 60) {
        return structuredResult;
      }
    }
    
    // Fallback to formatted address parsing
    if (place.formatted_address) {
      return this.parseFromFormattedAddress(place.formatted_address);
    }
    
    // Last resort - use place name
    return this.parseFromFormattedAddress(place.name || "");
  }
}
