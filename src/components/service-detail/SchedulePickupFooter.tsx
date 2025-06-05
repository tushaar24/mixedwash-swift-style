
import { Button } from "@/components/ui/button";

interface SchedulePickupFooterProps {
  onSchedulePickup: () => void;
}

export const SchedulePickupFooter = ({ onSchedulePickup }: SchedulePickupFooterProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 sm:py-6 shadow-lg z-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
        <Button 
          className="bg-black hover:bg-gray-800 px-8 sm:px-12 py-5 sm:py-7 text-base sm:text-lg font-semibold w-full max-w-md"
          size="lg"
          onClick={onSchedulePickup}
        >
          Schedule Pickup
        </Button>
      </div>
    </div>
  );
};
