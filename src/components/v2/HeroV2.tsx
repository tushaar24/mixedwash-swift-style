
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Zap, Sparkles, Star } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse"></div>
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gray-500/15 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Floating icons */}
          <div className="relative mb-12">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-8">
              <Sparkles className="h-8 w-8 text-white animate-bounce" style={{ animationDelay: '0s' }} />
              <Zap className="h-8 w-8 text-gray-300 animate-bounce" style={{ animationDelay: '0.5s' }} />
              <Star className="h-8 w-8 text-white animate-bounce" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Main headline with glassmorphism */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-gray-300/20 to-white/20 rounded-3xl blur-xl"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 mx-auto max-w-4xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-pulse mb-4">
                  LAUNDRY
                </span>
                <span className="block text-white relative">
                  REVOLUTION
                  <Star className="absolute -top-4 -right-8 h-12 w-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </span>
                <span className="block text-2xl md:text-4xl text-gray-300 mt-4 font-normal">
                  Next-Day Delivery • Zero Extra Cost • 100% Reliable
                </span>
              </h1>
            </div>
          </div>

          {/* Subtext */}
          <div className="relative mb-12">
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Transform your laundry experience with our premium service.{" "}
              <span className="text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text font-bold">
                Professional care for your wardrobe.
              </span>
              <br />
              We deliver perfection to your doorstep.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button 
              className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white px-12 py-8 text-xl font-bold group transform hover:scale-110 transition-all duration-500 shadow-2xl border-2 border-white/20 backdrop-blur-sm overflow-hidden"
              onClick={handleScheduleClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              
              <Sparkles className="mr-3 h-6 w-6 animate-spin relative z-10" style={{ animationDuration: '2s' }} />
              <span className="relative z-10">Schedule Now</span>
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-3 transition-transform duration-300 relative z-10" />
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white px-12 py-8 text-xl font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-white/25"
              onClick={handleContactClick}
            >
              <MessageSquare className="mr-3 h-6 w-6" />
              Learn More
            </Button>
          </div>

          {/* Image with frame */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-white via-gray-300 to-white rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-2 shadow-2xl">
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="Clean, folded laundry" 
                  className="w-full h-80 md:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-gray-900/40"></div>
                
                {/* Floating badges on image */}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-bounce">
                  <Zap className="h-4 w-4" />
                  24h Delivery
                </div>
                <div className="absolute bottom-6 right-6 bg-black/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                  100% Reliable
                </div>
              </div>
            </div>
          </div>

          {/* Social proof */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4">
              <div className="flex -space-x-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-300 border-2 border-black animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
              <span className="text-white font-semibold">Join 1000+ satisfied customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
