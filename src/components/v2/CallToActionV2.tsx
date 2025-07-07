
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star, Heart, Crown } from "lucide-react";
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
    <section className="relative min-h-screen bg-gradient-to-br from-black via-purple-900 to-black overflow-hidden flex items-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Shooting stars */}
        <div className="absolute top-32 right-40 w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-60 animate-pulse transform rotate-45"></div>
        <div className="absolute bottom-40 left-60 w-1 h-16 bg-gradient-to-b from-purple-400 to-transparent opacity-40 animate-pulse transform rotate-12" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          {/* Floating emoji constellation */}
          <div className="relative mb-16">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-12">
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0s' }}>🎉</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.4s' }}>✨</span>
              <span className="text-5xl animate-bounce" style={{ animationDelay: '0.8s' }}>🚀</span>
            </div>
            <div className="absolute -bottom-8 left-1/4 flex gap-8">
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>💯</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.6s' }}>🔥</span>
            </div>
            <div className="absolute -bottom-8 right-1/4 flex gap-8">
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>💫</span>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '1s' }}>⚡</span>
            </div>
          </div>

          {/* Main content with glassmorphism */}
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30 rounded-3xl blur-3xl animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-16 mx-auto max-w-5xl">
              
              {/* Crown icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute -inset-4 bg-yellow-400/50 rounded-full blur-2xl animate-pulse"></div>
                  <Crown className="relative h-16 w-16 text-yellow-400 animate-bounce" />
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 relative">
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse mb-4">
                  READY TO
                </span>
                <span className="block text-white relative">
                  GLOW UP
                  <Star className="absolute -top-8 -right-12 h-16 w-16 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                </span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-4">
                  YOUR LAUNDRY?
                </span>
              </h2>
              
              <div className="space-y-6 mb-12">
                <p className="text-2xl md:text-3xl text-white font-bold relative">
                  MixedWash is about to become your new{" "}
                  <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text animate-pulse">
                    obsession! 
                  </span>
                  <Zap className="absolute -right-8 top-0 h-8 w-8 text-yellow-400 animate-pulse" />
                </p>
                
                <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                  We're not just washing clothes, we're washing away your stress! 
                  <br className="hidden sm:block" />
                  <span className="inline-block mt-2 font-bold text-white">
                    No cap! 💯 This is going to change everything! 🔥
                  </span>
                </p>
              </div>
              
              {/* CTA Button */}
              <div className="relative inline-block">
                <div className="absolute -inset-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl blur-2xl opacity-60 animate-pulse"></div>
                <Button 
                  className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white px-16 py-12 text-3xl font-black group transform hover:scale-110 transition-all duration-500 shadow-2xl border-4 border-white/30 backdrop-blur-sm rounded-3xl overflow-hidden"
                  onClick={handleScheduleClick}
                >
                  {/* Animated background particles */}
                  <div className="absolute inset-0">
                    <div className="absolute top-2 left-8 w-3 h-3 bg-white rounded-full animate-ping"></div>
                    <div className="absolute top-6 right-12 w-2 h-2 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute bottom-4 left-16 w-2 h-2 bg-pink-300 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute bottom-8 right-20 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                  </div>
                  
                  <Sparkles className="mr-4 h-8 w-8 animate-spin relative z-10" style={{ animationDuration: '2s' }} />
                  <span className="relative z-10">START YOUR JOURNEY!</span>
                  <ArrowRight className="ml-4 h-8 w-8 group-hover:translate-x-4 transition-transform duration-300 relative z-10" />
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                </Button>
              </div>

              {/* Social proof */}
              <div className="mt-12">
                <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-3 border-white animate-pulse flex items-center justify-center`} style={{ animationDelay: `${i * 0.2}s` }}>
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <span className="text-white font-black text-lg">
                    Join 1000+ customers living their best laundry life! 
                    <span className="inline-block ml-2 animate-bounce">⭐</span>
                  </span>
                </div>
              </div>

              {/* Additional motivational text */}
              <div className="mt-8 text-gray-300 text-lg animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <span>Your future self will thank you</span>
                  <span className="animate-bounce">🌟</span>
                  <span>Trust the process</span>
                  <span className="animate-bounce">💫</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
