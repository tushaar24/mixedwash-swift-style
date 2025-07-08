import { Calendar, Home, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";
export const HowItWorks = () => {
  const {
    user,
    profile
  } = useAuth();
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
  const steps = [{
    number: "1",
    title: "Schedule your pickup effortlessly",
    description: "Use our simple booking system to schedule a convenient time for us to collect your laundry.",
    icon: <Calendar className="h-8 w-8 text-blue-600" />
  }, {
    number: "2",
    title: "We pick up your laundry at your doorstep",
    description: "Our friendly team arrives at your doorstep at the scheduled time to collect and weigh your items.",
    icon: <Home className="h-8 w-8 text-blue-600" />
  }, {
    number: "3",
    title: "Clean laundry delivered next day, guaranteed",
    description: "Your fresh, clean laundry is delivered back to you the next day, no extra charge.",
    icon: <Package className="h-8 w-8 text-blue-600" />
  }];
  return <section id="how-it-works" className="bg-gray-50" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold my-[30px]">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Book. Pickup. Deliver. It's that simple.
          </p>
          <div className="inline-flex items-center gap-2 mt-4 bg-blue-100 px-4 py-2 rounded-full text-blue-800 border border-blue-300">
            <span className="text-sm font-semibold">Free pickup & delivery on all orders!</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {step.number}
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">{step.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {index < steps.length - 1 && <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-1 bg-blue-400 transform rotate-180"></div>}
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};