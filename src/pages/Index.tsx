
import { useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

// Lazy load below-fold components with error handling
const ProfessionalLaundryService = lazy(() => 
  import("@/components/ProfessionalLaundryService")
    .then(m => ({ default: m.ProfessionalLaundryService }))
    .catch(err => {
      console.error('Failed to load ProfessionalLaundryService:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const WhyChooseUs = lazy(() => 
  import("@/components/WhyChooseUs")
    .then(m => ({ default: m.WhyChooseUs }))
    .catch(err => {
      console.error('Failed to load WhyChooseUs:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const Services = lazy(() => 
  import("@/components/Services")
    .then(m => ({ default: m.Services }))
    .catch(err => {
      console.error('Failed to load Services:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const HowItWorks = lazy(() => 
  import("@/components/HowItWorks")
    .then(m => ({ default: m.HowItWorks }))
    .catch(err => {
      console.error('Failed to load HowItWorks:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const FAQ = lazy(() => 
  import("@/components/FAQ")
    .then(m => ({ default: m.FAQ }))
    .catch(err => {
      console.error('Failed to load FAQ:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const CallToAction = lazy(() => 
  import("@/components/CallToAction")
    .then(m => ({ default: m.CallToAction }))
    .catch(err => {
      console.error('Failed to load CallToAction:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const Footer = lazy(() => 
  import("@/components/Footer")
    .then(m => ({ default: m.Footer }))
    .catch(err => {
      console.error('Failed to load Footer:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const FloatingActionButton = lazy(() => 
  import("@/components/FloatingActionButton")
    .then(m => ({ default: m.FloatingActionButton }))
    .catch(err => {
      console.error('Failed to load FloatingActionButton:', err);
      return { default: () => <div>Error loading component</div> };
    })
);

const LoadingSection = () => <div className="min-h-[400px] bg-gray-50 animate-pulse flex items-center justify-center">
  <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
</div>;

const Index = () => {
  const { user, profile, isLoading, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  console.log("Index component rendering:", { user: !!user, isLoading, isProfileComplete });

  // SEO optimization for homepage
  useSEO(seoPages.home);

  // Redirect to profile page if user is logged in but profile is incomplete
  useEffect(() => {
    console.log("Index useEffect triggered:", { isLoading, user: !!user, isProfileComplete });
    if (!isLoading && user && !isProfileComplete) {
      console.log("Redirecting to profile page");
      navigate("/profile");
    }
  }, [user, isProfileComplete, isLoading, navigate]);

  if (isLoading) {
    console.log("Index showing loading state");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  console.log("Index rendering main content");

  return (
    <div className="min-h-screen bg-white" style={{ border: "2px solid red" }}>
      <div style={{ backgroundColor: "yellow", padding: "10px" }}>DEBUG: Index wrapper</div>
      <Navbar />
      <main style={{ backgroundColor: "lightblue", minHeight: "200px" }}>
        <div style={{ backgroundColor: "pink", padding: "10px" }}>DEBUG: Main content</div>
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
