
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
import { initCleverTap } from "./utils/clevertap";
import React, { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize CleverTap when the app starts
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
                <Route path="/auth" element={<Auth />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute requireCompleteProfile={false}>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/schedule" 
                  element={
                    <ProtectedRoute>
                      <Schedule />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/contact" 
                  element={
                    <ProtectedRoute>
                      <Contact />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/service/:serviceId" 
                  element={
                    <ProtectedRoute>
                      <ServiceDetail />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
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
