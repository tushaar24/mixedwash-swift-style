
import { useEffect } from "react";
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
import { trackPageView } from "@/utils/clevertap";
import { useAuth } from "@/context/AuthContext";
import { useScrollTracking } from "@/hooks/useScrollTracking";

const Index = () => {
  const { user, profile } = useAuth();
  
  // Add scroll tracking for the home page
  useScrollTracking('Home Page');
  
  useEffect(() => {
    const userInfo = user ? {
      user_id: user.id,
      name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
      phone: profile?.mobile_number
    } : undefined;
    
    trackPageView('Home Page', {}, userInfo);
  }, [user, profile]);

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
