
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
  
  return <section ref={sectionRef} className="bg-white py-12 md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20">
           <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 tracking-tight">
            <span className="text-gray-900">Professional Express Laundry Near You</span><br />
            <span className="text-gray-500">Tailored to Your Schedule</span>
          </h2>


          <div className="max-w-3xl mx-auto mt-6 md:mt-8 lg:mt-10">
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed px-4 sm:px-0">
              Experience the convenience of our express premium laundry service near you, meticulously designed to accommodate your schedule. From flexible pickup times to precise delivery windows, we ensure your laundry needs are met with professional excellence.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {features.map((feature, index) => <div key={index} className="group bg-white rounded-xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300">
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-6 transform transition-transform duration-500 group-hover:scale-[1.02]">
                  <LazyImage 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>)}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button onClick={handleScheduleClick} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 h-auto text-base font-medium tracking-wide transition-all duration-300 group py-[16px] mb-8 md:mb-0">
            <span>Schedule Pickup Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>;
};
