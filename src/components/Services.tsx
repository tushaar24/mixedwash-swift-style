import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Clock, Truck, Info, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";
import { useState, useEffect } from "react";

export const Services = () => {
  const navigate = useNavigate();
  const { isEligibleForDiscount, loading } = useDiscountEligibility();
  const [showDiscountAlert, setShowDiscountAlert] = useState(true);
  
  // Auto-hide discount alert after 50ms
  useEffect(() => {
    if (!loading && isEligibleForDiscount && showDiscountAlert) {
      const timer = setTimeout(() => {
        setShowDiscountAlert(false);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [loading, isEligibleForDiscount, showDiscountAlert]);
  
  const services = [
    {
      title: "Wash & Fold",
      description: "Fresh and folded clothes, ready tomorrow.",
      icon: "👕",
      newPrice: "₹72/kg",
      oldPrice: "₹95/kg",
      regularPrice: "₹95/kg",
      discount: 20,
      route: "wash-fold",
      minimumOrder: 4,
      deliveryTime: "24h"
    },
    {
      title: "Wash & Iron",
      description: "Your outfits, wrinkle-free and crisp.",
      icon: "👔",
      newPrice: "₹120/kg",
      oldPrice: "₹150/kg",
      regularPrice: "₹150/kg",
      discount: 20,
      route: "wash-iron",
      minimumOrder: 3,
      deliveryTime: "24h"
    },
    {
      title: "Heavy Wash",
      description: "Big laundry loads handled with ease.",
      icon: "🧺",
      newPrice: "₹112/kg",
      oldPrice: "₹140/kg",
      regularPrice: "₹140/kg",
      discount: 20,
      route: "heavy-wash",
      minimumOrder: null,
      deliveryTime: "24-48h"
    },
    {
      title: "Dry Cleaning",
      description: "Delicate care, speedy turnaround.",
      icon: <img src="/lovable-uploads/c458f6b0-88cf-4b84-8d9a-10526e393e2d.png" alt="Blazer" className="h-10 w-10" />,
      newPrice: "starts at ₹100",
      oldPrice: "",
      regularPrice: "starts at ₹100",
      discount: 0,
      route: "dry-cleaning",
      minimumOrder: null,
      deliveryTime: "24-48h",
      serviceCharge: "₹50 service fee on orders under ₹250"
    }
  ];

  const handleServiceClick = (route: string) => {
    navigate(`/service/${route}`);
  };

  return (
    <section id="services" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Quick Services Overview</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We offer a variety of services to meet all your laundry needs, with next-day delivery standard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            {!loading && isEligibleForDiscount && showDiscountAlert && (
              <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-amber-800 border border-amber-300 relative pr-10">
                <BadgePercent className="h-4 w-4" />
                <span className="text-sm font-semibold">20% OFF on your first order!</span>
                <button
                  onClick={() => setShowDiscountAlert(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-200 rounded-full p-1.5 transition-colors hover:bg-amber-300"
                  aria-label="Dismiss discount alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-800 border border-blue-300">
              <Truck className="h-4 w-4" />
              <span className="text-sm font-semibold">Free pickup & delivery on all orders!</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="border-none shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden relative cursor-pointer hover:scale-105 group"
              onClick={() => handleServiceClick(service.route)}
            >
              {/* Delivery time badge - updated with dynamic time */}
              <Badge 
                variant="outline" 
                className="absolute top-3 right-3 bg-gray-100 text-gray-800 border border-gray-300 flex items-center gap-1 px-2 py-1 z-10"
              >
                <Clock className="h-3 w-3" />
                <span className="text-xs">{service.deliveryTime} delivery</span>
              </Badge>
              
              <CardHeader className="pb-2">
                <div className="text-5xl pb-4">
                  {typeof service.icon === 'string' ? service.icon : service.icon}
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {!loading && service.discount > 0 && isEligibleForDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-green-700">{service.newPrice}</span>
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Save 20% on first order
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent className="p-2 text-xs w-48">
                          Discount applied for first-time customers! Regular price is {service.oldPrice}.
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="line-through">{service.oldPrice}</span>
                      <span className="ml-1 text-xs">regular price</span>
                    </div>
                  </div>
                ) : (
                  <div className="font-semibold text-gray-800">
                    {service.regularPrice}
                  </div>
                )}
                
                <div className="mt-3 text-xs text-blue-700 flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>Free pickup & delivery included</span>
                </div>
                
                {service.minimumOrder && (
                  <div className="mt-2 text-xs text-orange-700 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>Min. order: {service.minimumOrder}kg</span>
                  </div>
                )}
                
                {service.serviceCharge && (
                  <div className="mt-2 text-xs text-red-700 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <span>{service.serviceCharge}</span>
                  </div>
                )}
                
                {/* Arrow indicator with consistent positioning */}
                <div className="mt-auto pt-4 flex justify-end">
                  <ArrowRight className="h-5 w-5 text-black group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="bg-black hover:bg-gray-800 text-white group px-6 py-5 h-auto text-base"
            onClick={() => navigate("/schedule")}
          >
            Schedule a Pickup
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
