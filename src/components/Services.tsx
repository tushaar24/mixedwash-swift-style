
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Clock, Truck, Info, X, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";
import { useState, useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const Services = () => {
  const navigate = useNavigate();
  const { isEligibleForDiscount, loading } = useDiscountEligibility();
  const [showDiscountAlert, setShowDiscountAlert] = useState(false);
  const { user, profile } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedScrollRef = useRef(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInfo = () => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined;

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasTrackedScrollRef.current) {
          hasTrackedScrollRef.current = true;
          const userInfo = getUserInfo();
          console.log('Quick Services Overview section viewed');
          trackEvent('quick_services_overview_viewed', {
            'customer name': userInfo?.name || 'Anonymous',
            'customer id': userInfo?.user_id || 'Anonymous',
            'current_time': getCurrentTime(),
            'section': 'Quick Services Overview'
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    });
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [user, profile]);

  const services = [{
    title: "Wash & Fold",
    description: "Fresh and folded clothes, ready tomorrow.",
    icon: "👕",
    newPrice: "₹79/kg",
    oldPrice: "₹95/kg",
    discount: 0,
    route: "wash-fold",
    minimumOrder: 4,
    deliveryTime: "24h"
  }, {
    title: "Wash & Iron",
    description: "Your outfits, wrinkle-free and crisp.",
    icon: "👔",
    newPrice: "₹119/kg",
    oldPrice: "₹150/kg",
    discount: 0,
    route: "wash-iron",
    minimumOrder: 3,
    deliveryTime: "24h"
  }, {
    title: "Heavy Wash",
    description: "Big laundry loads handled with ease.",
    icon: "🧺",
    newPrice: "₹109/kg",
    oldPrice: "₹140/kg",
    discount: 0,
    route: "heavy-wash",
    minimumOrder: null,
    deliveryTime: "24-48h"
  }, {
    title: "Dry Cleaning",
    description: "Delicate care, speedy turnaround.",
    icon: <img src="/lovable-uploads/c458f6b0-88cf-4b84-8d9a-10526e393e2d.png" alt="Blazer" className="h-10 w-10" loading="lazy" />,
    newPrice: "starts at ₹100",
    oldPrice: "starts at ₹100",
    discount: 0,
    route: "dry-cleaning",
    minimumOrder: null,
    deliveryTime: "24-48h",
    serviceCharge: "₹50 service fee on orders under ₹250"
  }];

  const handleServiceClick = (route: string, serviceName: string) => {
    console.log('Service card clicked:', { route, serviceName });
    const userInfo = getUserInfo();
    trackEvent('quick_services_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'service_type': serviceName
    });
    console.log('Navigating to service detail:', `/service/${route}`);
    navigate(`/service/${route}`);
  };

  return (
    <section id="services" className="bg-gray-50 py-16 md:py-20" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Services Overview</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer a variety of services to meet all your laundry needs, with next-day delivery standard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
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
              onClick={() => {
                console.log('Card clicked for service:', service.title, 'with route:', service.route);
                handleServiceClick(service.route, service.title);
              }}
            >
              <div className="absolute top-2 right-2 z-20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 text-sm font-bold animate-pulse">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{service.deliveryTime} Delivery</span>
                </div>
              </div>
              
              <div className="md:hidden absolute bottom-3 right-3 z-10">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
                  aria-label={`Learn more about ${service.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service.route, service.title);
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              
              <CardHeader className="pb-2">
                <div className="text-5xl pb-4">
                  {typeof service.icon === 'string' ? service.icon : service.icon}
                </div>
                <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                <div className="font-semibold text-xl text-gray-800">
                  {/* Show old price for old customers, new price for new customers */}
                  {isEligibleForDiscount ? service.oldPrice : service.newPrice}
                </div>
                
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
                
                <div className="mt-auto pt-4 flex justify-end hidden md:block">
                  <ArrowRight className="h-5 w-5 text-black group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
