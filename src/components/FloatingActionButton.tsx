
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const FloatingActionButton = () => {
  const isMobile = useIsMobile();

  const handleCall = () => {
    window.location.href = "tel:+916362290686";
  };

  if (!isMobile) {
    return null;
  }

  return (
    <Button
      onClick={handleCall}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
      size="icon"
    >
      <Phone className="h-6 w-6 text-white" />
    </Button>
  );
};
