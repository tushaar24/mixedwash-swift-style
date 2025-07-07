
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { HeroV2 } from "@/components/v2/HeroV2";
import { ServicesV2 } from "@/components/v2/ServicesV2";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { ConvenienceSection } from "@/components/ConvenienceSection";
import { HowItWorks } from "@/components/HowItWorks";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { CallToActionV2 } from "@/components/v2/CallToActionV2";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

const Index = () => {
  const { user, profile, isLoading, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  // SEO optimization for homepage
  useSEO(seoPages.home);

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
        <HeroV2 />
        <ServicesV2 />
        <WhyChooseUs />
        <ConvenienceSection />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <CallToActionV2 />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
