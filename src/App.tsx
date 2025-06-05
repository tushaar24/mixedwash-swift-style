
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import Contact from "./pages/Contact";
import ServiceDetail from "./pages/ServiceDetail";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PageTracker } from "./components/PageTracker";
import { initCleverTap } from "./utils/clevertap";
import React, { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initCleverTap();
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={
                  <PageTracker pageName="Auth Page">
                    <Auth />
                  </PageTracker>
                } />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute requireCompleteProfile={false}>
                      <PageTracker pageName="Profile Page">
                        <Profile />
                      </PageTracker>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/schedule" 
                  element={
                    <ProtectedRoute>
                      <PageTracker pageName="Schedule Page">
                        <Schedule />
                      </PageTracker>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contact" 
                  element={
                    <ProtectedRoute>
                      <PageTracker pageName="Contact Page">
                        <Contact />
                      </PageTracker>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/service/:serviceId" 
                  element={
                    <ProtectedRoute>
                      <PageTracker pageName="Service Detail Page">
                        <ServiceDetail />
                      </PageTracker>
                    </ProtectedRoute>
                  } 
                />
                <Route path="/privacy-policy" element={
                  <PageTracker pageName="Privacy Policy Page">
                    <PrivacyPolicy />
                  </PageTracker>
                } />
                <Route path="/terms-conditions" element={
                  <PageTracker pageName="Terms & Conditions Page">
                    <TermsConditions />
                  </PageTracker>
                } />
                <Route path="*" element={
                  <PageTracker pageName="404 Page">
                    <NotFound />
                  </PageTracker>
                } />
              </Routes>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
