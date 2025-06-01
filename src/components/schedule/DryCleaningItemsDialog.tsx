
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface DryCleaningItem {
  name: string;
  price: number;
  quantity: number;
}

interface DryCleaningItemsDialogProps {
  selectedItems: DryCleaningItem[];
  onItemsChange: (items: DryCleaningItem[]) => void;
}

// Men's wear items from service detail screen
const MENS_WEAR_ITEMS = [
  { name: "Sweater", price: 250 },
  { name: "Hoodie - Half", price: 200 },
  { name: "Hoodie - Full", price: 250 },
  { name: "Jacket - Puffed", price: 250 },
  { name: "Jacket - Denim", price: 250 },
  { name: "Thin Jacket - Athletic", price: 200 },
  { name: "Track Pant", price: 150 },
  { name: "Shorts", price: 120 },
  { name: "Sherwani (Top)", price: 400 },
  { name: "Lungi", price: 200 },
  { name: "Dhoti", price: 200 },
  { name: "Kurta", price: 180 },
  { name: "Waist Coat", price: 130 },
  { name: "Blazer", price: 300 },
  { name: "Denim Pant", price: 180 },
  { name: "Trouser", price: 180 },
  { name: "Pyjama", price: 150 },
  { name: "Sweatshirt", price: 220 },
  { name: "T-shirt", price: 150 },
  { name: "Shirt", price: 150 }
];

// Women's wear items from service detail screen
const WOMENS_WEAR_ITEMS = [
  { name: "Jacket - Denim", price: 300 },
  { name: "Petticoat", price: 150 },
  { name: "Lehenga", price: 400 },
  { name: "Skirt - Long", price: 200 },
  { name: "Skirt - Short", price: 150 },
  { name: "Hoodie", price: 250 },
  { name: "Pullover Jacket", price: 200 },
  { name: "Sweatshirt", price: 250 },
  { name: "Coat (Knee Length)", price: 400 },
  { name: "Long Coat", price: 350 },
  { name: "Dupatta", price: 120 },
  { name: "Blouse", price: 120 },
  { name: "Denim Trouser", price: 180 },
  { name: "Pyjama", price: 150 },
  { name: "Saree (Embroidered)", price: 350 },
  { name: "Saree (Plain)", price: 300 },
  { name: "Blazer", price: 300 },
  { name: "Leggings", price: 150 },
  { name: "Kurti", price: 200 },
  { name: "Shirt", price: 150 }
];

export const DryCleaningItemsDialog = ({ selectedItems, onItemsChange }: DryCleaningItemsDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateItemQuantity = (itemName: string, newQuantity: number) => {
    const updatedItems = [...selectedItems];
    const existingItemIndex = updatedItems.findIndex(item => item.name === itemName);
    
    if (newQuantity === 0) {
      // Remove item if quantity is 0
      if (existingItemIndex !== -1) {
        updatedItems.splice(existingItemIndex, 1);
      }
    } else {
      // Find item data from both sections
      const itemData = [...MENS_WEAR_ITEMS, ...WOMENS_WEAR_ITEMS].find(item => item.name === itemName);
      if (!itemData) return;
      
      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex].quantity = newQuantity;
      } else {
        updatedItems.push({
          name: itemName,
          price: itemData.price,
          quantity: newQuantity
        });
      }
    }
    
    onItemsChange(updatedItems);
  };

  const getItemQuantity = (itemName: string) => {
    const item = selectedItems.find(item => item.name === itemName);
    return item ? item.quantity : 0;
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const renderItemSection = (items: typeof MENS_WEAR_ITEMS) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((item) => {
        const quantity = getItemQuantity(item.name);
        
        return (
          <Card key={item.name} className="border-gray-200">
            <CardContent className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <p className="text-sm text-gray-600">₹{item.price}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateItemQuantity(item.name, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <span className="w-6 text-center font-medium text-sm">{quantity}</span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateItemQuantity(item.name, quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-3 bg-black text-white hover:bg-gray-800 hover:text-white">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add Items {totalItems > 0 && `(${totalItems})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Dry Cleaning Items</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="mens" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mens">Men's Wear</TabsTrigger>
              <TabsTrigger value="womens">Women's Wear</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mens" className="mt-6">
              {renderItemSection(MENS_WEAR_ITEMS)}
            </TabsContent>
            
            <TabsContent value="womens" className="mt-6">
              {renderItemSection(WOMENS_WEAR_ITEMS)}
            </TabsContent>
          </Tabs>
          
          {selectedItems.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Selected Items ({totalItems})</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Sticky Done button at bottom */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-center mt-4">
          <Button 
            onClick={() => setIsOpen(false)} 
            className="bg-black hover:bg-gray-800 text-white px-8 py-3 min-w-48"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
