
import { useEffect } from "react";
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
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Schedule from "./pages/Schedule";
import OrderSuccess from "./pages/OrderSuccess";
import ServiceDetail from "./pages/ServiceDetail";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import NotFound from "./pages/NotFound";

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
                  <PageTracker pageName="Authentication">
                    <Auth />
                  </PageTracker>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <PageTracker pageName="Profile">
                      <Profile />
                    </PageTracker>
                  </ProtectedRoute>
                } 
              />
              {/* Schedule page allows unauthenticated access for service selection */}
              <Route 
                path="/schedule" 
                element={
                  <Schedule />
                } 
              />
              <Route 
                path="/order-success" 
                element={
                  <PageTracker pageName="Order Success">
                    <OrderSuccess />
                  </PageTracker>
                } 
              />
              <Route 
                path="/service/:serviceSlug" 
                element={
                  <PageTracker pageName="Service Detail">
                    <ServiceDetail />
                  </PageTracker>
                } 
              />
              <Route 
                path="/contact" 
                element={
                  <PageTracker pageName="Contact">
                    <Contact />
                  </PageTracker>
                } 
              />
              <Route 
                path="/privacy" 
                element={
                  <PageTracker pageName="Privacy Policy">
                    <PrivacyPolicy />
                  </PageTracker>
                } 
              />
              <Route 
                path="/terms" 
                element={
                  <PageTracker pageName="Terms & Conditions">
                    <TermsConditions />
                  </PageTracker>
                } 
              />
              <Route 
                path="*" 
                element={
                  <PageTracker pageName="404 Not Found">
                    <NotFound />
                  </PageTracker>
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
