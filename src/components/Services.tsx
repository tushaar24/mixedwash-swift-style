
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Clock, Truck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      title: "Wash & Fold",
      description: "Fresh and folded clothes, ready tomorrow.",
      icon: "👕",
      newPrice: "₹72/kg",
      oldPrice: "₹95/kg",
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
      discount: 20,
      route: "heavy-wash",
      minimumOrder: null,
      deliveryTime: "24-48h"
    },
    {
      title: "Dry Cleaning",
      description: "Delicate care, speedy turnaround.",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-saree">
        <path d="M18.7 3.8a2.45 2.45 0 0 0-3.4 0L6.8 12.3a3 3 0 0 0 0 4.3l.9.9" />
        <path d="M15.3 7.2 6.8 15.7a3 3 0 0 0 0 4.3l.9.9" />
        <path d="M15.3 7.2a2.45 2.45 0 0 0 3.4 0l.9-.9c2.6-2.6-1.4-6.6-4-4l-2.2 2.2" />
        <path d="M11.5 12a4.5 4.5 0 0 0 6.4 6.4" />
        <path d="M12.8 17.8c-1.1-1.4-3-2.8-4.8-4.5" />
        <path d="m3 14 .5-.5a2.45 2.45 0 0 1 3.4 0 2.45 2.45 0 0 1 0 3.4l-1.8 1.8a1 1 0 0 1-1.4 0L3 18a1 1 0 0 1 0-1.4z" />
        <path d="m7.5 12.2-.7-.7" />
        <line x1="5.5" y1="10.5" x2="4.5" y2="9.5" />
      </svg>,
      newPrice: "starts at ₹100",
      oldPrice: "",
      discount: 0,
      route: "dry-cleaning",
      minimumOrder: null,
      deliveryTime: "24-48h",
      serviceCharge: "A service charge of ₹50 will be applied to orders below ₹250"
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
            <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-amber-800 border border-amber-300">
              <BadgePercent className="h-4 w-4" />
              <span className="text-sm font-semibold">20% OFF on your first order!</span>
            </div>
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
              <CardContent>
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {service.discount > 0 ? (
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
                  <div className="font-semibold text-gray-800">{service.newPrice}</div>
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
                
                {/* Arrow indicator - now always visible */}
                <div className="mt-4 flex justify-end">
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
