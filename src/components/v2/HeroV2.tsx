
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

export const HeroV2 = () => {
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
    
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'hero_section_v2'
    });
    
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
    <div className="bg-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full opacity-40 animate-bounce" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-bl from-yellow-100 to-orange-100 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-8 animate-fade-in">
            {/* Floating emoji */}
            <div className="flex gap-2 mb-4">
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🚀</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
              <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🔥</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="block mb-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
                Laundry and
              </span>
              <span className="block mb-2 relative">
                Dry Cleaning
                <Sparkles className="absolute -top-2 -right-8 h-8 w-8 text-yellow-400 animate-spin" style={{ animationDuration: '2s' }} />
              </span>
              <span className="text-3xl md:text-4xl lg:text-5xl text-gray-700 relative">
                with Next Day Delivery
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 to-purple-400 transform scale-x-0 animate-[scale-x-100_1s_ease-out_0.5s_forwards] origin-left"></div>
              </span>
            </h1>

            <div className="relative">
              <p className="text-xl text-gray-600 max-w-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
                Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
              </p>
              <Zap className="absolute -right-4 top-0 h-6 w-6 text-yellow-500 animate-pulse" />
            </div>

            <div className="pt-2 flex flex-col space-y-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 text-lg h-auto group w-full sm:w-auto transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleScheduleClick}
              >
                <Sparkles className="mr-2 h-5 w-5 animate-spin" style={{ animationDuration: '2s' }} />
                Schedule Your Laundry Pickup
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-2 border-gray-800 hover:bg-gray-800 hover:text-white px-6 py-4 h-auto text-lg w-full sm:w-auto transform hover:scale-105 transition-all duration-300"
                onClick={handleContactClick}
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center items-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl w-full transform hover:scale-105 transition-all duration-500 relative">
              {/* Floating elements around image */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -top-2 -right-6 w-6 h-6 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute -bottom-4 -right-2 w-10 h-10 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              
              <img 
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Clean, folded laundry" 
                className="w-full h-64 md:h-80 object-cover"
              />
              
              {/* Overlay with gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
