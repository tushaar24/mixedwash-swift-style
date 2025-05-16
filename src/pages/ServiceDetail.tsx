
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, WashingMachine, Package, Weight, Shirt } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Service data
const servicesData = {
  "wash-fold": {
    name: "Wash & Fold",
    icon: <WashingMachine className="h-8 w-8 text-white" />,
    iconBg: "bg-blue-600",
    color: "bg-blue-50",
    description: "For everyday laundry, bedsheets and towels.",
    prices: [
      {
        title: "Normal Wash",
        amount: "₹72/kg",
        totalAmount: "₹1080 (per 15kg)",
        details: "Light and dark clothes washed together at 90°F. You can request 110°F instead."
      },
      {
        title: "Segregated Wash",
        amount: "₹72/kg",
        totalAmount: "₹1800 (per 25kg)",
        details: "We'll separate the items for you and wash at 90°F. Starts with two loads. You can request 110°F instead."
      }
    ]
  },
  "wash-iron": {
    name: "Wash & Iron",
    icon: <Shirt className="h-8 w-8 text-white" />,
    iconBg: "bg-pink-500",
    color: "bg-pink-50",
    description: "Your outfits, wrinkle-free and crisp.",
    prices: [
      {
        title: "Normal Wash with ironing",
        amount: "₹120/kg",
        totalAmount: "₹1800 (per 15kg)",
        details: "Light and dark clothes washed together at 90°F and professionally ironed."
      },
      {
        title: "Segregated Wash with premium ironing",
        amount: "₹120/kg",
        totalAmount: "₹3000 (per 25kg)",
        details: "Each item is individually ironed to perfection, with special care for formal and delicate garments."
      }
    ]
  },
  "heavy-wash": {
    name: "Heavy Wash",
    icon: <Package className="h-8 w-8 text-white" />,
    iconBg: "bg-teal-500",
    color: "bg-teal-50",
    description: "Big laundry loads handled with ease.",
    prices: [
      {
        title: "Normal Heavy Wash",
        amount: "₹112/kg",
        totalAmount: "₹1680 (per 15kg)",
        details: "Perfect for blankets, comforters, heavy jackets, and other bulky items."
      },
      {
        title: "Segregated Heavy Wash",
        amount: "₹112/kg",
        totalAmount: "₹2800 (per 25kg)",
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
    prices: [
      {
        title: "Standard dry cleaning",
        amount: "₹200/item",
        totalAmount: "Starting at ₹200/item",
        details: "Professional dry cleaning for suits, dresses, and delicate fabrics."
      },
      {
        title: "Premium dry cleaning",
        amount: "₹300/item",
        totalAmount: "Starting at ₹300/item",
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
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <Tabs defaultValue="prices" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="prices" className="text-base">Prices</TabsTrigger>
              <TabsTrigger value="about" className="text-base">About service</TabsTrigger>
            </TabsList>
            
            {/* Prices tab content */}
            <TabsContent value="prices" className="space-y-8">
              {service.prices.map((price: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-medium">{price.title}</h3>
                      <p className="text-gray-500 mt-2">{price.details}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{price.totalAmount}</div>
                      <div className="text-gray-500">{price.amount}</div>
                    </div>
                  </div>
                </div>
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
            </TabsContent>
            
            {/* About tab content */}
            <TabsContent value="about">
              <div className="prose max-w-none">
                <h3>About {service.name} Service</h3>
                <p>Our {service.name} service provides professional cleaning for your garments with the utmost care and attention to detail. We use high-quality detergents and state-of-the-art machines to ensure your clothes come back fresh and clean.</p>
                
                <h4>What's included:</h4>
                <ul>
                  <li>Sorting by color and fabric type</li>
                  <li>Pre-treatment for stains</li>
                  <li>Quality detergents and fabric softeners</li>
                  <li>Careful inspection before delivery</li>
                  <li>Next-day delivery at no extra cost</li>
                </ul>
                
                <h4>Process:</h4>
                <p>When your laundry arrives at our facility, our experienced team sorts it according to color and fabric type. Each load is then carefully processed using our professional-grade machines with the appropriate temperature and detergent for the specific fabric type.</p>
                
                <h4>Turnaround Time:</h4>
                <p>Standard turnaround time is 24 hours. Express service is available at an additional charge.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {/* Sticky Schedule Pickup CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
        <div className="max-w-5xl mx-auto px-4 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">From</div>
            <div className="font-bold">{service.prices[0].amount}</div>
          </div>
          <Button 
            className="bg-black hover:bg-gray-800 px-10"
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
