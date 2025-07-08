
import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export const FloatingActionButton = () => {
  const isMobile = useIsMobile();

  const handleCall = () => {
    window.location.href = "tel:+916362290686";
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/916362290686", "_blank");
  };

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* WhatsApp Button */}
      <Button
        onClick={handleWhatsApp}
        className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
      
      {/* Phone Button */}
      <Button
        onClick={handleCall}
        className="h-14 w-14 rounded-full bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
        size="icon"
      >
        <Phone className="h-6 w-6 text-white" />
      </Button>
    </div>
  );
};
