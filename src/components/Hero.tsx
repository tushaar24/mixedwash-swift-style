import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";
export const Hero = () => {
  const navigate = useNavigate();
  const {
    user,
    profile
  } = useAuth();
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
      navigate("/schedule", {
        state: {
          fromCTA: true
        }
      });
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
  return <div className="relative min-h-screen bg-cover bg-no-repeat" style={{
    backgroundImage: `url('https://readdy.ai/api/search-image?query=modern%20minimalist%20laundry%20room%20interior%20with%20white%20walls%20and%20soft%20turquoise%20accents%2C%20clean%20and%20bright%20atmosphere%20with%20natural%20light%2C%20featuring%20a%20sleek%20washing%20machine%20and%20neatly%20folded%20clothes%2C%20professional%20photography%20style%20with%20soft%20shadows&width=1920&height=1080&seq=1&orientation=landscape')`,
    backgroundPosition: 'right center',
    backgroundSize: 'contain'
  }}>
      {/* Clean white gradient overlay like in reference */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent"></div>
      
      {/* Content - positioned at top instead of center */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-start pt-20 py-[60px]">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            <span className="block mb-2">Laundry and</span>
            <span className="block mb-2">Dry Cleaning</span>
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-600">with Next Day Delivery</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mt-6">
            Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
          </p>
          <div className="pt-6 flex flex-col space-y-3">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 text-lg h-auto group w-full sm:w-auto font-semibold" onClick={handleScheduleClick}>
              Schedule Your Laundry Pickup
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button variant="outline" className="border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-900 border-2 px-6 py-4 h-auto text-lg w-full sm:w-auto" onClick={handleContactClick}>
              <MessageSquare className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>;
};