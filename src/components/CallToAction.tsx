
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";
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
    
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'call_to_action_section'
    });
    
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule", { state: { fromCTA: true } });
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex items-center">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gray-500/15 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          {/* Floating icons */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-8">
            <Sparkles className="h-8 w-8 text-white animate-bounce" style={{ animationDelay: '0s' }} />
            <Zap className="h-8 w-8 text-gray-300 animate-bounce" style={{ animationDelay: '0.5s' }} />
            <Star className="h-8 w-8 text-white animate-bounce" style={{ animationDelay: '1s' }} />
          </div>

          {/* Main content */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-white/30 via-gray-300/30 to-white/30 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-16 mx-auto max-w-5xl">
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 relative">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-pulse mb-4">
                  READY TO
                </span>
                <span className="block text-white relative">
                  TRANSFORM
                  <Star className="absolute -top-8 -right-12 h-16 w-16 text-white animate-spin" style={{ animationDuration: '4s' }} />
                </span>
                <span className="block bg-gradient-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent mt-4">
                  YOUR LAUNDRY?
                </span>
              </h2>
              
              <div className="space-y-6 mb-12">
                <p className="text-2xl md:text-3xl text-white font-bold">
                  Experience the future of laundry care with{" "}
                  <span className="text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                    MixedWash
                  </span>
                </p>
                
                <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of satisfied customers who've made the switch to premium laundry service. 
                  <br />
                  <span className="font-bold text-white mt-2 block">
                    Your clothes deserve the best care possible.
                  </span>
                </p>
              </div>
              
              {/* CTA Button */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-r from-white via-gray-300 to-white rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                <Button 
                  className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white px-16 py-12 text-3xl font-black group transform hover:scale-110 transition-all duration-500 shadow-2xl border-4 border-white/30 backdrop-blur-sm rounded-3xl"
                  onClick={handleScheduleClick}
                >
                  <Sparkles className="mr-4 h-8 w-8 animate-spin relative z-10" style={{ animationDuration: '2s' }} />
                  <span className="relative z-10">Start Your Journey</span>
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-4 transition-transform duration-300 relative z-10" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-12">
                <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-300 border-3 border-black animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                  <span className="text-white font-bold text-lg">
                    Join 1000+ customers living their best laundry life! ⭐
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
