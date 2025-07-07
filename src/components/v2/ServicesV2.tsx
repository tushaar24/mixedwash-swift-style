
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgePercent, Clock, Truck, Info, X, Zap, Star, Sparkles } from "lucide-react";
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
      gradient: "from-white via-gray-300 to-white",
      bgGlow: "bg-white/20"
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
      gradient: "from-gray-300 via-white to-gray-300",
      bgGlow: "bg-gray-300/20"
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
      gradient: "from-white to-gray-400",
      bgGlow: "bg-white/15"
    },
    {
      title: "Dry Cleaning",
      description: "Delicate care, speedy turnaround.",
      icon: <img src="/lovable-uploads/c458f6b0-88cf-4b84-8d9a-10526e393e2d.png" alt="Blazer" className="h-12 w-12" />,
      newPrice: "starts at ₹100",
      oldPrice: "",
      regularPrice: "starts at ₹100",
      discount: 0,
      route: "dry-cleaning",
      minimumOrder: null,
      deliveryTime: "24-48h",
      serviceCharge: "₹50 service fee on orders under ₹250",
      gradient: "from-gray-400 to-white",
      bgGlow: "bg-gray-400/15"
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
    <section className="bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden py-24">
      {/* Animated background patterns */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_50%)] animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header section */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-white/30 to-gray-300/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-8 py-4">
              <div className="flex justify-center gap-3 mb-4">
                <Zap className="h-8 w-8 text-white animate-pulse" />
                <Star className="h-8 w-8 text-gray-300 animate-bounce" />
                <Sparkles className="h-8 w-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                  OUR SERVICES
                </span>
              </h2>
              
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Choose the perfect laundry solution for your needs
              </p>
            </div>
          </div>
          
          {/* Alert banners */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {!loading && isEligibleForDiscount && showDiscountAlert && (
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-white to-gray-300 rounded-full blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-white/90 to-gray-300/90 backdrop-blur-sm px-6 py-3 rounded-full text-black border-2 border-white/50 flex items-center gap-3">
                  <BadgePercent className="h-5 w-5 animate-spin" style={{ animationDuration: '2s' }} />
                  <span className="text-lg font-black">20% OFF First Order</span>
                  <button
                    onClick={() => setShowDiscountAlert(false)}
                    className="bg-black/20 rounded-full p-1 hover:bg-black/40 transition-colors hover:scale-110 transform duration-200"
                    aria-label="Dismiss discount alert"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-gray-400 to-white rounded-full blur-lg opacity-40"></div>
              <div className="relative bg-gradient-to-r from-gray-500/80 to-white/80 backdrop-blur-sm px-6 py-3 rounded-full text-black border-2 border-white/50 flex items-center gap-3">
                <Truck className="h-5 w-5 animate-bounce" />
                <span className="font-bold">FREE Pickup & Delivery</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className="group relative cursor-pointer transform hover:scale-105 transition-all duration-500"
              onClick={() => handleServiceClick(service.route, service.title)}
            >
              {/* Glowing background */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse`}></div>
              
              {/* Card */}
              <Card className="relative bg-black/40 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl overflow-hidden h-full hover:border-white/40 transition-all duration-500">
                {/* Animated background overlay */}
                <div className={`absolute inset-0 ${service.bgGlow} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
                
                {/* Delivery badge */}
                <Badge 
                  variant="outline" 
                  className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white border-white/30 flex items-center gap-1 px-3 py-1 z-10 animate-pulse"
                >
                  <Clock className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} />
                  <span className="text-xs font-bold">{service.deliveryTime}</span>
                </Badge>
                
                {/* Floating icons */}
                <Star className="absolute top-4 left-4 h-5 w-5 text-white animate-pulse" />
                <Sparkles className="absolute bottom-4 left-4 h-4 w-4 text-gray-300 animate-spin" style={{ animationDuration: '4s' }} />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="text-6xl pb-6 transform group-hover:scale-110 transition-transform duration-500 text-center">
                    {typeof service.icon === 'string' ? service.icon : service.icon}
                  </div>
                  <CardTitle className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-500 text-center">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col h-full relative z-10 text-center">
                  <p className="text-gray-300 mb-6 text-lg">{service.description}</p>
                  
                  {/* Pricing */}
                  {!loading && service.discount > 0 && isEligibleForDiscount ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-black text-2xl text-white">{service.newPrice}</span>
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="bg-gradient-to-r from-white to-gray-300 text-black text-xs px-3 py-1 rounded-full font-black animate-pulse">
                              SAVE 20%
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-3 text-sm bg-black/80 backdrop-blur-sm border border-white/20 text-white">
                            First-time customer discount! Regular price: {service.oldPrice}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div className="text-sm text-gray-400">
                        <span className="line-through">{service.oldPrice}</span>
                        <span className="ml-2 text-xs">regular</span>
                      </div>
                    </div>
                  ) : (
                    <div className="font-bold text-xl text-white mb-4">
                      {service.regularPrice}
                    </div>
                  )}
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="text-xs text-gray-300 flex items-center justify-center gap-2">
                      <Truck className="h-4 w-4 animate-bounce" />
                      <span className="font-semibold">FREE Pickup & Delivery</span>
                    </div>
                    
                    {service.minimumOrder && (
                      <div className="text-xs text-gray-300 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Min: {service.minimumOrder}kg</span>
                      </div>
                    )}
                    
                    {service.serviceCharge && (
                      <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>{service.serviceCharge}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="mt-auto flex justify-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/20 transition-all duration-300">
                      <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-2 group-hover:text-gray-300 transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-gradient-to-r from-white via-gray-300 to-white rounded-2xl blur-2xl opacity-50 animate-pulse"></div>
            <Button 
              className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white px-12 py-8 text-2xl font-black transform hover:scale-110 transition-all duration-500 shadow-2xl border-2 border-white/20 backdrop-blur-sm rounded-2xl"
              onClick={handleScheduleClick}
            >
              <Zap className="mr-3 h-7 w-7 animate-pulse" />
              Schedule Pickup Now
              <ArrowRight className="ml-3 h-7 w-7 group-hover:translate-x-3 transition-transform duration-300" />
            </Button>
          </div>
          
          <p className="mt-6 text-gray-300 text-lg">
            Professional laundry service at your doorstep
          </p>
        </div>
      </div>
    </section>
  );
};
