
import { Computer, ShoppingBag, Bell, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const HowItWorks = () => {
  const {
    user,
    profile
  } = useAuth();
  const navigate = useNavigate();
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

  // Reset tracking flag when component mounts
  useEffect(() => {
    hasTrackedScrollRef.current = false;
  }, []);

  // Scroll tracking effect
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasTrackedScrollRef.current) {
          hasTrackedScrollRef.current = true;
          const userInfo = getUserInfo();
          console.log('HowItWorks: EVENT TRIGGERED - How It Works section viewed');
          trackEvent('how_it_works_viewed', {
            'customer name': userInfo?.name || 'Anonymous',
            'customer id': userInfo?.user_id || 'Anonymous',
            'current_time': getCurrentTime(),
            'section': 'How It Works'
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [user, profile]);

  const steps = [
    {
      number: "1",
      label: "FLEXIBLE",
      title: "Schedule your collection",
      description: "Plan your day with ease. Choose a collection and delivery time at your convenience.",
      features: [
        { icon: <Computer className="h-5 w-5 text-blue-600" />, text: "Book easily through our website" },
        { icon: <Clock className="h-5 w-5 text-blue-600" />, text: "Weekend and evening slots available" }
      ],
      image: "https://readdy.ai/api/search-image?query=modern%20minimalist%203D%20illustration%20of%20a%20laptop%20displaying%20a%20clean%20and%20professional%20website%20scheduling%20interface%20with%20calendar%20and%20time%20slots%2C%20floating%20in%20space%20with%20soft%20gradient%20background%2C%20elegant%20design%20with%20muted%20pastel%20colors%20and%20subtle%20shadows%2C%20showing%20an%20open%20browser%20window&width=600&height=400&seq=1&orientation=landscape"
    },
    {
      number: "2",
      label: "QUICK & EASY",
      title: "Pack your laundry",
      description: "Pack your items in a designated bag. Use one bag per service. Our driver will transfer them to reusable MixedWash bags which you can keep for your next order.",
      features: [
        { icon: <ShoppingBag className="h-5 w-5 text-blue-600" />, text: "Pack one bag per service" },
        { icon: <Bell className="h-5 w-5 text-blue-600" />, text: "No need to count or weigh your items" }
      ],
      image: "https://readdy.ai/api/search-image?query=modern%20minimalist%20illustration%20of%20a%20person%20packing%20clothes%20into%20a%20branded%20laundry%20bag%2C%20clean%20design%20with%20soft%20colors&width=600&height=400&seq=2&orientation=landscape"
    },
    {
      number: "3",
      label: "TRANSPARENT",
      title: "Wait for our driver",
      description: "You'll receive a confirmation when our driver is nearby. They will collect your bags and take them to your local cleaning facility.",
      features: [
        { icon: <Bell className="h-5 w-5 text-blue-600" />, text: "Regular order updates" },
        { icon: <Computer className="h-5 w-5 text-blue-600" />, text: "Live driver tracking" }
      ],
      image: "https://readdy.ai/api/search-image?query=modern%20minimalist%20illustration%20of%20a%20delivery%20van%20with%20real-time%20tracking%20interface%2C%20clean%20design%20with%20soft%20colors&width=600&height=400&seq=3&orientation=landscape"
    },
    {
      number: "4",
      label: "CONVENIENT",
      title: "Relax while we take care of your laundry",
      description: "Your local partner facility will clean your items with utmost care. Our drivers will then deliver them back to you wherever you like. You're in control of your laundry, we just make it easier to get it done at home.",
      features: [
        { icon: <Clock className="h-5 w-5 text-blue-600" />, text: "24h turnaround time" },
        { icon: <Bell className="h-5 w-5 text-blue-600" />, text: "Real-time order status" },
        { icon: <Computer className="h-5 w-5 text-blue-600" />, text: "Easy to reschedule" }
      ],
      image: "https://readdy.ai/api/search-image?query=modern%20minimalist%20illustration%20of%20a%20person%20using%20mobile%20app%20to%20track%20laundry%20service%20status%2C%20clean%20design%20with%20soft%20colors&width=600&height=400&seq=4&orientation=landscape",
      hasButton: true
    }
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
        </div>

        {/* Process Cards Section */}
        <div className="relative">
          {/* Cards Container */}
          <div className="space-y-24 md:space-y-32">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
              >
                <div className="flex-1 max-w-lg">
                  <div className="mb-6">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                      {step.label}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
                      {step.number}. {step.title}
                    </h3>
                    <p className="text-gray-600 mt-4 text-lg leading-relaxed">
                      {step.description}
                    </p>
                    <div className="mt-8 space-y-4">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          {feature.icon}
                          <span className="text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    {step.hasButton && (
                      <button 
                        onClick={() => navigate("/contact")}
                        className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Schedule your pickup
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 max-w-lg">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
