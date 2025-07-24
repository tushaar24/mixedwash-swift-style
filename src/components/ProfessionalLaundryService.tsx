
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { LazyImage } from "@/components/LazyImage";

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
    image: "https://readdy.ai/api/search-image?query=modern%20digital%20calendar%20interface%20showing%20scheduling%20options%2C%20person%20using%20tablet%20to%20select%20laundry%20service%20time%20slots%2C%20clean%20minimal%20design%20with%20soft%20blue%20accents%2C%20professional%20workspace%20environment%2C%20natural%20lighting%2C%20high-end%20technology%20lifestyle%20photography&width=800&height=600&seq=1&orientation=landscape"
  }, {
    title: "24hr Delivery Service",
    description: "Affordable 24-Hour Laundry, Delivered Fast. We respect your time—enjoy reliable next-day delivery at unbeatable prices.",
    image: "https://readdy.ai/api/search-image?query=professional%20Indian%20delivery%20driver%20in%20neat%20uniform%20delivering%20fresh%20laundry%20at%20modern%20apartment%2C%20traditional%20Indian%20features%2C%20well-groomed%20appearance%2C%20holding%20laundry%20bag%2C%20standing%20near%20delivery%20vehicle%2C%20modern%20urban%20Indian%20setting%2C%20soft%20morning%20light%2C%20professional%20service%20photography&width=800&height=600&seq=3&orientation=landscape"
  }, {
    title: "Real-Time Updates",
    description: "Stay informed with precise delivery tracking and instant notifications throughout the service process.",
    image: "https://readdy.ai/api/search-image?query=modern%20minimalist%20map%20interface%20showing%20a%20clear%20delivery%20route%20marked%20with%20a%20bright%20blue%20line%2C%20prominent%20start%20point%20marked%20with%20green%20pin%20and%20destination%20with%20red%20pin%2C%20clean%20white%20map%20background%20with%20subtle%20street%20details%2C%20professional%20navigation%20screen%20design%2C%20high%20contrast%20route%20visualization%2C%20elegant%20mobile%20app%20interface&width=800&height=600&seq=3&orientation=landscape"
  }, {
    title: "Premium Support",
    description: "Access to dedicated customer service professionals ready to assist you at any time, ensuring a seamless experience.",
    image: "https://readdy.ai/api/search-image?query=professional%20Indian%20customer%20service%20representative%20wearing%20traditional%20Indian%20attire%20with%20headset%20in%20modern%20office%20environment%2C%20helping%20customers%2C%20warm%20and%20friendly%20expression%2C%20clean%20corporate%20setting%20with%20Indian%20decor%20elements%2C%20soft%20ambient%20lighting%2C%20high-end%20photography&width=800&height=600&seq=4&orientation=landscape"
  }];
  
  return <section ref={sectionRef} className="bg-white py-8 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="hero-title text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
            <span className="text-gray-900">Professional Express Laundry Services</span><br />
            <span className="text-gray-500">Tailored to Your Schedule</span>
          </h1>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">Experience the convenience of our express premium laundry service, meticulously designed to accommodate your schedule. From flexible pickup times to precise delivery windows, we ensure your laundry needs are met with professional excellence.</p>
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
