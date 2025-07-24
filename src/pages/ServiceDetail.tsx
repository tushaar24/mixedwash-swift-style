import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { servicesData } from "@/components/service-detail/ServiceData";
import { ServiceHeader } from "@/components/service-detail/ServiceHeader";
import { ServiceSwitcher } from "@/components/service-detail/ServiceSwitcher";
import { PricingSection } from "@/components/service-detail/PricingSection";
import { AboutService } from "@/components/service-detail/AboutService";
import { SchedulePickupFooter } from "@/components/service-detail/SchedulePickupFooter";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

const ServiceDetail = () => {
  const { serviceSlug } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const { user, profile } = useAuth();
  
  console.log('ServiceDetail component mounted with serviceSlug:', serviceSlug);
  
  // Memoize SEO data to prevent recalculation
  const seoData = useMemo(() => {
    if (!serviceSlug) {
      return {
        title: "Service - MixedWash Bangalore",
        description: "Professional laundry service in Bangalore with next-day delivery. Book online now!",
        canonical: "https://mixedwash.in/"
      };
    }

    switch (serviceSlug) {
      case 'wash-fold':
        return seoPages.services.washFold;
      case 'dry-cleaning':
        return seoPages.services.dryClean;
      case 'premium-wash':
        return seoPages.services.premiumWash;
      case 'steam-iron':
        return seoPages.services.steamIron;
      default:
        return {
          title: `${service?.name || 'Service'} - MixedWash Bangalore`,
          description: `Professional ${service?.name?.toLowerCase() || 'laundry'} service in Bangalore with next-day delivery. Book online now!`,
          canonical: `https://mixedwash.in/service/${serviceSlug}`
        };
    }
  }, [serviceSlug, service?.name]);

  // Apply SEO - this hook is called at the top level
  useSEO(seoData);
  
  // Memoize user info to prevent recalculation
  const getUserInfo = useCallback(() => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined, [user, profile]);

  const handleSchedulePickupClick = useCallback(async () => {
    // Navigate immediately for better UX
    navigate("/schedule", { state: { fromCTA: true } });

    // Track asynchronously to avoid blocking
    try {
      const { trackEvent } = await import("@/utils/clevertap");
      const userInfo = getUserInfo();
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      trackEvent('service_detail_screen_schedule_pickup_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': currentTime,
        'service_type': service?.name || serviceSlug
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [navigate, getUserInfo, service?.name, serviceSlug]);

  const handleGetEstimateClick = useCallback(async () => {
    // Track asynchronously to avoid blocking
    try {
      const { trackEvent } = await import("@/utils/clevertap");
      const userInfo = getUserInfo();
      const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      trackEvent('service_detail_screen_get_estimate_clicked', {
        'customer name': userInfo?.name || 'Anonymous',
        'customer id': userInfo?.user_id || 'Anonymous',
        'current_time': currentTime,
        'service_type': service?.name || serviceSlug
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }, [getUserInfo, service?.name, serviceSlug]);
  
  useEffect(() => {
    console.log('ServiceDetail useEffect triggered with serviceSlug:', serviceSlug);
    console.log('Available services:', Object.keys(servicesData));
    
    // Find the service data based on the serviceSlug
    if (serviceSlug && serviceSlug in servicesData) {
      const foundService = servicesData[serviceSlug as keyof typeof servicesData];
      console.log('Found service:', foundService);
      setService(foundService);
      
      // Track service detail screen viewed asynchronously
      const trackServiceView = async () => {
        try {
          const { trackEvent } = await import("@/utils/clevertap");
          const userInfo = getUserInfo();
          const currentTime = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          trackEvent('service_detail_screen_viewed', {
            'customer name': userInfo?.name || 'Anonymous',
            'customer id': userInfo?.user_id || 'Anonymous',
            'current_time': currentTime,
            'service_type': foundService.name
          });
        } catch (error) {
          console.warn('Analytics tracking failed:', error);
        }
      };
      
      trackServiceView();
    } else {
      console.log('Service not found, redirecting to home');
      // Redirect to services if the service is not found
      navigate("/");
    }
  }, [serviceSlug, navigate, getUserInfo]);
  
  if (!service) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Memoize other services calculation to prevent recalculation
  const otherServices = useMemo(() => {
    return Object.entries(servicesData)
      .filter(([id]) => id !== serviceSlug)
      .map(([id, serviceData]: [string, any]) => ({
        id,
        name: serviceData.name,
        icon: serviceData.icon,
        iconBg: serviceData.iconBg,
        color: serviceData.color
      }));
  }, [serviceSlug]);

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
          <PricingSection 
            service={service} 
            serviceId={serviceSlug} 
            onSchedulePickup={handleSchedulePickupClick}
            onGetEstimate={handleGetEstimateClick}
          />
          
          {/* About Service Component */}
          <AboutService service={service} />
        </div>
      </main>
      
      {/* Sticky Schedule Pickup CTA */}
      <SchedulePickupFooter onSchedulePickup={handleSchedulePickupClick} />
    </div>
  );
};

export default ServiceDetail;
