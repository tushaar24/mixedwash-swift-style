
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { servicesData } from "@/components/service-detail/ServiceData";
import { ServiceHeader } from "@/components/service-detail/ServiceHeader";
import { ServiceSwitcher } from "@/components/service-detail/ServiceSwitcher";
import { PricingSection } from "@/components/service-detail/PricingSection";
import { AboutService } from "@/components/service-detail/AboutService";
import { SchedulePickupFooter } from "@/components/service-detail/SchedulePickupFooter";
import { trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const { user, profile } = useAuth();
  
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
  
  useEffect(() => {
    // Find the service data based on the serviceId
    if (serviceId && serviceId in servicesData) {
      const foundService = servicesData[serviceId as keyof typeof servicesData];
      setService(foundService);
      
      // Track service detail screen viewed
      const userInfo = getUserInfo();
      trackEvent('service_detail_screen_viewed', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': getCurrentTime(),
        'service_type': foundService.name
      });
    } else {
      // Redirect to services if the service is not found
      navigate("/");
    }
  }, [serviceId, navigate, user, profile]);
  
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
        {/* Service Header Component */}
        <ServiceHeader service={service} serviceColor={service.color} />
        
        {/* Other services component */}
        <div className="max-w-5xl mx-auto px-4">
          <ServiceSwitcher otherServices={otherServices} />
          
          {/* Pricing Section Component */}
          <PricingSection service={service} serviceId={serviceId} />
          
          {/* About Service Component */}
          <AboutService service={service} />
        </div>
      </main>
      
      {/* Sticky Schedule Pickup CTA */}
      <SchedulePickupFooter />
    </div>
  );
};

export default ServiceDetail;
