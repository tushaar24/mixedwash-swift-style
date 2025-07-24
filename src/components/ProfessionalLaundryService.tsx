
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { LazyImage } from "@/components/LazyImage";
import flexibleSchedulingImg from "@/assets/flexible-scheduling.webp";
import deliveryServiceImg from "@/assets/delivery-service.webp";
import realTimeUpdatesImg from "@/assets/real-time-updates.webp";
import premiumSupportImg from "@/assets/premium-support.webp";

export const ProfessionalLaundryService = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const {
    user,
    profile
  } = useAuth();
  
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
        'source': 'professional_service_section'
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [navigate, getUserInfo]);
  
  const features = [{
    title: "Flexible Scheduling",
    description: "Select from our range of convenient time slots for pickup and delivery, perfectly aligned with your daily routine.",
    image: flexibleSchedulingImg
  }, {
    title: "24hr Delivery Service",
    description: "Affordable 24-Hour Laundry, Delivered Fast. We respect your time—enjoy reliable next-day delivery at unbeatable prices.",
    image: deliveryServiceImg
  }, {
    title: "Real-Time Updates",
    description: "Stay informed with precise delivery tracking and instant notifications throughout the service process.",
    image: realTimeUpdatesImg
  }, {
    title: "Premium Support",
    description: "Access to dedicated customer service professionals ready to assist you at any time, ensuring a seamless experience.",
    image: premiumSupportImg
  }];
  
  return <section ref={sectionRef} className="laundry-section">
      <div className="laundry-section-container">
        {/* Header Section */}
        <div className="section-header">
           <h1 className="section-title">
            <span className="text-gray-900">Professional Express Laundry Services</span><br />
            <span className="text-gray-500">Tailored to Your Schedule</span>
          </h1>


          <div className="section-description-container">
            <p className="section-description">
              Experience the convenience of our express premium laundry service, meticulously designed to accommodate your schedule. From flexible pickup times to precise delivery windows, we ensure your laundry needs are met with professional excellence.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="features-grid-container">
          <div className="features-grid">
            {features.map((feature, index) => <div key={index} className="feature-card">
                <div className="feature-card-image-container">
                  <LazyImage 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="feature-card-title">
                    {feature.title}
                  </h3>
                  <p className="feature-card-description">
                    {feature.description}
                  </p>
                </div>
              </div>)}
          </div>
        </div>

        {/* CTA Section */}
        <div className="section-cta-container">
          <Button onClick={handleScheduleClick} className="section-cta-button">
            <span>Schedule Pickup Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>;
};
