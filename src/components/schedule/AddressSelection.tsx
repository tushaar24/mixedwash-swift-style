import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Plus, Edit3, Trash2, Navigation } from "lucide-react";
import { GooglePlacesAutocomplete } from './GooglePlacesAutocomplete';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '91234',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    street: '456 Office Rd',
    city: 'Techville',
    state: 'WA',
    zipCode: '98765',
    isDefault: false,
  },
];

interface AddressSelectionProps {
  onNext: (address: Address) => void;
  onBack: () => void;
}

interface GooglePlaceResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({ onNext, onBack }) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>(mockAddresses);
  const [mode, setMode] = useState<'selection' | 'edit' | 'add' | 'edit-detected'>('selection');
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Address>({
    id: '',
    label: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false,
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<Address | null>(null);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address details
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: latitude, lng: longitude } },
            (results, status) => {
              setIsGettingLocation(false);
              
              if (status === 'OK' && results && results[0]) {
                const result = results[0] as GooglePlaceResult;
                const addressComponents = result.address_components;
                
                // Parse address components
                let street = '';
                let city = '';
                let state = '';
                let zipCode = '';
                
                addressComponents.forEach(component => {
                  const types = component.types;
                  if (types.includes('street_number') || types.includes('route')) {
                    street += component.long_name + ' ';
                  } else if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_1')) {
                    state = component.long_name;
                  } else if (types.includes('postal_code')) {
                    zipCode = component.long_name;
                  }
                });

                const detectedAddress: Address = {
                  id: 'current-location',
                  label: 'Current Location',
                  street: street.trim(),
                  city,
                  state,
                  zipCode,
                  isDefault: false
                };

                setDetectedAddress(detectedAddress);
                setMode('edit-detected');
              } else {
                console.error('Geocoding failed:', status);
              }
            }
          );
        },
        (error) => {
          setIsGettingLocation(false);
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const handlePlaceSelect = (place: any) => {
    const addressComponents = place.address_components;
    
    let street = '';
    let city = '';
    let state = '';
    let zipCode = '';
    
    addressComponents.forEach((component: any) => {
      const types = component.types;
      if (types.includes('street_number') || types.includes('route')) {
        street += component.long_name + ' ';
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const searchedAddress: Address = {
      id: 'searched-location',
      label: 'Searched Location',
      street: street.trim(),
      city,
      state,
      zipCode,
      isDefault: false
    };

    setDetectedAddress(searchedAddress);
    setMode('edit-detected');
  };

  const handleSaveAddress = () => {
    if (newAddress.label && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
      const newId = String(Date.now());
      const addressToAdd = { ...newAddress, id: newId };
      setSavedAddresses([...savedAddresses, addressToAdd]);
      setNewAddress({ id: '', label: '', street: '', city: '', state: '', zipCode: '', isDefault: false });
      setMode('selection');
    } else {
      alert('Please fill in all fields.');
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressToEdit(address);
    setNewAddress(address);
    setMode('edit');
  };

  const handleDeleteAddress = (id: string) => {
    setSavedAddresses(savedAddresses.filter(address => address.id !== id));
  };

  const handleSelectAddress = (address: Address) => {
    onNext(address);
  };

  const handleManualEntry = () => {
    setMode('add');
  };

  const renderEditForm = (address: Address, onChange: (address: Address) => void, onSave: () => void) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="label" className="text-black">Label</Label>
        <Input
          id="label"
          value={address.label}
          onChange={(e) => onChange({ ...address, label: e.target.value })}
          className="border-gray-300 text-black"
        />
      </div>
      <div>
        <Label htmlFor="street" className="text-black">Street</Label>
        <Input
          id="street"
          value={address.street}
          onChange={(e) => onChange({ ...address, street: e.target.value })}
          className="border-gray-300 text-black"
        />
      </div>
      <div>
        <Label htmlFor="city" className="text-black">City</Label>
        <Input
          id="city"
          value={address.city}
          onChange={(e) => onChange({ ...address, city: e.target.value })}
          className="border-gray-300 text-black"
        />
      </div>
      <div>
        <Label htmlFor="state" className="text-black">State</Label>
        <Input
          id="state"
          value={address.state}
          onChange={(e) => onChange({ ...address, state: e.target.value })}
          className="border-gray-300 text-black"
        />
      </div>
      <div>
        <Label htmlFor="zipCode" className="text-black">Zip Code</Label>
        <Input
          id="zipCode"
          value={address.zipCode}
          onChange={(e) => onChange({ ...address, zipCode: e.target.value })}
          className="border-gray-300 text-black"
        />
      </div>
      <Button onClick={onSave} className="w-full bg-black text-white hover:bg-gray-800">
        Save Address
      </Button>
    </div>
  );

  if (mode === 'edit-detected') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Confirm Your Address</h2>
          <p className="text-gray-600">Please review and edit your address details if needed.</p>
        </div>

        {renderEditForm(detectedAddress!, (address) => {
          setDetectedAddress(address);
        }, () => {
          onNext(detectedAddress!);
        })}

        <Button 
          variant="outline" 
          onClick={() => setMode('selection')}
          className="w-full border-gray-300 text-black hover:bg-gray-50"
        >
          Back to Address Options
        </Button>
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Edit Address</h2>
          <p className="text-gray-600">Edit your saved address details.</p>
        </div>

        {renderEditForm(newAddress, (address) => {
          setNewAddress(address);
        }, () => {
          if (newAddress.label && newAddress.street && newAddress.city && newAddress.state && newAddress.zipCode) {
            const updatedAddresses = savedAddresses.map(address =>
              address.id === newAddress.id ? newAddress : address
            );
            setSavedAddresses(updatedAddresses);
            setMode('selection');
          } else {
            alert('Please fill in all fields.');
          }
        })}

        <Button 
          variant="outline" 
          onClick={() => setMode('selection')}
          className="w-full border-gray-300 text-black hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    );
  }

  if (mode === 'add') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Add New Address</h2>
          <p className="text-gray-600">Enter the address details below.</p>
        </div>

        {renderEditForm(newAddress, (address) => {
          setNewAddress(address);
        }, handleSaveAddress)}

        <Button 
          variant="outline" 
          onClick={() => setMode('selection')}
          className="w-full border-gray-300 text-black hover:bg-gray-50"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Where should we pick up your laundry?</h2>
        <p className="text-gray-600">Choose your pickup address</p>
      </div>

      {/* Primary Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" onClick={handleCurrentLocation}>
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <Navigation className="h-6 w-6 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Use Current Location</h3>
                <p className="text-sm text-gray-600 mt-1">We'll detect your location automatically</p>
              </div>
              {isGettingLocation && (
                <p className="text-sm text-gray-500">Getting your location...</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:border-gray-300 transition-colors">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-gray-100 rounded-full">
                <Search className="h-6 w-6 text-black" />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-black mb-2">Search for Address</h3>
                <GooglePlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-black mb-3">Saved Addresses</h3>
          <div className="space-y-2">
            {savedAddresses.map((address) => (
              <Card key={address.id} className="border-gray-200 hover:border-gray-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1" onClick={() => handleSelectAddress(address)}>
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div className="cursor-pointer flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-black">{address.label}</span>
                          {address.isDefault && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="text-gray-400 hover:text-black"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manual Entry Option */}
      <Card className="border-gray-200 hover:border-gray-300 transition-colors cursor-pointer" onClick={handleManualEntry}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Plus className="h-5 w-5 text-gray-400" />
            <span className="text-black font-medium">Add address manually</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 border-gray-300 text-black hover:bg-gray-50"
        >
          Back
        </Button>
      </div>
    </div>
  );
};
