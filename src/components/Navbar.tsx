
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScheduleClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      // User is already logged in, navigate to scheduling page
      navigate("/profile");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">MixedWash</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-black hover:text-gray-600 transition-colors">Services</a>
            <a href="#why-choose-us" className="text-black hover:text-gray-600 transition-colors">Why Us</a>
            <a href="#how-it-works" className="text-black hover:text-gray-600 transition-colors">How It Works</a>
            <a href="#faq" className="text-black hover:text-gray-600 transition-colors">FAQ</a>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/profile")}
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Button>
                <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
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
            <a href="#services" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>Services</a>
            <a href="#why-choose-us" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>Why Us</a>
            <a href="#how-it-works" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>How It Works</a>
            <a href="#faq" className="block px-3 py-2 text-black hover:bg-gray-50 rounded-md" onClick={() => setIsOpen(false)}>FAQ</a>
            
            {user ? (
              <>
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
                    className="w-full"
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                  >
                    Sign Out
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
