
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ServiceSelection } from "@/components/schedule/ServiceSelection";
import { AddressSelection } from "@/components/schedule/AddressSelection";
import { TimeSlotSelection } from "@/components/schedule/TimeSlotSelection";
import { OrderConfirmation } from "@/components/schedule/OrderConfirmation";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Steps in the scheduling flow
enum ScheduleStep {
  SERVICE_SELECTION = 0,
  ADDRESS_SELECTION = 1,
  TIME_SLOT_SELECTION = 2,
  ORDER_CONFIRMATION = 3,
}

// Represent a selected service
export interface SelectedService {
  id: string;
  name: string;
  price: number;
}

// Order data interface
export interface OrderData {
  services: SelectedService[];
  addressId: string | null;
  pickupDate: Date | null;
  pickupSlotId: string | null;
  pickupSlotLabel: string | null;
  deliveryDate: Date | null;
  deliverySlotId: string | null;
  deliverySlotLabel: string | null;
  specialInstructions: string;
  estimatedWeight: number | null;
  totalAmount: number | null;
}

const Schedule = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(ScheduleStep.SERVICE_SELECTION);
  const [orderData, setOrderData] = useState<OrderData>({
    services: [],
    addressId: null,
    pickupDate: null,
    pickupSlotId: null,
    pickupSlotLabel: null,
    deliveryDate: null,
    deliverySlotId: null,
    deliverySlotLabel: null,
    specialInstructions: "",
    estimatedWeight: null,
    totalAmount: null,
  });

  // Check if user is logged in
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to schedule a laundry pickup",
      });
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  // Handle next step transitions
  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  // Handle previous step transitions
  const handlePrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // Update order data
  const updateOrderData = (data: Partial<OrderData>) => {
    setOrderData((prev) => ({ ...prev, ...data }));
  };

  // If still checking authentication, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Display the appropriate step based on the current step
  const renderStep = () => {
    switch (currentStep) {
      case ScheduleStep.SERVICE_SELECTION:
        return (
          <ServiceSelection 
            orderData={orderData} 
            updateOrderData={updateOrderData} 
            onNext={handleNextStep} 
          />
        );
      case ScheduleStep.ADDRESS_SELECTION:
        return (
          <AddressSelection 
            orderData={orderData} 
            updateOrderData={updateOrderData} 
            onNext={handleNextStep} 
            onBack={handlePrevStep} 
          />
        );
      case ScheduleStep.TIME_SLOT_SELECTION:
        return (
          <TimeSlotSelection 
            orderData={orderData} 
            updateOrderData={updateOrderData} 
            onNext={handleNextStep} 
            onBack={handlePrevStep} 
          />
        );
      case ScheduleStep.ORDER_CONFIRMATION:
        return (
          <OrderConfirmation 
            orderData={orderData} 
            onBack={handlePrevStep} 
            onComplete={() => navigate("/")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {["Services", "Address", "Schedule", "Confirm"].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      index <= currentStep ? "bg-black text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-xs ${index <= currentStep ? "font-medium" : "text-gray-500"}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 h-1 bg-gray-200">
              <div 
                className="h-full bg-black transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Current step content */}
          {renderStep()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Schedule;
