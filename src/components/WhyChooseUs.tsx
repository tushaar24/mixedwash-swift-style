import { Check, Clock, Shield, Shirt } from "lucide-react";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const WhyChooseUs = () => {
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

  // Reset tracking flag when component mounts
  useEffect(() => {
    hasTrackedScrollRef.current = false;
  }, []);

  // Scroll tracking effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTrackedScrollRef.current) {
            hasTrackedScrollRef.current = true;
            
            const userInfo = getUserInfo();
            
            console.log('WhyChooseUs: EVENT TRIGGERED - Why Choose MixedWash section viewed');
            trackEvent('why_choose_mixedwash_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime(),
              'section': 'Why Choose MixedWash'
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
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

  const benefits = [
    {
      title: "Next-Day Delivery",
      description: "Quick turnaround without the extra cost.",
      icon: <Clock className="h-10 w-10" />
    },
    {
      title: "Trust & Reliability",
      description: "We show up exactly when promised—every single time.",
      icon: <Check className="h-10 w-10" />
    },
    {
      title: "Free Reprocessing Guarantee",
      description: "Not satisfied? We'll wash it again, completely free.",
      icon: <Shirt className="h-10 w-10" />
    },
    {
      title: "Your Clothes, Safe & Sound",
      description: "We take care of your clothes like they're our own. No lost items, guaranteed.",
      icon: <Shield className="h-10 w-10" />
    }
  ];

  return (
    <section 
      id="why-choose-us" 
      className="relative bg-slate-800" 
      ref={sectionRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Why Choose MixedWash</h2>
          <p className="mt-4 text-lg text-slate-200 max-w-2xl mx-auto">
            We're not just another laundry service. Here's what makes us different.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-slate-100 p-3 rounded-xl flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-xl text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
