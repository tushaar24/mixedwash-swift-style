
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star, Rocket } from "lucide-react";
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
    
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'hero_section'
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
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Moving gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-gray-500/20 rounded-full blur-3xl animate-bounce" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center">
          {/* Floating icons */}
          <div className="absolute top-20 left-1/4 animate-bounce" style={{ animationDelay: '0s' }}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-32 right-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
            <Zap className="h-8 w-8 text-gray-300" />
          </div>
          <div className="absolute top-40 left-1/3 animate-bounce" style={{ animationDelay: '2s' }}>
            <Star className="h-6 w-6 text-white" />
          </div>

          {/* Main heading */}
          <div className="relative mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-6 relative">
              <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-pulse">
                LAUNDRY
              </span>
              <span className="block relative">
                REVOLUTION
                <Rocket className="absolute -top-4 -right-12 h-12 w-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </span>
            </h1>
            
            {/* Glassmorphism subtitle */}
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-white/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-4">
                <p className="text-xl md:text-2xl text-gray-200 font-semibold">
                  Next-Day Delivery • Zero Extra Cost • 100% Reliable
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12 relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-white/20 to-gray-300/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-black/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mx-auto max-w-3xl">
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                Transform your laundry experience with our premium service. We don't just wash clothes – we deliver perfection to your doorstep.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-white via-gray-300 to-white rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Button 
                className="relative bg-gradient-to-r from-gray-900 via-black to-gray-900 hover:from-gray-800 hover:via-gray-900 hover:to-gray-800 text-white px-12 py-6 text-xl font-bold transform hover:scale-110 transition-all duration-300 rounded-2xl border border-white/20"
                onClick={handleScheduleClick}
              >
                <Sparkles className="mr-3 h-6 w-6 animate-spin" style={{ animationDuration: '2s' }} />
                Get Started Now
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white px-12 py-6 text-xl font-bold transform hover:scale-105 transition-all duration-300 rounded-2xl"
              onClick={handleContactClick}
            >
              Learn More
            </Button>
          </div>

          {/* Hero Image with effects */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-white via-gray-300 to-white rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-4 shadow-2xl">
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                  alt="Clean, folded laundry" 
                  className="w-full h-80 md:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-gray-900/40"></div>
                
                {/* Floating badges */}
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
              <span className="text-white font-semibold">Join 1000+ satisfied customers ⭐⭐⭐⭐⭐</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
