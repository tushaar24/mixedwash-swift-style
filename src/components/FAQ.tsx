import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useEffect, useRef } from "react";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

export const FAQ = () => {
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
            
            console.log('FAQ: EVENT TRIGGERED - Frequently Asked Questions section viewed');
            trackEvent('faq_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime(),
              'section': 'Frequently Asked Questions'
            });
          }
        });
      },
      {
        threshold: 0.1,
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

  const faqs = [
    {
      question: "Is next-day delivery really guaranteed?",
      answer: "Absolutely! Every order is delivered next day without extra charges. That's our standard service level."
    },
    {
      question: "What if I'm not satisfied with the service?",
      answer: "We'll reprocess your laundry free of charge until you're completely happy. Customer satisfaction is our priority."
    },
    {
      question: "How do I know my clothes are safe?",
      answer: "Our reliable service ensures zero lost items and total peace of mind. We have extensive tracking systems in place."
    },
    {
      question: "How do I schedule a pickup?",
      answer: "Simply use our website or app to schedule a convenient pickup time. We'll be there at your doorstep!"
    }
  ];

  return (
    <section id="faq" className="bg-gray-50" ref={sectionRef}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get answers to the most common questions about our service.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
