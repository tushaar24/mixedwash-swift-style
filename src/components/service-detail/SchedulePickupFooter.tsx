
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const SchedulePickupFooter = () => {
  const navigate = useNavigate();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 sm:py-6 shadow-lg z-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
        <Button 
          className="bg-black hover:bg-gray-800 text-white px-8 sm:px-12 py-5 sm:py-7 text-base sm:text-lg font-semibold w-full max-w-md"
          size="lg"
          onClick={() => navigate("/schedule")}
        >
          Schedule Pickup
        </Button>
      </div>
    </div>
  );
};
