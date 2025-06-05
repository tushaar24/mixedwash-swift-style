import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ConvenienceSection } from "@/components/ConvenienceSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { trackPageView, trackEvent } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";
import { useScrollTracking } from "@/hooks/useScrollTracking";

const Index = () => {
  const { user, profile, isLoading, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  
  // Add scroll tracking for the home page
  useScrollTracking('Home Page');
  
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
    const userInfo = getUserInfo();
    
    // Track home page viewed with new format
    trackEvent('home_page_viewed', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime()
    });
    
    // Keep existing page view tracking
    trackPageView('Home Page', {}, userInfo);
  }, [user, profile]);

  // Redirect to profile page if user is logged in but profile is incomplete
  useEffect(() => {
    if (!isLoading && user && !isProfileComplete) {
      navigate("/profile");
    }
  }, [user, isProfileComplete, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <WhyChooseUs />
        <ConvenienceSection />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
