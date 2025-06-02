
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, BadgePercent, Loader2 } from "lucide-react";
import { OrderData, SelectedService, DryCleaningItem } from "@/pages/Schedule";
import { DryCleaningItemsDialog } from "./DryCleaningItemsDialog";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  icon: string;
}

interface ServiceSelectionProps {
  orderData: OrderData;
  updateOrderData: (data: Partial<OrderData>) => void;
  onNext: () => void;
}

export const ServiceSelection = ({ orderData, updateOrderData, onNext }: ServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(
    new Set(orderData.services.map(service => service.id))
  );
  const { isEligibleForDiscount, loading: discountLoading } = useDiscountEligibility();

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("name");
          
        if (error) {
          throw error;
        }
        
        setServices(data || []);
      } catch (error: any) {
        toast({
          title: "Error fetching services",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  // Check if dry cleaning service is selected
  const isDryCleaningSelected = () => {
    return services.some(service => 
      selectedServiceIds.has(service.id) && 
      service.name.toLowerCase().includes('dry cleaning')
    );
  };

  // Handle dry cleaning items change
  const handleDryCleaningItemsChange = (items: DryCleaningItem[]) => {
    updateOrderData({ dryCleaningItems: items });
  };

  // Toggle service selection
  const toggleServiceSelection = (service: Service) => {
    const newSelectedServiceIds = new Set(selectedServiceIds);
    
    if (newSelectedServiceIds.has(service.id)) {
      newSelectedServiceIds.delete(service.id);
      
      // If removing dry cleaning service, clear dry cleaning items
      if (service.name.toLowerCase().includes('dry cleaning')) {
        updateOrderData({ dryCleaningItems: [] });
      }
    } else {
      newSelectedServiceIds.add(service.id);
    }
    
    setSelectedServiceIds(newSelectedServiceIds);
    
    // Update selected services in order data
    const selectedServices = services
      .filter(s => newSelectedServiceIds.has(s.id))
      .map(s => ({
        id: s.id,
        name: s.name,
        price: (!discountLoading && isEligibleForDiscount && s.discount_price !== null) ? s.discount_price : s.price,
      }));
    
    // Calculate total amount based on all selected services
    const totalAmount = calculateTotalAmount(selectedServices, orderData.estimatedWeight);
    
    updateOrderData({
      services: selectedServices,
      totalAmount: totalAmount
    });
  };

  // Calculate total amount
  const calculateTotalAmount = (selectedServices: SelectedService[], weight: number | null): number | null => {
    if (!weight || selectedServices.length === 0) return null;
    
    // Calculate total based on all selected services
    return selectedServices.reduce((total, service) => {
      return total + (service.price * weight);
    }, 0);
  };
  
  // Continue to next step with dry cleaning validation
  const handleContinue = () => {
    if (selectedServiceIds.size === 0) {
      toast({
        title: "Please select at least one service",
        description: "You need to select one or more services to continue",
        variant: "destructive"
      });
      return;
    }

    // Check if dry cleaning is selected without any items
    if (isDryCleaningSelected() && orderData.dryCleaningItems.length === 0) {
      toast({
        title: "Dry cleaning items required",
        description: "Please add at least one item for dry cleaning service",
        variant: "destructive"
      });
      return;
    }
    
    onNext();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Select Services</h1>
        <p className="text-gray-600 mt-2">Choose one or more laundry services you need</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`transition-all cursor-pointer hover:shadow-md ${
              selectedServiceIds.has(service.id) 
                ? "ring-2 ring-black shadow-md" 
                : "hover:scale-[1.01] border-gray-200"
            }`}
            onClick={() => toggleServiceSelection(service)}
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={selectedServiceIds.has(service.id)} 
                    onCheckedChange={() => toggleServiceSelection(service)}
                    className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <div className="text-4xl mr-2">{service.icon}</div>
                </div>
                <div className="flex-1 ml-2">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  
                  <div className="mt-2">
                    {!discountLoading && service.discount_price !== null && isEligibleForDiscount ? (
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <span className="font-bold text-green-700">₹{service.discount_price}/kg</span>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium ml-2 flex items-center">
                            <BadgePercent className="h-3 w-3 mr-1" />
                            Save {Math.round((1 - service.discount_price / service.price) * 100)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="line-through">₹{service.price}/kg</span>
                          <span className="ml-1 text-xs">regular price</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-bold">
                        {service.discount_price !== null && !isEligibleForDiscount 
                          ? `₹${service.price}/kg` 
                          : service.name.toLowerCase().includes('dry cleaning')
                            ? `From ₹${service.price}`
                            : `₹${service.price}/kg`
                        }
                      </div>
                    )}
                  </div>
                  
                  {/* Add Items button for dry cleaning */}
                  {selectedServiceIds.has(service.id) && service.name.toLowerCase().includes('dry cleaning') && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <DryCleaningItemsDialog
                        selectedItems={orderData.dryCleaningItems}
                        onItemsChange={handleDryCleaningItemsChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Selected services summary */}
      {orderData.services.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Selected Services ({orderData.services.length})</h3>
          <ul className="space-y-2">
            {orderData.services.map((service) => (
              <li key={service.id} className="flex justify-between items-center">
                <span>{service.name}</span>
                <span className="font-medium">₹{service.price}{!service.name.toLowerCase().includes('dry cleaning') ? '/kg' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Weight estimate input */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Estimated Weight (Optional)</h3>
        <p className="text-sm text-gray-600 mb-3">
          If you know approximately how many kilograms of laundry you have, enter it below for a price estimate.
        </p>
        <div className="flex items-center">
          <input
            type="number"
            min="1"
            step="0.5"
            placeholder="e.g. 5"
            className="border border-gray-300 rounded-md px-3 py-2 mr-2 w-24"
            value={orderData.estimatedWeight || ""}
            onChange={(e) => {
              const weight = parseFloat(e.target.value) || null;
              const totalAmount = weight && orderData.services.length > 0 
                ? calculateTotalAmount(orderData.services, weight)
                : null;
                
              updateOrderData({ 
                estimatedWeight: weight,
                totalAmount: totalAmount
              });
            }}
          />
          <span className="text-gray-600">kg</span>
          
          {orderData.estimatedWeight && orderData.services.length > 0 && orderData.totalAmount && (
            <div className="ml-4 bg-white px-3 py-1 border border-gray-200 rounded-md">
              <span className="font-medium">Estimated Total: </span>
              <span className="text-green-700 font-bold">
                ₹{orderData.totalAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky Continue button at bottom center */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-10">
        <Button 
          onClick={handleContinue}
          className="bg-black hover:bg-gray-800 text-white px-8 py-6 h-auto text-base group min-w-48"
          disabled={selectedServiceIds.size === 0}
        >
          Continue to Address
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
