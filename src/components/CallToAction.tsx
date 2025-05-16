
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const CallToAction = () => {
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

  return (
    <section className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Laundry Joy?</h2>
          <p className="text-lg mb-8">
            MixedWash makes laundry effortless, trustworthy, and fun.
          </p>
          <Button 
            className="bg-white text-black hover:bg-gray-100 hover:text-black px-8 py-6 text-lg group"
            onClick={handleScheduleClick}
          >
            Schedule Your First Pickup
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
