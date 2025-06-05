import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

export const CallToAction = () => {
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
    
    // New event format
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime()
    });
    
    // Keep existing tracking for backward compatibility
    trackEvent('CTA Clicked', {
      'CTA Type': 'Schedule Pickup',
      'CTA Location': 'Call To Action Section',
      'Page Name': 'Home Page'
    }, getUserInfo());
    
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule");
    }
  };

  return (
    <section className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Laundry Joy?</h2>
          <p className="text-lg mb-8">
            MixedWash makes laundry effortless, trustworthy, and fun.
          </p>
          <Button 
            className="bg-white text-black hover:bg-gray-100 hover:text-black px-8 py-6 text-lg group"
            onClick={handleScheduleClick}
          >
            Schedule Your First Pickup
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
