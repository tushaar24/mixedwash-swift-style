
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Truck, Info, Sparkles, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const Services = () => {
  const navigate = useNavigate();
  const { isEligibleForDiscount, loading } = useDiscountEligibility();
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
      gradient: "from-purple-500 to-pink-500"
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
      gradient: "from-blue-500 to-cyan-500"
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
      gradient: "from-green-500 to-emerald-500"
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
      gradient: "from-orange-500 to-red-500"
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

  return (
    <section id="services" className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-6">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4">
                Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Services</span>
                <Sparkles className="inline-block ml-4 h-10 w-10 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the perfect laundry solution for your needs
              </p>
            </div>
          </div>
          
          {/* Alert banners */}
          {!loading && isEligibleForDiscount && (
            <div className="mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full px-6 py-3">
                <Zap className="h-5 w-5 text-yellow-400 animate-pulse" />
                <span className="text-yellow-300 font-bold">🎉 20% OFF First Order!</span>
              </div>
            </div>
          )}
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
              <div className={`absolute -inset-1 bg-gradient-to-br ${service.gradient} rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse`}></div>
              
              {/* Card */}
              <Card className="relative bg-black/40 backdrop-blur-sm border border-white/20 shadow-2xl rounded-3xl overflow-hidden h-full hover:border-white/40 transition-all duration-500">
                {/* Delivery badge */}
                <Badge 
                  variant="outline" 
                  className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white border-white/30 flex items-center gap-1 px-3 py-1 z-10"
                >
                  <Clock className="h-3 w-3" />
                  <span className="text-xs font-bold">{service.deliveryTime}</span>
                </Badge>
                
                {/* Floating star */}
                <Star className="absolute top-4 left-4 h-5 w-5 text-yellow-400 animate-pulse" />
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="text-6xl pb-6 transform group-hover:scale-110 transition-transform duration-500 text-center">
                    {typeof service.icon === 'string' ? service.icon : service.icon}
                  </div>
                  <CardTitle className="text-2xl font-black text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-500 text-center">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex flex-col h-full relative z-10 text-center">
                  <p className="text-gray-300 mb-6 text-lg">{service.description}</p>
                  
                  {/* Pricing */}
                  {!loading && service.discount > 0 && isEligibleForDiscount ? (
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-black text-2xl text-green-400">{service.newPrice}</span>
                        <HoverCard>
                          <HoverCardTrigger>
                            <span className="bg-gradient-to-r from-green-400 to-emerald-400 text-black text-xs px-3 py-1 rounded-full font-black">
                              SAVE 20%!
                            </span>
                          </HoverCardTrigger>
                          <HoverCardContent className="p-3 text-sm bg-black/80 backdrop-blur-sm border border-white/20 text-white">
                            First-time customer discount! Regular price: {service.oldPrice}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <div className="text-sm text-gray-400">
                        <span className="line-through">{service.oldPrice}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="font-bold text-xl text-white mb-4">
                      {service.regularPrice}
                    </div>
                  )}
                  
                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    <div className="text-xs text-blue-300 flex items-center justify-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-semibold">FREE Pickup & Delivery</span>
                    </div>
                    
                    {service.minimumOrder && (
                      <div className="text-xs text-orange-300 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Min: {service.minimumOrder}kg</span>
                      </div>
                    )}
                    
                    {service.serviceCharge && (
                      <div className="text-xs text-red-300 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>{service.serviceCharge}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Arrow indicator */}
                  <div className="mt-auto flex justify-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full p-3 group-hover:bg-white/20 transition-all duration-300">
                      <ArrowRight className="h-6 w-6 text-white group-hover:translate-x-2 group-hover:text-purple-400 transition-all duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
