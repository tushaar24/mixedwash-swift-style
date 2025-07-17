
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ServiceSelection } from "@/components/schedule/ServiceSelection";
import { AddressSelection } from "@/components/schedule/AddressSelection";
import { TimeSlotSelection } from "@/components/schedule/TimeSlotSelection";
import { OrderConfirmation } from "@/components/schedule/OrderConfirmation";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { addDays, startOfToday } from "date-fns";
import { trackEvent } from "@/utils/clevertap";

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

// Dry cleaning item interface
export interface DryCleaningItem {
  name: string;
  price: number;
  quantity: number;
}

// Schedule order data interface - renamed to avoid conflicts
export interface ScheduleOrderData {
  services: SelectedService[];
  addressId: string | null;
  pickupDate: Date | null;
  pickupSlotId: string | null;
  pickupSlotLabel: string | null;
  deliveryDate: Date | null;
  deliverySlotId: string | null;
  deliverySlotLabel: string | null;
  specialInstructions: string;
  dryCleaningItems: DryCleaningItem[];
}

const Schedule = () => {
  const { user, isLoading, profile, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(ScheduleStep.SERVICE_SELECTION);
  
  // Check if user came from CTA click
  const fromCTA = location.state?.fromCTA;
  
  // Track previous step to only fire events on actual step transitions
  const prevStepRef = useRef<ScheduleStep | null>(null);
  
  // Initialize with today's date as default pickup date
  const today = startOfToday();
  const [orderData, setOrderData] = useState<ScheduleOrderData>({
    services: [],
    addressId: null,
    pickupDate: today,
    pickupSlotId: null,
    pickupSlotLabel: null,
    deliveryDate: addDays(today, 1),
    deliverySlotId: null,
    deliverySlotLabel: null,
    specialInstructions: "",
    dryCleaningItems: [],
  });

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUserInfo = () => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined;

  // Handle return from auth and profile completion
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const fromAuth = urlParams.get('fromAuth');
    const orderDataParam = urlParams.get('orderData');
    const returnState = location.state;
    
    // Handle return from auth with URL parameter (for OAuth flows)
    if (fromAuth === 'true' && user && !isLoading) {
      console.log("Returning from auth via URL parameter");
      
      // Get order data from URL parameter if available
      let authOrderData = null;
      if (orderDataParam) {
        try {
          authOrderData = JSON.parse(decodeURIComponent(orderDataParam));
          console.log("Parsed order data from Google auth redirect:", authOrderData);
        } catch (e) {
          console.error("Failed to parse order data from URL:", e);
        }
      }
      
      // Use order data from URL parameter or existing order data
      const dataToUse = authOrderData || orderData;
      
      if (dataToUse.services && dataToUse.services.length > 0) {
        if (!isProfileComplete) {
          navigate("/profile", { 
            state: { 
              returnTo: "/schedule",
              returnStep: ScheduleStep.ADDRESS_SELECTION,
              orderData: dataToUse
            },
            replace: true
          });
        } else {
          console.log("Moving directly to address selection after Google auth");
          
          // Set the order data immediately
          setOrderData(authOrderData || dataToUse);
          
          // Clear URL parameters and setup proper navigation history
          window.history.replaceState(null, '', '/schedule');
          
          // Setup navigation history for proper back button behavior
          setTimeout(() => {
            // Push service selection to history first
            window.history.pushState(
              { step: ScheduleStep.SERVICE_SELECTION, orderData: authOrderData || dataToUse },
              'Service Selection',
              '/schedule'
            );
            
            // Then push address selection
            window.history.pushState(
              { step: ScheduleStep.ADDRESS_SELECTION, orderData: authOrderData || dataToUse },
              'Address Selection', 
              '/schedule'
            );
            
            setCurrentStep(ScheduleStep.ADDRESS_SELECTION);
          }, 0);
        }
      } else {
        // No order data, clear URL parameters and start fresh
        window.history.replaceState(null, '', '/schedule');
        setCurrentStep(ScheduleStep.SERVICE_SELECTION);
      }
    }
    
    // Handle return from profile completion
    if (returnState?.returnTo === "/schedule" && returnState?.returnStep && returnState?.orderData) {
      console.log("Returning from profile completion");
      setOrderData(returnState.orderData);
      
      // Clear the return state and setup proper navigation history
      navigate(location.pathname, { replace: true });
      
      setTimeout(() => {
        // Push service selection to history first
        window.history.pushState(
          { step: ScheduleStep.SERVICE_SELECTION, orderData: returnState.orderData },
          'Service Selection',
          '/schedule'
        );
        
        // Then push the target step (usually address selection)
        if (returnState.returnStep === ScheduleStep.ADDRESS_SELECTION) {
          window.history.pushState(
            { step: ScheduleStep.ADDRESS_SELECTION, orderData: returnState.orderData },
            'Address Selection',
            '/schedule'
          );
        }
        
        setCurrentStep(returnState.returnStep);
      }, 0);
      
      return;
    }
  }, [user, isLoading, isProfileComplete, location.search, location.state, navigate]);

  // Handle browser back button with proper history management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (window.location.pathname === '/schedule' && event.state) {
        // Get the step from the popped state
        const targetStep = event.state.step;
        if (typeof targetStep === 'number' && targetStep >= 0 && targetStep <= 3) {
          console.log(`Browser back button: navigating to step ${targetStep}`);
          setCurrentStep(targetStep);
          
          // Restore order data if available in the state
          if (event.state.orderData) {
            setOrderData(event.state.orderData);
          }
          
          window.scrollTo(0, 0);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track step views only on actual step transitions
  useEffect(() => {
    // Only fire "viewed" events when there's an actual step change
    // or on the very first load (when prevStepRef.current is null)
    if (prevStepRef.current !== currentStep) {
      const userInfo = getUserInfo();
      
      const trackStepView = () => {
        switch (currentStep) {
          case ScheduleStep.SERVICE_SELECTION:
            trackEvent('select_service_screen_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime()
            });
            break;
          case ScheduleStep.ADDRESS_SELECTION:
            trackEvent('add_address_screen_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime()
            });
            break;
          case ScheduleStep.TIME_SLOT_SELECTION:
            trackEvent('slot_selection_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime()
            });
            break;
          case ScheduleStep.ORDER_CONFIRMATION:
            trackEvent('confirm_order_viewed', {
              'customer name': userInfo?.name || 'Anonymous',
              'customer id': userInfo?.user_id || 'Anonymous',
              'current_time': getCurrentTime(),
              'selected_services': orderData.services.map(s => s.name).join(', '),
              'delivery': orderData.deliveryDate?.toDateString() + ' ' + orderData.deliverySlotLabel,
              'pickup': orderData.pickupDate?.toDateString() + ' ' + orderData.pickupSlotLabel,
              'pickup and delivery address': orderData.addressId || 'Not selected'
            });
            break;
        }
      };

      // If coming from CTA and on service selection step (first load), 
      // delay to ensure CTA click event fires first
      if (fromCTA && currentStep === ScheduleStep.SERVICE_SELECTION && prevStepRef.current === null) {
        const timer = setTimeout(trackStepView, 500);
        // Update the ref after scheduling the event
        prevStepRef.current = currentStep;
        return () => clearTimeout(timer);
      } else {
        // For all other step transitions, fire immediately
        trackStepView();
        prevStepRef.current = currentStep;
      }
    }
  }, [currentStep, user, profile, fromCTA, orderData.services, orderData.deliveryDate, orderData.pickupDate, orderData.deliverySlotLabel, orderData.pickupSlotLabel, orderData.addressId]);

  // Handle next step transitions
  const handleNextStep = () => {
    // Log the current state before moving to the next step
    console.log("Current step:", currentStep);
    console.log("Order data before next step:", orderData);
    
    const userInfo = getUserInfo();
    
    // Track step-specific events before validation
    if (currentStep === ScheduleStep.SERVICE_SELECTION) {
      trackEvent('select_service_screen_continue_to_address_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': getCurrentTime(),
        'services_selected': orderData.services.map(s => s.name).join(', ')
      });
      
      // Auth check is now done in ServiceSelection component
      // If we reach here, user is authenticated and profile is complete
    }
    
    if (currentStep === ScheduleStep.TIME_SLOT_SELECTION) {
      trackEvent('slot_selection_continue_to_confirm_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': getCurrentTime(),
        'date': orderData.pickupDate?.toDateString() || '',
        'time_slot': orderData.pickupSlotLabel || '',
        'delivery_date': orderData.deliveryDate?.toDateString() || '',
        'delivery_time_slot': orderData.deliverySlotLabel || ''
      });
    }
    
    // Validate current step data before proceeding
    if (currentStep === ScheduleStep.SERVICE_SELECTION && orderData.services.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one laundry service",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === ScheduleStep.ADDRESS_SELECTION && !orderData.addressId) {
      toast({
        title: "No address selected",
        description: "Please select or add a delivery address",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === ScheduleStep.TIME_SLOT_SELECTION) {
      if (!orderData.pickupDate || !orderData.pickupSlotId) {
        toast({
          title: "Missing pickup information",
          description: "Please select a pickup date and time slot",
          variant: "destructive"
        });
        return;
      }
      
      // Ensure delivery information is properly set
      // (This should already be handled by TimeSlotSelection component)
    }
    
    const nextStep = currentStep + 1;
    
    // Push new state to history for proper back button behavior
    window.history.pushState(
      { 
        step: nextStep, 
        orderData: orderData 
      },
      getStepTitle(nextStep),
      '/schedule'
    );
    
    setCurrentStep(nextStep);
    window.scrollTo(0, 0);
  };

  // Helper function to get step titles
  const getStepTitle = (step: number) => {
    switch (step) {
      case ScheduleStep.SERVICE_SELECTION: return 'Service Selection';
      case ScheduleStep.ADDRESS_SELECTION: return 'Address Selection';
      case ScheduleStep.TIME_SLOT_SELECTION: return 'Time Slot Selection';
      case ScheduleStep.ORDER_CONFIRMATION: return 'Order Confirmation';
      default: return 'Schedule';
    }
  };

  // Handle previous step transitions
  const handlePrevStep = () => {
    const userInfo = getUserInfo();
    
    // Track back button events
    if (currentStep === ScheduleStep.ADDRESS_SELECTION) {
      trackEvent('add_address_screen_back_to_services_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': getCurrentTime(),
        'type': 'manual' // This would need to be dynamic based on address type
      });
    }
    
    if (currentStep === ScheduleStep.ORDER_CONFIRMATION) {
      trackEvent('confirm_order_back_to_schedule_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': getCurrentTime(),
        'selected_services': orderData.services.map(s => s.name).join(', '),
        'delivery': orderData.deliveryDate?.toDateString() + ' ' + orderData.deliverySlotLabel,
        'pickup': orderData.pickupDate?.toDateString() + ' ' + orderData.pickupSlotLabel,
        'pickup and delivery address': orderData.addressId || 'Not selected'
      });
    }
    
    // Use browser's back functionality to maintain proper history
    window.history.back();
  };

  // Update order data
  const updateOrderData = (data: Partial<ScheduleOrderData>) => {
    setOrderData((prev) => {
      const updated = { ...prev, ...data };
      console.log("Updated order data:", updated);
      
      // Update current history state with new order data
      window.history.replaceState(
        { 
          step: currentStep, 
          orderData: updated 
        },
        getStepTitle(currentStep),
        '/schedule'
      );
      
      return updated;
    });
  };
  
  // Initialize history state when component mounts or step changes
  useEffect(() => {
    // Only set initial history state if we don't have one
    if (!window.history.state || window.history.state.step !== currentStep) {
      window.history.replaceState(
        { 
          step: currentStep, 
          orderData: orderData 
        },
        getStepTitle(currentStep),
        '/schedule'
      );
    }
  }, [currentStep, orderData]);

  // Show loading only when we need authentication for address selection and beyond
  if (isLoading && currentStep > ScheduleStep.SERVICE_SELECTION && user) {
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
    </div>
  );
};

export default Schedule;
