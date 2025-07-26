
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTracker } from "./components/PageTracker";
import { initCleverTap } from "./utils/clevertap";
import Index from "./pages/Index";
import { Loader2 } from "lucide-react";

// Lazy load non-critical pages to reduce bundle size
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Schedule = lazy(() => import("./pages/Schedule"));
const OrderSuccess = lazy(() => import("./pages/OrderSuccess"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for lazy routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    initCleverTap();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route 
                path="/" 
                element={
                  <PageTracker pageName="Homepage">
                    <Index />
                  </PageTracker>
                } 
              />
              <Route 
                path="/auth" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="Authentication">
                      <Auth />
                    </PageTracker>
                  </Suspense>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute requireCompleteProfile={false}>
                    <Suspense fallback={<PageLoader />}>
                      <PageTracker pageName="Profile">
                        <Profile />
                      </PageTracker>
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              {/* Schedule page allows unauthenticated access for service selection */}
              <Route 
                path="/schedule" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <Schedule />
                  </Suspense>
                } 
              />
              <Route 
                path="/order-success" 
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<PageLoader />}>
                      <PageTracker pageName="Order Success">
                        <OrderSuccess />
                      </PageTracker>
                    </Suspense>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/service/:serviceSlug" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="Service Detail">
                      <ServiceDetail />
                    </PageTracker>
                  </Suspense>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="Contact">
                      <Contact />
                    </PageTracker>
                  </Suspense>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="Privacy Policy">
                      <PrivacyPolicy />
                    </PageTracker>
                  </Suspense>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="Terms & Conditions">
                      <TermsConditions />
                    </PageTracker>
                  </Suspense>
                } 
              />
              <Route 
                path="*" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <PageTracker pageName="404 Not Found">
                      <NotFound />
                    </PageTracker>
                  </Suspense>
                } 
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
