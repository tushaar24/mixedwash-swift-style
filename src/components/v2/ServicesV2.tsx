
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Clock, Truck, Info, X, ChevronRight, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";
import { useState, useEffect } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const ServicesV2 = () => {
  const navigate = useNavigate();
  const { isEligibleForDiscount, loading } = useDiscountEligibility();
  const [showDiscountAlert, setShowDiscountAlert] = useState(true);
  const { user, profile } = useAuth();
  
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
  
  // Auto-hide discount alert after 1 second
  useEffect(() => {
    if (!loading && isEligibleForDiscount && showDiscountAlert) {
      const timer = setTimeout(() => {
        setShowDiscountAlert(false);
      }, 1000);
      
      return () => clearTimeout(timer);
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
      deliveryTime: "24h",
      gradient: "from-pink-400 to-purple-500"
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
      deliveryTime: "24h",
      gradient: "from-blue-400 to-cyan-500"
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
      deliveryTime: "24-48h",
      gradient: "from-green-400 to-emerald-500"
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
      serviceCharge: "₹50 service fee on orders under ₹250",
      gradient: "from-orange-400 to-red-500"
    }
  ];

  const handleServiceClick = (route: string, serviceName: string) => {
    const userInfo = getUserInfo();
    
    trackEvent('quick_services_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'service_type': serviceName
    });
    
    navigate(`/service/${route}`);
  };

  const handleScheduleClick = () => {
    const userInfo = getUserInfo();
    
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'services_section_v2'
    });
    
    navigate("/schedule", { state: { fromCTA: true } });
  };

  return (
    <section id="services" className="bg-gradient-to-br from-gray-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full opacity-40 animate-bounce" style={{ animationDuration: '4s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center gap-2 mb-4">
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0s' }}>⚡</span>
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎯</span>
            <span className="text-3xl animate-bounce" style={{ animationDelay: '0.4s' }}>💯</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Quick Services Overview
            </span>
            <Zap className="inline-block ml-2 h-8 w-8 text-yellow-500 animate-pulse" />
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We offer a variety of services to meet all your laundry needs, with next-day delivery standard.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            {!loading && isEligibleForDiscount && showDiscountAlert && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full text-amber-800 border-2 border-amber-300 relative pr-10 animate-pulse">
                <BadgePercent className="h-4 w-4 animate-spin" style={{ animationDuration: '2s' }} />
                <span className="text-sm font-semibold">20% OFF on your first order! 🔥</span>
                <button
                  onClick={() => setShowDiscountAlert(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-200 rounded-full p-1.5 transition-colors hover:bg-amber-300 hover:scale-110"
                  aria-label="Dismiss discount alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full text-blue-800 border-2 border-blue-300">
              <Truck className="h-4 w-4 animate-bounce" />
              <span className="text-sm font-semibold">Free pickup & delivery on all orders! ✨</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative cursor-pointer hover:scale-105 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleServiceClick(service.route, service.title)}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              {/* Delivery time badge with animation */}
              <Badge 
                variant="outline" 
                className="absolute top-3 right-3 bg-white text-gray-800 border-2 border-gray-300 flex items-center gap-1 px-2 py-1 z-10 animate-pulse"
              >
                <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                <span className="text-xs">{service.deliveryTime} delivery</span>
              </Badge>
              
              {/* Floating star */}
              <Star className="absolute top-3 left-3 h-4 w-4 text-yellow-400 animate-pulse" />
              
              {/* Mobile-only clickable icon button */}
              <div className="md:hidden absolute bottom-3 right-3 z-10">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 rounded-full bg-white border-gray-300 hover:bg-gray-50 shadow-sm hover:scale-110 transition-all duration-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleServiceClick(service.route, service.title);
                  }}
                >
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              
              <CardHeader className="pb-2 relative z-10">
                <div className="text-5xl pb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {typeof service.icon === 'string' ? service.icon : service.icon}
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors duration-300">
                  {service.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex flex-col h-full relative z-10">
                <p className="text-gray-600 mb-4">{service.description}</p>
                
                {!loading && service.discount > 0 && isEligibleForDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-green-700">{service.newPrice}</span>
                      <HoverCard>
                        <HoverCardTrigger>
                          <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                            Save 20% on first order 🎉
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
                  <Truck className="h-3 w-3 animate-bounce" />
                  <span>Free pickup & delivery included ✨</span>
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
                
                {/* Arrow indicator - hidden on mobile */}
                <div className="mt-auto pt-4 flex justify-end hidden md:block">
                  <ArrowRight className="h-5 w-5 text-black group-hover:translate-x-2 group-hover:text-purple-600 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white group px-8 py-6 h-auto text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={handleScheduleClick}
          >
            <Zap className="mr-2 h-5 w-5 animate-pulse" />
            Schedule a Pickup 🚀
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};
