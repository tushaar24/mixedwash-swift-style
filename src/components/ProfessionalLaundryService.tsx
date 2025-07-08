
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

export const ProfessionalLaundryService = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
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

    // Track the CTA click event
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'professional_service_section'
    });

    // Navigate based on authentication status
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule", { state: { fromCTA: true } });
    }
  };

  const features = [{
    title: "Flexible Scheduling",
    description: "Select from our range of convenient time slots for pickup and delivery, perfectly aligned with your daily routine.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }, {
    title: "Digital Convenience",
    description: "Manage your bookings effortlessly. We work according to your schedule.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }, {
    title: "Real-Time Updates",
    description: "Stay informed with precise delivery tracking and instant notifications throughout the service process.",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }, {
    title: "Premium Support",
    description: "Access to dedicated customer service professionals ready to assist you at any time, ensuring a seamless experience.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }];

  return <section ref={sectionRef} className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 tracking-tight">
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
                  <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
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
          <Button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 h-auto text-base font-medium tracking-wide transition-all duration-300 group" onClick={handleScheduleClick}>
            <span>Schedule Pickup Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </div>
      </div>
    </section>;
};
