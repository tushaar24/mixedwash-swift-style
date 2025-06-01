
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const DRY_CLEANING_ITEMS = [
  { name: "Shirt", price: 120 },
  { name: "T-Shirt", price: 100 },
  { name: "Trouser", price: 150 },
  { name: "Jeans", price: 180 },
  { name: "Blazer", price: 300 },
  { name: "Suit", price: 500 },
  { name: "Dress", price: 250 },
  { name: "Skirt", price: 180 },
  { name: "Jacket", price: 350 },
  { name: "Coat", price: 400 },
  { name: "Sweater", price: 200 },
  { name: "Tie", price: 80 },
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
      // Update or add item
      const itemData = DRY_CLEANING_ITEMS.find(item => item.name === itemName);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-3 bg-black text-white hover:bg-gray-800">
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add Items {totalItems > 0 && `(${totalItems})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Dry Cleaning Items</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DRY_CLEANING_ITEMS.map((item) => {
            const quantity = getItemQuantity(item.name);
            
            return (
              <Card key={item.name} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItemQuantity(item.name, Math.max(0, quantity - 1))}
                        disabled={quantity === 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateItemQuantity(item.name, quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {selectedItems.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Selected Items ({totalItems})</h3>
            <div className="space-y-2">
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
        
        <div className="flex justify-end mt-4">
          <Button onClick={() => setIsOpen(false)} className="bg-black hover:bg-gray-800 text-white">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
