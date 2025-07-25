
import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { seoPages } from "@/utils/seo";

// Lazy load navbar to reduce initial bundle size
const Navbar = lazy(() => import("@/components/Navbar").then(module => ({ default: module.Navbar })));

const Contact = () => {
  const navigate = useNavigate();
  
  // SEO optimization for contact page
  useSEO(seoPages.contact);
  
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/916362290686", "_blank");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Suspense fallback={<div className="h-16 border-b border-gray-100" />}>
        <Navbar />
      </Suspense>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help! Reach out to us using any of the methods below.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {/* WhatsApp */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-6">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
              <p className="text-gray-600 mb-4">Chat with us on WhatsApp</p>
              <Button 
                onClick={handleWhatsAppClick}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </div>
            
            {/* Phone */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-6">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">We're available during business hours</p>
              <a 
                href="tel:+916362290686" 
                className="text-lg font-medium text-black hover:underline"
              >
                +91-636-229-0686
              </a>
            </div>
            
            {/* Email */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center">
              <div className="bg-black p-4 rounded-full mb-6">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us an email anytime</p>
              <a 
                href="mailto:contact@mixedwash.in" 
                className="text-lg font-medium text-black hover:underline"
              >
                contact@mixedwash.in
              </a>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
