
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Info, Truck } from "lucide-react";
import { ServiceWeightEstimateDialog } from "@/components/ServiceWeightEstimateDialog";
import { useState, useMemo } from "react";
import { useDiscountEligibility } from "@/hooks/useDiscountEligibility";

interface PricingSectionProps {
  service: any;
  serviceId: string | undefined;
  onSchedulePickup: () => void;
  onGetEstimate: () => void;
}

export const PricingSection = ({ service, serviceId, onSchedulePickup, onGetEstimate }: PricingSectionProps) => {
  const [activeTab, setActiveTab] = useState("men");
  const [showServiceChargeAlert, setShowServiceChargeAlert] = useState(true);
  
  // Load discount eligibility asynchronously to prevent blocking
  const { isEligibleForDiscount, loading } = useDiscountEligibility();

  // Early return if service data is not available
  if (!service || !service.prices) {
    return <div className="max-w-5xl mx-auto px-4 mt-6 sm:mt-8">Loading pricing information...</div>;
  }

  // Memoize price calculations to prevent recalculation
  const memoizedPrices = useMemo(() => {
    return service.prices.map((price: any) => ({
      ...price,
      displayPrice: isEligibleForDiscount ? price.oldPrice : price.amount
    }));
  }, [service.prices, isEligibleForDiscount]);
  
  return (
    <div className="max-w-5xl mx-auto px-4 mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Pricing</h2>
      
      {/* Add service charge note for dry cleaning */}
      {service.serviceCharge && showServiceChargeAlert && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p className="flex-1">{service.serviceCharge}</p>
        </div>
      )}
      
      <div className="space-y-6 sm:space-y-8">
        {serviceId === 'dry-cleaning' ? (
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <Tabs defaultValue="men" className="w-full" onValueChange={(value) => setActiveTab(value)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="men">Men's Wear</TabsTrigger>
                <TabsTrigger value="women">Women's Wear</TabsTrigger>
              </TabsList>
              <TabsContent value="men" className="p-4 sm:p-6 pt-4">
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-black hover:bg-black">
                        <TableHead className="text-left text-white font-bold hover:text-white">Item's Name</TableHead>
                        <TableHead className="text-right text-white font-bold hover:text-white">Price (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(service.prices[0]?.items || []).map((item: any, itemIndex: number) => (
                        <TableRow key={itemIndex} className="border-t border-gray-200 hover:bg-gray-50">
                          <TableCell className="text-left py-2 hover:text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-right py-2 font-medium hover:text-gray-900">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-xs flex items-center gap-1 text-blue-700">
                  <Truck className="h-3 w-3 flex-shrink-0" />
                  <span>Free pickup & delivery included</span>
                </div>
              </TabsContent>
              <TabsContent value="women" className="p-4 sm:p-6 pt-4">
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="bg-black hover:bg-black">
                        <TableHead className="text-left text-white font-bold hover:text-white">Item's Name</TableHead>
                        <TableHead className="text-right text-white font-bold hover:text-white">Price (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(service.prices[1]?.items || []).map((item: any, itemIndex: number) => (
                        <TableRow key={itemIndex} className="border-t border-gray-200 hover:bg-gray-50">
                          <TableCell className="text-left py-2 hover:text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-right py-2 font-medium hover:text-gray-900">{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 text-xs flex items-center gap-1 text-blue-700">
                  <Truck className="h-3 w-3 flex-shrink-0" />
                  <span>Free pickup & delivery included</span>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          memoizedPrices.map((price: any, index: number) => (
            <Card key={index} className="border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <h3 className="text-lg sm:text-xl font-medium">{price.title}</h3>
                    <p className="text-gray-500 text-sm sm:text-base">{price.details}</p>
                    <div className="mt-2 sm:mt-3 text-xs flex items-center gap-1 text-blue-700">
                      <Truck className="h-3 w-3 flex-shrink-0" />
                      <span>Free pickup & delivery included</span>
                    </div>
                    {price.minimumOrder && (
                      <div className="text-xs flex items-center gap-1 text-orange-700">
                        <Info className="h-3 w-3 flex-shrink-0" />
                        <span>Minimum order: {price.minimumOrder}kg</span>
                      </div>
                    )}
                  </div>
                   <div className="sm:text-right">
                     <div className="font-semibold text-xl sm:text-2xl text-gray-800">
                       {price.displayPrice}
                     </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        
        <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg">
          <h3 className="font-medium text-base sm:text-lg">Not sure how much you have?</h3>
          <ServiceWeightEstimateDialog 
            serviceName={service.name} 
            serviceColor={service.themeColor}
            buttonClassName="mt-2 sm:mt-3 text-sm sm:text-base"
          >
            <Button 
              className="mt-2 sm:mt-3 text-sm sm:text-base bg-black hover:bg-gray-800"
              onClick={onGetEstimate}
            >
              Get an estimate
            </Button>
          </ServiceWeightEstimateDialog>
        </div>
      </div>
    </div>
  );
};
