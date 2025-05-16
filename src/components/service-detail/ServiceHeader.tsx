
import { Button } from "@/components/ui/button";
import { ArrowLeft, BadgePercent, Truck, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceHeaderProps {
  service: any;
  serviceColor: string;
}

export const ServiceHeader = ({ service, serviceColor }: ServiceHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className={`${serviceColor} py-8 sm:py-12`}>
      <div className="max-w-5xl mx-auto px-4">
        <Button 
          variant="ghost" 
          className="mb-4 sm:mb-6 hover:bg-white/20"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back to Home</span>
        </Button>
        
        <div className="flex items-center">
          <div className={`${service.iconBg} p-3 sm:p-4 rounded-full mr-3 sm:mr-4`}>
            {service.icon}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{service.name}</h1>
            <p className="text-base sm:text-lg text-gray-600 mt-1 sm:mt-2">{service.description}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
          {service.discount > 0 && (
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-amber-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-amber-800 border border-amber-300 text-xs sm:text-sm w-full sm:w-auto">
              <BadgePercent className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-semibold">{service.discount}% OFF on your first order!</span>
            </div>
          )}
          <div className="inline-flex items-center gap-1 sm:gap-2 bg-blue-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-blue-800 border border-blue-300 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
            <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-semibold">Free pickup & delivery on all orders!</span>
          </div>
          
          <div className="inline-flex items-center gap-1 sm:gap-2 bg-gray-100 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-gray-800 border border-gray-300 text-xs sm:text-sm w-full sm:w-auto mt-2 sm:mt-0">
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="font-semibold">{service.deliveryTime} delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
