import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { servicesData } from "@/components/service-detail/ServiceData";
import { ServiceHeader } from "@/components/service-detail/ServiceHeader";
import { ServiceSwitcher } from "@/components/service-detail/ServiceSwitcher";
import { PricingSection } from "@/components/service-detail/PricingSection";
import { AboutService } from "@/components/service-detail/AboutService";
import { SchedulePickupFooter } from "@/components/service-detail/SchedulePickupFooter";

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
