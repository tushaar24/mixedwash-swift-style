
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

interface AboutServiceProps {
  service: any;
}

export const AboutService = ({ service }: AboutServiceProps) => {
  // Define what's included based on service type
  const getWhatsIncluded = () => {
    const serviceName = service.name.toLowerCase();
    
    // For wash & fold and wash & iron, exclude sorting and pre-treatment
    if (serviceName.includes('wash & fold') || serviceName.includes('wash & iron')) {
      return [
        "Quality detergents and fabric softeners",
        "Careful inspection before delivery",
        "Next-day delivery at no extra cost"
      ];
    }
    
    // For other services (heavy wash, dry cleaning), include all items
    return [
      "Sorting by color and fabric type",
      "Pre-treatment for stains",
      "Quality detergents and fabric softeners",
      "Careful inspection before delivery",
      "Next-day delivery at no extra cost"
    ];
  };

  // Define process description based on service type
  const getProcessDescription = () => {
    const serviceName = service.name.toLowerCase();
    
    // For wash & fold and wash & iron, exclude sorting mention
    if (serviceName.includes('wash & fold') || serviceName.includes('wash & iron')) {
      return "When your laundry arrives at our facility, our experienced team carefully processes each load using our professional-grade machines with the appropriate temperature and detergent for the specific fabric type.";
    }
    
    // For other services (heavy wash, dry cleaning), include sorting
    return "When your laundry arrives at our facility, our experienced team sorts it according to color and fabric type. Each load is then carefully processed using our professional-grade machines with the appropriate temperature and detergent for the specific fabric type.";
  };

  return (
    <div className="mt-12 sm:mt-16">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">About {service.name}</h2>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Service Description</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
            <p>Our {service.name} service provides professional cleaning for your garments with the utmost care and attention to detail. We use high-quality detergents and state-of-the-art machines to ensure your clothes come back fresh and clean.</p>
            {service.minimumOrder && (
              <div className="mt-3 sm:mt-4 flex items-center gap-2 text-orange-700 text-sm">
                <Info className="h-4 w-4 flex-shrink-0" />
                <p><strong>Minimum order:</strong> {service.minimumOrder}kg</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">What's included</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
            <ul className="list-disc pl-5 space-y-1">
              {getWhatsIncluded().map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Process</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
            <p>{getProcessDescription()}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Turnaround Time</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
            <p>Standard turnaround time is {service.deliveryTime}.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
