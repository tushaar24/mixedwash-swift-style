import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, WashingMachine, Package, Weight, Shirt, BadgePercent, Truck, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

// Service data
const servicesData = {
  "wash-fold": {
    name: "Wash & Fold",
    icon: <WashingMachine className="h-8 w-8 text-white" />,
    iconBg: "bg-blue-600",
    color: "bg-blue-50",
    description: "For everyday laundry, bedsheets and towels.",
    discount: 20,
    minimumOrder: 4,
    prices: [
      {
        title: "Regular Wash",
        amount: "₹72/kg",
        oldPrice: "₹95/kg",
        details: "Light and dark clothes washed together at 90°F. You can request 110°F instead.",
        minimumOrder: 4
      },
      {
        title: "Segregated Wash",
        amount: "₹72/kg",
        oldPrice: "₹95/kg",
        details: "We'll separate the items for you and wash at 90°F. Starts with two loads. You can request 110°F instead.",
        minimumOrder: 8
      }
    ]
  },
  "wash-iron": {
    name: "Wash & Iron",
    icon: <Shirt className="h-8 w-8 text-white" />,
    iconBg: "bg-pink-500",
    color: "bg-pink-50",
    description: "Your outfits, wrinkle-free and crisp.",
    discount: 20,
    minimumOrder: 3,
    prices: [
      {
        title: "Regular Wash with ironing",
        amount: "₹120/kg",
        oldPrice: "₹150/kg",
        details: "Light and dark clothes washed together at 90°F and professionally ironed.",
        minimumOrder: 3
      },
      {
        title: "Segregated Wash with premium ironing",
        amount: "₹120/kg",
        oldPrice: "₹150/kg",
        details: "Each item is individually ironed to perfection, with special care for formal and delicate garments.",
        minimumOrder: 6
      }
    ]
  },
  "heavy-wash": {
    name: "Heavy Wash",
    icon: <Package className="h-8 w-8 text-white" />,
    iconBg: "bg-teal-500",
    color: "bg-teal-50",
    description: "Big laundry loads handled with ease.",
    discount: 20,
    minimumOrder: null,
    prices: [
      {
        title: "Normal Heavy Wash",
        amount: "₹112/kg",
        oldPrice: "₹140/kg",
        details: "Perfect for blankets, comforters, heavy jackets, and other bulky items."
      },
      {
        title: "Segregated Heavy Wash",
        amount: "₹112/kg",
        oldPrice: "₹140/kg",
        details: "Special treatment for heavily soiled items, includes pre-treatment and extra wash cycles."
      }
    ]
  },
  "dry-cleaning": {
    name: "Dry Cleaning",
    icon: <Weight className="h-8 w-8 text-white" />,
    iconBg: "bg-green-500",
    color: "bg-green-50",
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pb-24">
        {/* Service detail header */}
        <div className={`${service.color} py-12`}>
          <div className="max-w-5xl mx-auto px-4">
            <Button 
              variant="ghost" 
              className="mb-6 hover:bg-white/20"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center">
              <div className={`${service.iconBg} p-4 rounded-full mr-4`}>
                {service.icon}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{service.name}</h1>
                <p className="text-lg text-gray-600 mt-2">{service.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
              {service.discount > 0 && (
                <div className="inline-flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full text-amber-800 border border-amber-300">
                  <BadgePercent className="h-4 w-4" />
                  <span className="text-sm font-semibold">{service.discount}% OFF on your first order!</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-800 border border-blue-300">
                <Truck className="h-4 w-4" />
                <span className="text-sm font-semibold">Free pickup & delivery on all orders!</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <h2 className="text-2xl font-bold mb-6">Pricing</h2>
          <div className="space-y-8">
            {service.prices.map((price: any, index: number) => (
              <Card key={index} className="border shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{price.title}</h3>
                      <p className="text-gray-500 mt-2">{price.details}</p>
                      <div className="mt-3 text-xs text-blue-700 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        <span>Free pickup & delivery included</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {service.discount > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-green-700">{price.amount}</span>
                            <HoverCard>
                              <HoverCardTrigger>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
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
                        <div className="font-semibold text-gray-800">{price.amount}</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mt-8">
              <h3 className="font-medium text-lg">Not sure how much you have?</h3>
              <Button 
                className="mt-3 bg-blue-700 hover:bg-blue-800"
                onClick={() => navigate("/schedule")}
              >
                Get an estimate
              </Button>
            </div>
          </div>
          
          {/* About Service Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">About {service.name}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Service Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Our {service.name} service provides professional cleaning for your garments with the utmost care and attention to detail. We use high-quality detergents and state-of-the-art machines to ensure your clothes come back fresh and clean.</p>
                  {service.minimumOrder && (
                    <div className="mt-4 flex items-center gap-2 text-orange-700">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <p><strong>Minimum order:</strong> {service.minimumOrder}kg</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>What's included</CardTitle>
                </CardHeader>
                <CardContent>
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
                <CardHeader>
                  <CardTitle>Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>When your laundry arrives at our facility, our experienced team sorts it according to color and fabric type. Each load is then carefully processed using our professional-grade machines with the appropriate temperature and detergent for the specific fabric type.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Turnaround Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Standard turnaround time is 24 hours. Express service is available at an additional charge.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky Schedule Pickup CTA - Updated to be centered and bigger with no pricing */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-6 shadow-lg z-10">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
          <Button 
            className="bg-black hover:bg-gray-800 px-12 py-7 text-lg font-semibold w-full max-w-md"
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
