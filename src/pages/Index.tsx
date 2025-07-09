
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ProfessionalLaundryService } from "@/components/ProfessionalLaundryService";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Services } from "@/components/Services";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { CallToAction } from "@/components/CallToAction";
import { Footer } from "@/components/Footer";
import { FloatingActionButton } from "@/components/FloatingActionButton";
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
        <Hero />
        <ProfessionalLaundryService />
        <WhyChooseUs />
        <Services />
        <HowItWorks />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  );
};

export default Index;
