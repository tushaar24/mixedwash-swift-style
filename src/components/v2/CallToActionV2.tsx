
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

export const CallToActionV2 = () => {
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
      'source': 'call_to_action_section_v2'
    });
    
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule", { state: { fromCTA: true } });
    }
  };

  return (
    <section className="bg-gradient-to-br from-black via-purple-900 to-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-tr from-blue-600/20 to-cyan-600/20 rounded-full animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-bl from-yellow-400/10 to-orange-400/10 rounded-full animate-spin" style={{ animationDuration: '8s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          {/* Floating emojis */}
          <div className="flex justify-center gap-4 mb-6">
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🚀</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>💯</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Ready to Experience Laundry Joy?
            </span>
            <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          </h2>
          
          <p className="text-xl mb-8 text-gray-200 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            MixedWash makes laundry effortless, trustworthy, and fun. 
            <br className="hidden sm:block" />
            <span className="inline-block mt-2">
              No cap! 💯 We're about to change your laundry game forever! 🔥
            </span>
            <Zap className="absolute -right-8 top-0 h-6 w-6 text-yellow-400 animate-pulse" />
          </p>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button 
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white px-10 py-8 text-xl group transform hover:scale-110 transition-all duration-500 shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden"
              onClick={handleScheduleClick}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              
              <Sparkles className="mr-3 h-6 w-6 animate-spin relative z-10" style={{ animationDuration: '2s' }} />
              <span className="relative z-10">Schedule Your First Pickup</span>
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
              
              {/* Floating particles */}
              <div className="absolute top-0 left-0 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-2 right-4 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1 left-8 w-1.5 h-1.5 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            </Button>
          </div>

          <div className="mt-8 text-gray-400 text-sm animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <span className="inline-flex items-center gap-2">
              <span>Join the laundry revolution</span>
              <span className="animate-bounce">🌟</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
