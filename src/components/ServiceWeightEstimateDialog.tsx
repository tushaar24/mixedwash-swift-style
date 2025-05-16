
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ServiceWeightEstimateDialogProps {
  serviceName: string;
  serviceColor: string;
  buttonClassName?: string;
  children: React.ReactNode;
}

export const ServiceWeightEstimateDialog = ({
  serviceName,
  serviceColor,
  buttonClassName,
  children,
}: ServiceWeightEstimateDialogProps) => {
  const navigate = useNavigate();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Weight Estimate Guide</DialogTitle>
          <DialogDescription>
            A typical load (4 kgs) of laundry usually consists of:
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ul className="space-y-3">
            {[
              "3 trousers",
              "5 t-shirts",
              "1 bedsheet",
              "8 innerwears",
              "5 pair of socks"
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="bg-blue-600 rounded-full p-1 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-base">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>This information helps you estimate how many kilograms your laundry might weigh.</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate("/schedule")}
          >
            Schedule Pickup
          </Button>
          <Button 
            onClick={() => navigate("/schedule")}
            style={{
              backgroundColor: serviceColor ? serviceColor : undefined,
            }}
            className={buttonClassName}
          >
            Get Exact Estimate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
