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
  const [showDiscountAlert, setShowDiscountAlert] = useState(true);
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

  // Scroll tracking effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [user, profile]);

  // Auto-hide discount alert after 1 second - only if user is eligible and alert is showing
  useEffect(() => {
    console.log('Services useEffect triggered:', { loading, isEligibleForDiscount, showDiscountAlert });
    if (!loading && isEligibleForDiscount && showDiscountAlert) {
      console.log('Starting discount alert timer for 1 second');
      const timer = setTimeout(() => {
        console.log('Auto-dismissing discount alert');
        setShowDiscountAlert(false);
      }, 1000);
      return () => {
        console.log('Cleaning up discount alert timer');
        clearTimeout(timer);
      };
    }
  }, [loading, isEligibleForDiscount, showDiscountAlert]);

  const services = [
    {
      title: "Wash & Fold",
      description: "Fresh and folded clothes, ready tomorrow.",
      icon: "👕",
      newPrice: "₹76/kg",
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

  const handleScheduleClick = () => {
    const userInfo = getUserInfo();

    // Track the CTA click event FIRST
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'services_section'
    });

    // Then navigate with a flag to indicate this came from CTA
    navigate("/schedule", { state: { fromCTA: true } });
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
              onClick={() => {
                console.log('Card clicked for service:', service.title, 'with route:', service.route);
                handleServiceClick(service.route, service.title);
              }}
            >
              {/* Enhanced delivery time badge - more prominent */}
              <div className="absolute top-2 right-2 z-20">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 text-sm font-bold animate-pulse">
                  <Clock className="h-4 w-4" />
                  <span>{service.deliveryTime}</span>
                </div>
              </div>
              
              {/* Mobile-only clickable icon button */}
              <div className="md:hidden absolute bottom-3 right-3 z-10">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-8 w-8 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm"
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
                
                {/* Arrow indicator - hidden on mobile to avoid overlap with button */}
                <div className="mt-auto pt-4 flex justify-end hidden md:block">
                  <ArrowRight className="h-5 w-5 text-black group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="bg-black hover:bg-gray-800 text-white group px-6 py-5 h-auto text-base" 
            onClick={handleScheduleClick}
          >
            Schedule a Pickup
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
