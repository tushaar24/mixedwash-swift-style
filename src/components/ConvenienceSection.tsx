
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, MessageSquareText } from "lucide-react";

export const ConvenienceSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Content Column - Centered */}
          <div className="space-y-6 max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-gray-800 border border-gray-300 mx-auto">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-semibold">Your convenience is our priority</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold">Laundry Service That Works Around <span className="text-gray-600">Your Schedule</span></h2>
            
            <p className="text-lg text-gray-600">
              We understand your time is valuable. That's why we've designed our service to fit perfectly into your busy life. Schedule pickups and deliveries when it works for you - morning, afternoon, or evening.
            </p>
            
            <ul className="space-y-3 text-left max-w-lg mx-auto">
              {[
                "Flexible pickup and delivery windows",
                "Easy rescheduling through our app or website",
                "Real-time notifications when we're on our way",
                "24/7 customer support for any questions"
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                    <svg className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            
            <div className="pt-4">
              <Button 
                className="bg-black hover:bg-gray-800 text-white px-6 py-6 h-auto group"
                onClick={() => window.location.href = "#contact"}  
              >
                <MessageSquareText className="mr-2 h-5 w-5" />
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
