
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, BadgePercent, Loader2 } from "lucide-react";
import { OrderData } from "@/pages/Schedule";

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
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(orderData.serviceId);

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

  // Select a service
  const handleServiceSelect = (service: Service) => {
    setSelectedServiceId(service.id);
    updateOrderData({
      serviceId: service.id,
      serviceName: service.name,
      // Use discount_price if available, otherwise use regular price
      servicePrice: service.discount_price !== null ? service.discount_price : service.price,
      // Calculate total amount based on estimated weight (if any)
      totalAmount: orderData.estimatedWeight 
        ? (service.discount_price !== null ? service.discount_price : service.price) * orderData.estimatedWeight 
        : null,
    });
  };

  // Continue to next step
  const handleContinue = () => {
    if (!selectedServiceId) {
      toast({
        title: "Please select a service",
        description: "You need to select a service to continue",
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Select a Service</h1>
        <p className="text-gray-600 mt-2">Choose the laundry service you need</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id}
            className={`transition-all cursor-pointer hover:shadow-md ${
              selectedServiceId === service.id 
                ? "ring-2 ring-black shadow-md" 
                : "hover:scale-[1.01] border-gray-200"
            }`}
            onClick={() => handleServiceSelect(service)}
          >
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="text-4xl mr-4">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                  
                  <div className="mt-2">
                    {service.discount_price !== null ? (
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
                      <div className="font-bold">From ₹{service.price}</div>
                    )}
                  </div>
                </div>
                
                {selectedServiceId === service.id && (
                  <div className="h-6 w-6 bg-black rounded-full flex items-center justify-center">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
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
              updateOrderData({ 
                estimatedWeight: weight,
                totalAmount: weight && orderData.servicePrice 
                  ? weight * orderData.servicePrice 
                  : null
              });
            }}
          />
          <span className="text-gray-600">kg</span>
          
          {orderData.estimatedWeight && orderData.servicePrice && (
            <div className="ml-4 bg-white px-3 py-1 border border-gray-200 rounded-md">
              <span className="font-medium">Estimated Total: </span>
              <span className="text-green-700 font-bold">
                ₹{(orderData.estimatedWeight * orderData.servicePrice).toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-8 flex justify-end">
        <Button 
          onClick={handleContinue}
          className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto text-base group"
          disabled={!selectedServiceId}
        >
          Continue to Address
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
