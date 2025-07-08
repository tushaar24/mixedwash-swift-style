
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const ProfessionalLaundryService = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedScrollRef = useRef(false);

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

  // Scroll tracking effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedScrollRef.current) {
            hasTrackedScrollRef.current = true;
            
            const userInfo = getUserInfo();
            
            console.log('Professional Laundry Service section viewed');
            trackEvent('professional_laundry_service_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime(),
              'section': 'Professional Laundry Service'
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [user, profile]);
  
  const features = [
    {
      title: "Flexible Scheduling",
      description: "Select from our range of convenient time slots for pickup and delivery, perfectly aligned with your daily routine.",
      image: "https://readdy.ai/api/search-image?query=modern%20minimalist%20laundry%20service%20delivery%20van%20in%20front%20of%20modern%20apartment%20building%2C%20soft%20morning%20light%2C%20professional%20service%20concept%2C%20clean%20and%20organized%2C%20high-end%20photography%20style%2C%20muted%20colors&width=800&height=600&seq=1&orientation=landscape"
    },
    {
      title: "Digital Convenience",
      description: "Manage your appointments effortlessly through our intuitive digital platform, available on both mobile and desktop.",
      image: "https://readdy.ai/api/search-image?query=person%20using%20modern%20smartphone%20app%20for%20laundry%20service%20scheduling%2C%20clean%20minimal%20interface%20design%2C%20soft%20ambient%20lighting%2C%20professional%20lifestyle%20photography%2C%20muted%20tones&width=800&height=600&seq=2&orientation=landscape"
    },
    {
      title: "Real-Time Updates",
      description: "Stay informed with precise delivery tracking and instant notifications throughout the service process.",
      image: "https://readdy.ai/api/search-image?query=professional%20laundry%20service%20worker%20in%20uniform%20delivering%20fresh%20clean%20clothes%20to%20customer%20door%2C%20real-time%20delivery%20tracking%20concept%2C%20modern%20apartment%20setting%2C%20soft%20natural%20lighting&width=800&height=600&seq=3&orientation=landscape"
    },
    {
      title: "Premium Support",
      description: "Access to dedicated customer service professionals ready to assist you at any time, ensuring a seamless experience.",
      image: "https://readdy.ai/api/search-image?query=professional%20customer%20service%20representative%20with%20headset%20in%20modern%20office%20environment%2C%20helping%20customers%2C%20warm%20and%20friendly%20expression%2C%20clean%20corporate%20setting%2C%20soft%20lighting&width=800&height=600&seq=4&orientation=landscape"
    }
  ];
  
  return (
    <section className="py-24 bg-white" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-6 tracking-tight">
            <span className="text-gray-900">Professional Laundry Service</span><br />
            <span className="text-gray-500">Tailored to Your Schedule</span>
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Experience the convenience of our premium laundry service, meticulously designed to accommodate your schedule. From flexible pickup times to precise delivery windows, we ensure your laundry needs are met with professional excellence.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden mb-8 transform transition-transform duration-500 group-hover:scale-[1.02]">
                  <img
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
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 h-auto text-base font-medium tracking-wide transition-all duration-300 group"
            onClick={() => navigate("/contact")}  
          >
            <span>Schedule a Consultation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
          
          <div className="mt-12 max-w-md mx-auto">
            <p className="text-sm text-gray-500 tracking-wide">
              For inquiries about our premium service or custom requirements,<br />
              our concierge team is available to assist you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
