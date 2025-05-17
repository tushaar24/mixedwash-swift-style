
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === "/";

  const handleScheduleClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      // User is already logged in, navigate to scheduling page
      navigate("/schedule");
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error signing out:", error);
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      
      // Force navigation to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              className="text-xl font-bold cursor-pointer"
              onClick={() => navigate("/")}
            >
              MixedWash
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Only show these navigation links on the home page */}
            {isHomePage && (
              <>
                <a href="#services" className="text-black hover:text-gray-600 transition-colors">Services</a>
                <a href="#why-choose-us" className="text-black hover:text-gray-600 transition-colors">Why Us</a>
                <a href="#how-it-works" className="text-black hover:text-gray-600 transition-colors">How It Works</a>
                <a href="#faq" className="text-black hover:text-gray-600 transition-colors">FAQ</a>
              </>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleScheduleClick}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Schedule Pickup
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button className="bg-black text-white hover:bg-gray-800" onClick={handleScheduleClick}>
                Schedule Pickup
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-black focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg absolute w-full z-10">
            {/* Only show these navigation links on the home page */}
            {isHomePage && (
              <>
                <a href="#services" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>Services</a>
                <a href="#why-choose-us" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>Why Us</a>
                <a href="#how-it-works" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>How It Works</a>
                <a href="#faq" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>FAQ</a>
              </>
            )}
            
            {user ? (
              <>
                <div className="px-3 py-2">
                  <Button 
                    className="w-full bg-black text-white hover:bg-gray-800"
                    onClick={() => {
                      handleScheduleClick();
                      setIsOpen(false);
                    }}
                  >
                    Schedule Pickup
                  </Button>
                </div>
                <div className="px-3 py-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => {
                      navigate("/profile");
                      setIsOpen(false);
                    }}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                </div>
                <div className="px-3 py-2">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="px-3 py-2">
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={() => {
                    handleScheduleClick();
                    setIsOpen(false);
                  }}
                >
                  Schedule Pickup
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
