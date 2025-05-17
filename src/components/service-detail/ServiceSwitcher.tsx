
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useNavigate } from "react-router-dom";

interface OtherService {
  id: string;
  name: string;
  icon: React.ReactNode;
  iconBg: string;
  color: string;
}

interface ServiceSwitcherProps {
  otherServices: OtherService[];
}

export const ServiceSwitcher = ({ otherServices }: ServiceSwitcherProps) => {
  const navigate = useNavigate();
  
  const handleServiceClick = (serviceId: string) => {
    // Force a full navigation to the new service detail page to ensure proper loading
    window.location.href = `/service/${serviceId}`;
  };
  
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Other Services You Might Like</h2>
      
      {/* Desktop view - Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 sm:gap-4">
        {otherServices.map((otherService) => (
          <Card 
            key={otherService.id}
            className="border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white"
            onClick={() => handleServiceClick(otherService.id)}
          >
            <CardContent className="p-3 sm:p-4 flex items-center gap-2">
              <div className={`${otherService.iconBg} p-2 rounded-full flex items-center justify-center`}>
                {otherService.icon}
              </div>
              <h3 className="font-medium text-sm sm:text-base">{otherService.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Mobile view - Horizontal scrollable carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {otherServices.map((otherService) => (
              <CarouselItem key={otherService.id} className="pl-2 md:pl-4 basis-4/5 sm:basis-2/3">
                <Card 
                  className="border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer bg-white h-full"
                  onClick={() => handleServiceClick(otherService.id)}
                >
                  <CardContent className="p-3 flex items-center gap-2 h-full">
                    <div className={`${otherService.iconBg} p-2 rounded-full flex items-center justify-center`}>
                      {otherService.icon}
                    </div>
                    <h3 className="font-medium text-sm">{otherService.name}</h3>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};
