
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";
import { useIsMobile } from "@/hooks/use-mobile";

export const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const handleScheduleClick = () => {
    const userInfo = getUserInfo();

    // Track the CTA click event FIRST
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'hero_section'
    });

    // Then navigate with a flag to indicate this came from CTA
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule", { state: { fromCTA: true } });
    }
  };

  const handleContactClick = () => {
    const userInfo = getUserInfo();
    trackEvent('contact_us_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime()
    });
    navigate("/contact");
  };

  return (
    <div 
      className="relative md:bg-cover md:bg-no-repeat" 
      style={!isMobile ? {
        backgroundImage: `url('https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundPosition: 'right center',
        backgroundSize: 'contain'
      } : {}}
    >
      {/* Clean white gradient overlay - hidden on mobile */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-white via-white/95 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-0 md:pb-0 flex items-center">
        <div className="max-w-2xl">
          {/* TrustPilot Rating */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= 4 ? 'fill-green-500 text-green-500' : star === 5 ? 'fill-green-500/50 text-green-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">4.8</span>
            <span className="text-gray-600">on</span>
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA4MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTcuNSAzSDEyLjVMMTUgN0wxNy41IDNIMjIuNUwyMCAxMUwyNy41IDE1TDE3LjUgMTlMMTUgMjNMMTIuNSAxOUwyLjUgMTVMMTAgMTFMNy41IDNaIiBmaWxsPSIjMDBCNjc0Ii8+CjxwYXRoIGQ9Ik0zNC41IDNoNXYxNmgtNVYzem0wIDEzaDV2M2gtNXYtM3ptMC01aDV2M2gtNXYtM3ptMC01aDV2M2gtNXYtM3oiIGZpbGw9IiMwMEI2NzQiLz4KPHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA4MCAyNCIgZmlsbD0ibm9uZSI+CjwvZz4KPC9zdmc+"
              alt="TrustPilot"
              className="h-6"
            />
          </div>

          <h1 className="pt-0 md:pt-32 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            <span className="block mb-2">Laundry and</span>
            <span className="block mb-2">Dry Cleaning</span>
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-600">with 24 Hours Delivery</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mt-6">
            Laundry shouldn't slow you down. MixedWash delivers 24-hour laundry at no extra cost, always reliable, always easy.
          </p>
          <div className="pt-8 pb-0 md:pb-32 flex flex-col space-y-4">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 text-lg h-auto group w-full sm:w-auto font-semibold" 
              onClick={handleScheduleClick}
            >
              Schedule Your Laundry Pickup
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-900 border-2 px-6 py-4 h-auto text-lg w-full sm:w-auto" 
              onClick={handleContactClick}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
