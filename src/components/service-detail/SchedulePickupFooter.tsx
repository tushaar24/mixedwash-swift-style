
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

interface SchedulePickupFooterProps {
  onSchedulePickup?: () => void;
}

export const SchedulePickupFooter = ({ onSchedulePickup }: SchedulePickupFooterProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInfo = () => user ? {
    user_id: user.id,
    name: user.user_metadata?.full_name || user.user_metadata?.name || profile?.username,
    phone: profile?.mobile_number
  } : undefined;

  const handleScheduleClick = () => {
    const userInfo = getUserInfo();

    // Track the CTA click event FIRST
    trackEvent('schedule_cta_clicked', {
      'customer name': userInfo?.name || 'Anonymous',
      'customer id': userInfo?.user_id || 'Anonymous',
      'current_time': getCurrentTime(),
      'source': 'service_detail_footer'
    });

    // Then navigate with a flag to indicate this came from CTA
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/schedule", { state: { fromCTA: true } });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 sm:py-6 shadow-lg z-10">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center">
        <Button 
          className="bg-black hover:bg-gray-800 px-8 sm:px-12 py-4 text-base sm:text-lg font-semibold w-full max-w-md"
          size="lg"
          onClick={onScheduleClick || handleScheduleClick}
        >
          Schedule Pickup
        </Button>
      </div>
    </div>
  );
};
