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

  // Scroll tracking effect with debugging
  useEffect(() => {
    console.log('WhyChooseUs: Setting up Intersection Observer');
    
    const observer = new IntersectionObserver(
      (entries) => {
        console.log('WhyChooseUs: Intersection Observer callback triggered', entries);
        entries.forEach((entry) => {
          console.log('WhyChooseUs: Entry details', {
            isIntersecting: entry.isIntersecting,
            intersectionRatio: entry.intersectionRatio,
            hasTracked: hasTrackedScrollRef.current,
            target: entry.target,
            boundingClientRect: entry.boundingClientRect
          });
          
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
        threshold: 0.25,
        rootMargin: '0px 0px -30px 0px'
      }
    );

    if (sectionRef.current) {
      console.log('WhyChooseUs: Observing element:', sectionRef.current);
      observer.observe(sectionRef.current);
    } else {
      console.log('WhyChooseUs: No element to observe');
    }

    return () => {
      console.log('WhyChooseUs: Cleaning up Intersection Observer');
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
    <section id="why-choose-us" className="bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Why Choose MixedWash</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another laundry service. Here's what makes us different.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                {benefit.icon}
              </div>
              <div>
                <h3 className="font-bold text-xl">{benefit.title}</h3>
                <p className="mt-2 text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
