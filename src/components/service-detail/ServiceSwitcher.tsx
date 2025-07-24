
import { Card, CardContent } from "@/components/ui/card";
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
    console.log('ServiceSwitcher: Navigating to service:', serviceId);
    navigate(`/service/${serviceId}`);
  };
  
  return (
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Other Services You Might Like</h2>
      
      {/* Grid layout for all screen sizes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
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
    </div>
  );
};
