import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, BadgePercent, Loader2, Clock, Eye } from "lucide-react";
import { ScheduleOrderData, SelectedService, DryCleaningItem } from "@/pages/Schedule";
import { DryCleaningItemsDialog } from "./DryCleaningItemsDialog";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  icon: string;
}

interface ServiceSelectionProps {
  orderData: ScheduleOrderData;
  updateOrderData: (data: Partial<ScheduleOrderData>) => void;
  onNext: () => void;
}

// Helper function to get minimum kg for each service
const getMinimumKg = (serviceName: string): number | null => {
  const name = serviceName.toLowerCase();
  if (name.includes('wash & fold') || name.includes('wash fold')) return 4;
  if (name.includes('wash & iron') || name.includes('wash iron')) return 3;
  if (name.includes('heavy wash')) return 4;
  return null;
};

// Helper function to get delivery time for each service
const getDeliveryTime = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('wash & fold') || name.includes('wash fold')) return '24h';
  if (name.includes('wash & iron') || name.includes('wash iron')) return '24h';
  if (name.includes('heavy wash')) return '24-48h';
  if (name.includes('dry cleaning')) return '24-48h';
  return '24h';
};

// Helper function to get service route for navigation
const getServiceRoute = (serviceName: string): string => {
  const name = serviceName.toLowerCase();
  if (name.includes('wash & fold') || name.includes('wash fold')) return 'wash-fold';
  if (name.includes('wash & iron') || name.includes('wash iron')) return 'wash-iron';
  if (name.includes('heavy wash')) return 'heavy-wash';
  if (name.includes('dry cleaning')) return 'dry-cleaning';
  return 'wash-fold';
};

// Helper function to get correct pricing based on customer eligibility and service name
const getServicePricing = (service: Service, isEligibleForDiscount: boolean) => {
  const serviceName = service.name.toLowerCase();
  
  if (isEligibleForDiscount) {
    // Old customers see old pricing
    if (serviceName.includes('wash & fold') || serviceName.includes('wash fold')) {
      return 95;
    }
    if (serviceName.includes('wash & iron') || serviceName.includes('wash iron')) {
      return 150;
    }
    if (serviceName.includes('heavy wash')) {
      return 140;
    }
    if (serviceName.includes('dry cleaning')) {
      return service.price; // Keep original price for dry cleaning
    }
  } else {
    // New customers see new pricing
    if (serviceName.includes('wash & fold') || serviceName.includes('wash fold')) {
      return 79;
    }
    if (serviceName.includes('wash & iron') || serviceName.includes('wash iron')) {
      return 119;
    }
    if (serviceName.includes('heavy wash')) {
      return 109;
    }
    if (serviceName.includes('dry cleaning')) {
      return service.price; // Keep original price for dry cleaning
    }
  }
  
  // Fallback to service price
  return service.price;
};

// Helper function to sort services in the desired order
const sortServices = (services: Service[]): Service[] => {
  const serviceOrder = ['wash & fold', 'wash & iron', 'dry cleaning', 'heavy wash'];
  return services.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    let aIndex = serviceOrder.findIndex(order => aName.includes(order));
    let bIndex = serviceOrder.findIndex(order => bName.includes(order));

    if (aIndex === -1) aIndex = serviceOrder.length;
    if (bIndex === -1) bIndex = serviceOrder.length;
    return aIndex - bIndex;
  });
};

export const ServiceSelection = ({
  orderData,
  updateOrderData,
  onNext
}: ServiceSelectionProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceIds, setSelectedServiceIds] = useState<Set<string>>(new Set(orderData.services.map(service => service.id)));
  const { user } = useAuth();
  const {
    isEligibleForDiscount,
    loading: discountLoading
  } = useDiscountEligibility();
  const navigate = useNavigate();

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("services").select("*");
        if (error) {
          throw error;
        }

        const sortedServices = sortServices(data || []);
        setServices(sortedServices);
      } catch (error: any) {
        toast({
          title: "Error fetching services",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Check if dry cleaning service is selected
  const isDryCleaningSelected = () => {
    return services.some(service => selectedServiceIds.has(service.id) && service.name.toLowerCase().includes('dry cleaning'));
  };

  // Handle dry cleaning items change
  const handleDryCleaningItemsChange = (items: DryCleaningItem[]) => {
    updateOrderData({
      dryCleaningItems: items
    });
  };

  // Handle view details click
  const handleViewDetails = (service: Service, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    const route = getServiceRoute(service.name);
    navigate(`/service/${route}`);
  };

  // Toggle service selection
  const toggleServiceSelection = (service: Service) => {
    const newSelectedServiceIds = new Set(selectedServiceIds);
    if (newSelectedServiceIds.has(service.id)) {
      newSelectedServiceIds.delete(service.id);

      if (service.name.toLowerCase().includes('dry cleaning')) {
        updateOrderData({ dryCleaningItems: [] });
      }
    } else {
      newSelectedServiceIds.add(service.id);
    }
    setSelectedServiceIds(newSelectedServiceIds);

    // Use the correct pricing based on customer eligibility
    // For unauthenticated users, show new customer pricing
    const selectedServices = services.filter(s => newSelectedServiceIds.has(s.id)).map(s => {
      const price = user ? getServicePricing(s, isEligibleForDiscount) : getServicePricing(s, false);
      return {
        id: s.id,
        name: s.name,
        price: price
      };
    });
    
    updateOrderData({
      services: selectedServices
    });
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

    if (isDryCleaningSelected() && orderData.dryCleaningItems.length === 0) {
      toast({
        title: "Dry cleaning items required",
        description: "Please add at least one item for dry cleaning service",
        variant: "destructive"
      });
      return;
    }

    // Check authentication before proceeding
    if (!user) {
      navigate("/auth", { 
        state: { 
          fromSchedule: true,
          orderData: orderData
        }
      });
      return;
    }

    // If authenticated, proceed to next step
    onNext();
  };

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
        {services.map(service => {
          const minimumKg = getMinimumKg(service.name);
          const deliveryTime = getDeliveryTime(service.name);
          
          // Get the correct display price based on customer eligibility
          // For unauthenticated users, show new customer pricing
          const displayPrice = user ? getServicePricing(service, isEligibleForDiscount) : getServicePricing(service, false);
          
          return (
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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-lg">{service.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => handleViewDetails(service, e)} 
                        className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 h-auto"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                    
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-semibold border border-green-200">
                        <Clock className="h-4 w-4" />
                        <span>{deliveryTime} delivery</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                    
                    <div className="mb-3">
                      <div className="font-bold">
                        {service.name.toLowerCase().includes('dry cleaning') 
                          ? `From ₹${displayPrice}` 
                          : `₹${displayPrice}/kg`}
                      </div>
                      
                      {minimumKg && (
                        <div className="text-xs text-gray-500 mt-1">
                          Min {minimumKg}kg
                        </div>
                      )}
                    </div>
                    
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
          );
        })}
      </div>
      
      {/* Selected services summary */}
      {orderData.services.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Selected Services ({orderData.services.length})</h3>
          <ul className="space-y-2">
            {orderData.services.map(service => (
              <li key={service.id} className="flex justify-between items-center">
                <span>{service.name}</span>
                <span className="font-medium">₹{service.price}{!service.name.toLowerCase().includes('dry cleaning') ? '/kg' : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Sticky Continue button at bottom center */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-center z-10">
        <Button 
          onClick={handleContinue} 
          disabled={selectedServiceIds.size === 0} 
          className="bg-black hover:bg-gray-800 text-white h-auto text-base group min-w-48 py-[12px] px-[48px]"
        >
          Continue to Address
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
