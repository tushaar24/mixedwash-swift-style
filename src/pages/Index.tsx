
import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

// Lazy load below-fold components
const ProfessionalLaundryService = lazy(() => import("@/components/ProfessionalLaundryService").then(m => ({ default: m.ProfessionalLaundryService })));
const WhyChooseUs = lazy(() => import("@/components/WhyChooseUs").then(m => ({ default: m.WhyChooseUs })));
const Services = lazy(() => import("@/components/Services").then(m => ({ default: m.Services })));
const HowItWorks = lazy(() => import("@/components/HowItWorks").then(m => ({ default: m.HowItWorks })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const CallToAction = lazy(() => import("@/components/CallToAction").then(m => ({ default: m.CallToAction })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const FloatingActionButton = lazy(() => import("@/components/FloatingActionButton").then(m => ({ default: m.FloatingActionButton })));

const LoadingSection = () => <div className="min-h-[400px] bg-gray-50 animate-pulse flex items-center justify-center">
  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
</div>;

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
        <Suspense fallback={<LoadingSection />}>
          <ProfessionalLaundryService />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <WhyChooseUs />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <Services />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<LoadingSection />}>
          <CallToAction />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingActionButton />
      </Suspense>
    </div>
  );
};

export default Index;
