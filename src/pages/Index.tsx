
import { useEffect, lazy, Suspense, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { useAuth } from "@/context/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

// Lazy load ALL below-fold components with prefetch for critical ones
const ProfessionalLaundryService = lazy(() => 
  import("@/components/ProfessionalLaundryService").then(m => ({ default: m.ProfessionalLaundryService }))
);
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
  const { user, isProfileChecked, isProfileComplete } = useAuth();
  const navigate = useNavigate();
  
  // Intersection observer for lazy loading below-fold content
  const { ref: professionalRef, inView: professionalInView } = useInView({
    threshold: 0,
    rootMargin: '200px 0px', // Load 200px before visible
    triggerOnce: true
  });

  // SEO optimization for homepage
  useSEO(seoPages.home);

  // Redirect to profile page if user is logged in but profile is incomplete
  useEffect(() => {
    if (isProfileChecked && user && !isProfileComplete) {
      navigate("/profile");
    }
  }, [user, isProfileComplete, isProfileChecked, navigate]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        
        {/* Professional Laundry Service - Lazy loaded with intersection observer */}
        <div ref={professionalRef}>
          {professionalInView ? (
            <Suspense fallback={<LoadingSection />}>
              <ProfessionalLaundryService />
            </Suspense>
          ) : (
            <div className="min-h-[600px]" /> // Placeholder to maintain scroll position
          )}
        </div>
        
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
