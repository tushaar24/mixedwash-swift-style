
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";
import heroDesktop from "@/assets/hero-desktop-1600.webp";
import heroTablet from "@/assets/hero-tablet-1024.webp";

export const Hero = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // Memoize heavy computations
  const getUserInfo = useCallback(() => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined, [user, profile]);

  const handleScheduleClick = useCallback(async () => {
    // Navigate immediately for better UX
    navigate("/schedule", { state: { fromCTA: true } });

    // Track asynchronously to avoid blocking
    try {
      const { trackEvent } = await import("@/utils/clevertap");
      const userInfo = getUserInfo();
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      trackEvent('schedule_cta_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': currentTime,
        'source': 'hero_section'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [navigate, getUserInfo]);

  const handleContactClick = useCallback(async () => {
    // Navigate immediately for better UX
    navigate("/contact");

    // Track asynchronously to avoid blocking
    try {
      const { trackEvent } = await import("@/utils/clevertap");
      const userInfo = getUserInfo();
      const currentTime = new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      
      trackEvent('contact_us_cta_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': currentTime
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [navigate, getUserInfo]);

  return (
    <div className="relative overflow-hidden min-h-[500px] md:min-h-[600px]">
      {/* Responsive background image - only shown on desktop */}
      <picture className="absolute inset-0 hidden md:block">
        <source
          media="(min-width: 1200px)"
          srcSet={heroDesktop}
          width="1600"
          height="900"
        />
        <source
          media="(min-width: 768px)"
          srcSet={heroTablet}
          width="1024"
          height="768"
        />
        <img
          src={heroDesktop}
          alt="Professional laundry service"
          className="w-full h-full object-cover object-right"
          loading="eager"
          decoding="sync"
          {...({ fetchpriority: "high" } as any)}
          width="1600"
          height="900"
          style={{ aspectRatio: '16/9' }}
        />
      </picture>
      
      {/* Clean white gradient overlay - hidden on mobile */}
      <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-white via-white/95 to-transparent"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-0 md:pb-0 flex items-center md:min-h-[600px]">
        <div className="max-w-2xl">
          <h1 className="hero-title pt-0 md:pt-32 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            <span className="block mb-2">Laundry and</span>
            <span className="block mb-2">Dry Cleaning</span>
            <span className="text-3xl md:text-4xl lg:text-5xl text-gray-600">with Next Day Delivery</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-lg mt-6">
            Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
          </p>
          <div className="pt-8 pb-0 md:pb-32 flex flex-col space-y-4">
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 text-lg h-auto group w-full sm:w-auto font-semibold" 
              onClick={handleScheduleClick}
              aria-label="Schedule your laundry pickup"
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
