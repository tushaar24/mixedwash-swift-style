
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquareText } from "lucide-react";

export const Hero = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Fast, Friendly Laundry—
              <span className="block">Next-Day Guaranteed!</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg">
              Laundry shouldn't slow you down. MixedWash delivers next-day laundry at no extra cost, always reliable, always easy.
            </p>
            <div className="pt-2 flex flex-col space-y-4">
              <Button className="bg-black hover:bg-gray-800 text-white px-6 py-4 text-lg h-auto group w-full sm:w-auto">
                Schedule Your Laundry Pickup
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                className="border-gray-300 hover:bg-gray-100 px-6 py-4 h-auto text-lg w-full sm:w-auto"
                onClick={() => window.location.href = "#contact"}
              >
                <MessageSquareText className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
          
          {/* Phone mockup - visible on md screens and up */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[280px] h-[570px] bg-gray-900 rounded-[40px] border-[14px] border-gray-900 shadow-xl relative overflow-hidden">
                {/* Phone notch */}
                <div className="absolute top-0 w-full flex justify-center z-10">
                  <div className="w-[120px] h-[25px] bg-gray-900 rounded-b-[20px]"></div>
                </div>
                {/* Phone content/screen */}
                <div className="h-full w-full bg-white overflow-hidden relative">
                  {/* Phone app content */}
                  <img 
                    src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                    alt="MixedWash App" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {/* App interface overlay */}
                  <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-4 text-white">
                      <div className="text-sm font-medium">9:41</div>
                      <div className="text-sm font-medium">MixedWash</div>
                    </div>
                    <div className="mt-auto bg-white bg-opacity-90 p-4 rounded-lg shadow-lg">
                      <div className="text-sm font-medium mb-1">Next Delivery</div>
                      <div className="text-lg font-bold mb-2">Tomorrow, 2-4 PM</div>
                      <div className="bg-black text-white text-xs py-2 rounded-md text-center font-medium">
                        Track My Order
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile image - only visible on small screens */}
          <div className="md:hidden mt-6">
            <div className="bg-gray-100 rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" 
                alt="Clean, folded laundry" 
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
