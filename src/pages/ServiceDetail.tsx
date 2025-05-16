
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, WashingMachine, Package, Weight, Shirt, BadgePercent, Truck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ServiceWeightEstimateDialog } from "@/components/ServiceWeightEstimateDialog";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

// Service data
const servicesData = {
  "wash-fold": {
    name: "Wash & Fold",
    icon: <WashingMachine className="h-8 w-8 text-white" />,
    iconBg: "bg-blue-600",
    color: "bg-blue-50",
    themeColor: "#2563EB", // Added theme color
    description: "For everyday laundry, bedsheets and towels.",
    discount: 20,
    minimumOrder: null,
    prices: [
      {
        title: "Regular Wash",
        amount: "₹72/kg",
        oldPrice: "₹95/kg",
        details: "Light and dark clothes washed together at 90°F. You can request 110°F instead.",
        minimumOrder: 4
      }
    ]
  },
  "wash-iron": {
    name: "Wash & Iron",
    icon: <Shirt className="h-8 w-8 text-white" />,
    iconBg: "bg-pink-500",
    color: "bg-pink-50",
    themeColor: "#EC4899", // Added theme color
    description: "Your outfits, wrinkle-free and crisp.",
    discount: 20,
    minimumOrder: null,
    prices: [
      {
        title: "Regular Wash",
        amount: "₹120/kg",
        oldPrice: "₹150/kg",
        details: "Light and dark clothes washed together at 90°F and professionally ironed.",
        minimumOrder: 3
      }
    ]
  },
  "heavy-wash": {
    name: "Heavy Wash",
    icon: <Package className="h-8 w-8 text-white" />,
    iconBg: "bg-teal-500",
    color: "bg-teal-50",
    themeColor: "#14B8A6", // Added theme color
    description: "Big laundry loads handled with ease.",
    discount: 20,
    minimumOrder: null,
    prices: [
      {
        title: "Price per kg",
        amount: "₹112/kg",
        oldPrice: "₹140/kg",
        details: "Perfect for blankets, comforters, heavy jackets, and other bulky items."
      }
    ]
  },
  "dry-cleaning": {
    name: "Dry Cleaning",
    icon: <Weight className="h-8 w-8 text-white" />,
    iconBg: "bg-green-500",
    color: "bg-green-50",
    themeColor: "#22C55E", // Added theme color
    description: "Delicate care, speedy turnaround.",
    discount: 0,
    minimumOrder: null,
    prices: [
      {
        title: "Standard dry cleaning",
        amount: "₹200/item",
        oldPrice: "",
        details: "Professional dry cleaning for suits, dresses, and delicate fabrics."
      },
      {
        title: "Premium dry cleaning",
        amount: "₹300/item",
        oldPrice: "",
        details: "Enhanced treatment for special garments, includes stain removal and pressing."
      }
    ]
  }
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  
  useEffect(() => {
    // Find the service data based on the serviceId
    if (serviceId && serviceId in servicesData) {
      setService(servicesData[serviceId as keyof typeof servicesData]);
    } else {
      // Redirect to services if the service is not found
      navigate("/");
    }
  }, [serviceId, navigate]);
  
  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Get other services for the service switcher
  const otherServices = Object.entries(servicesData)
    .filter(([id]) => id !== serviceId)
    .map(([id, serviceData]: [string, any]) => ({
      id,
      name: serviceData.name,
      icon: serviceData.icon,
      iconBg: serviceData.iconBg,
      color: serviceData.color
    }));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pb-24">
        {/* Service detail header */}
        <div className={`${service.color} py-8 sm:py-12`}>
          <div className="max-w-5xl mx-auto px-4">
            <Button 
              variant="ghost" 
              className="mb-4 sm:mb-6 hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Back to Home</span>
            </Button>
            
            {/* Other Services Section - Now with Carousel for mobile */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Other Services You Might Like</h2>
              
              {/* Desktop view - Grid layout */}
              <div className="hidden md:grid md:grid-cols-3 gap-3 sm:gap-4">
                {otherServices.map((otherService) => (
                  <Card 
                    key={otherService.id}
                    className="border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-105 bg-white"
                    onClick={() => navigate(`/service/${otherService.id}`)}
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
                          onClick={() => navigate(`/service/${otherService.id}`)}
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
            </div>
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="max-w-5xl mx-auto px-4 mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Pricing</h2>
          <div className="space-y-6 sm:space-y-8">
            {service.prices.map((price: any, index: number) => (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <h3 className="text-lg sm:text-xl font-medium">{price.title}</h3>
                      <p className="text-gray-500 text-sm sm:text-base">{price.details}</p>
                      <div className="mt-2 sm:mt-3 text-xs flex items-center gap-1 text-blue-700">
                        <Truck className="h-3 w-3 flex-shrink-0" />
                        <span>Free pickup & delivery included</span>
                      </div>
                      {price.minimumOrder && (
                        <div className="text-xs flex items-center gap-1 text-orange-700">
                          <Info className="h-3 w-3 flex-shrink-0" />
                          <span>Minimum order: {price.minimumOrder}kg</span>
                        </div>
                      )}
                    </div>
                    <div className="sm:text-right">
                      {service.discount > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          <div className="flex items-center sm:justify-end gap-2">
                            <span className="font-bold text-xl sm:text-2xl text-green-700">{price.amount}</span>
                            <HoverCard>
                              <HoverCardTrigger>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium inline-block">
                                  Save {service.discount}% on first order
                                </span>
                              </HoverCardTrigger>
                              <HoverCardContent className="p-2 text-xs w-48">
                                Discount applied for first-time customers! Regular price is {price.oldPrice}.
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="line-through">{price.oldPrice}</span>
                            <span className="ml-1 text-xs">regular price</span>
                          </div>
                        </div>
                      ) : (
                        <div className="font-semibold text-xl sm:text-2xl text-gray-800">{price.amount}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium text-base sm:text-lg">Not sure how much you have?</h3>
              <ServiceWeightEstimateDialog 
                serviceName={service.name} 
                serviceColor={service.themeColor}
                buttonClassName="mt-2 sm:mt-3 text-sm sm:text-base"
              >
                <Button 
                  className="mt-2 sm:mt-3 text-sm sm:text-base"
                  style={{ backgroundColor: service.themeColor }}
                >
                  Get an estimate
                </Button>
              </ServiceWeightEstimateDialog>
            </div>
          </div>
          
          {/* About Service Section */}
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
                    <li>Sorting by color and fabric type</li>
                    <li>Pre-treatment for stains</li>
                    <li>Quality detergents and fabric softeners</li>
                    <li>Careful inspection before delivery</li>
                    <li>Next-day delivery at no extra cost</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Process</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
                  <p>When your laundry arrives at our facility, our experienced team sorts it according to color and fabric type. Each load is then carefully processed using our professional-grade machines with the appropriate temperature and detergent for the specific fabric type.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Turnaround Time</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 pt-0 text-sm sm:text-base">
                  <p>Standard turnaround time is 24 hours. Express service is available at an additional charge.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky Schedule Pickup CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 sm:py-6 shadow-lg z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
          <Button 
            style={{ backgroundColor: service.themeColor }}
            className="px-8 sm:px-12 py-5 sm:py-7 text-base sm:text-lg font-semibold w-full max-w-md hover:opacity-90"
            size="lg"
            onClick={() => navigate("/schedule")}
          >
            Schedule Pickup
          </Button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ServiceDetail;
