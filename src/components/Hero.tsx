
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
    <div className="hero-container">
      {/* Responsive background image - only shown on desktop */}
      <picture className="hero-bg-picture">
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
          className="hero-img"
          loading="eager"
          decoding="sync"
          {...({ fetchpriority: "high" } as any)}
          width="1600"
          height="900"
          style={{ aspectRatio: '16/9' }}
        />
      </picture>
      
      {/* Clean white gradient overlay - hidden on mobile */}
      <div className="hero-bg-picture hero-gradient"></div>
      
      {/* Content */}
      <div className="hero-content">
        <div className="hero-textbox">
          <h1 className="hero-title">
            <span className="block mb-2">Laundry and</span>
            <span className="block mb-2">Dry Cleaning</span>
            <span className="hero-subtitle">with Next Day Delivery</span>
          </h1>
          <p className="hero-description">
            Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
          </p>
          <div className="hero-buttons">
            <Button 
              className="schedule-btn"
              onClick={handleScheduleClick}
            >
              Schedule Your Laundry Pickup
              <ArrowRight className="cta-icon" />
            </Button>
            
            <Button 
              variant="outline" 
              className="contact-btn"
              onClick={handleContactClick}
            >
              <MessageSquare className="contact-icon" />
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
