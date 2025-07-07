import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const ConvenienceSection = () => {
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
            
            console.log('Laundry Service that works around your schedule section viewed');
            trackEvent('laundry_service_schedule_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime(),
              'section': 'Laundry Service that works around your schedule'
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
  
  return (
    <section className="py-20 bg-white" ref={sectionRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Content Column - Centered */}
          <div className="space-y-8 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-800 border border-gray-300 mx-auto">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">Your convenience is our priority</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold">Laundry Service That Works Around <span className="text-gray-600">Your Schedule</span></h2>
            
            <p className="text-lg text-gray-600">
              We understand your time is valuable. That's why we've designed our service to fit perfectly into your busy life. Schedule pickups and deliveries when it works for you - morning, afternoon, or evening.
            </p>
            
            <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
              {[
                "Flexible pickup and delivery windows",
                "Easy rescheduling through our app or website",
                "Real-time notifications when we're on our way",
                "24/7 customer support for any questions"
              ].map((item, index) => (
                <div key={index} className="flex items-center bg-gray-50 p-4 rounded-lg shadow-sm">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <svg className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Button 
                className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto group"
                onClick={() => navigate("/contact")}  
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Have Questions? Contact Us
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="mt-3 text-sm text-gray-600">
                Need help with scheduling or have special requirements?
                <br />Our friendly team is ready to assist you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
