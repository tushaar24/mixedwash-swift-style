
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

export const Hero = () => {
  const navigate = useNavigate();
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
      className="relative overflow-hidden"
      style={{
        backgroundImage: `url(/lovable-uploads/5611fc1e-0657-405d-bd70-882686523d48.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Gradient overlay - dark on left for text visibility, transparent on right for image */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              <span className="block mb-2">Laundry and</span>
              <span className="block mb-2">Dry Cleaning</span>
              <span className="text-3xl md:text-4xl lg:text-5xl text-gray-200">with Next Day Delivery</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-lg">
              Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
            </p>
            <div className="pt-2 flex flex-col space-y-4">
              <Button 
                className="bg-white hover:bg-gray-100 text-black px-6 py-4 text-lg h-auto group w-full sm:w-auto font-semibold"
                onClick={handleScheduleClick}
              >
                Schedule Your Laundry Pickup
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-black px-6 py-4 h-auto text-lg w-full sm:w-auto"
                onClick={handleContactClick}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
          
          {/* Empty column to maintain layout but let background image show on the right */}
          <div className="hidden md:block"></div>
        </div>
      </div>
    </div>
  );
};
