
import { Package, Shirt, WashingMachine, Weight } from "lucide-react";

// Service data moved to its own file for better organization
export const servicesData = {
  "wash-fold": {
    name: "Wash & Fold",
    icon: <WashingMachine className="h-8 w-8 text-white" />,
    iconBg: "bg-blue-600",
    color: "bg-blue-50",
    themeColor: "#2563EB", // Added theme color
    description: "For everyday laundry, bedsheets and towels.",
    discount: 0,
    minimumOrder: null,
    deliveryTime: "24h",
    prices: [
      {
        title: "Regular Wash",
        amount: "₹79/kg",
        oldPrice: "₹99/kg", // Old price for existing customers
        details: "Light and dark clothes washed together at 90°F. You can request 110°F instead.",
        minimumOrder: 4
      }
    ]
  },
  "wash-iron": {
    name: "Wash & Iron",
    icon: <Shirt className="h-8 w-8 text-white" />,
    iconBg: "bg-pink-500",
    color: "bg-pink-50",
    themeColor: "#EC4899", // Added theme color
    description: "Your outfits, wrinkle-free and crisp.",
    discount: 0,
    minimumOrder: null,
    deliveryTime: "24h",
    prices: [
      {
        title: "Regular Wash",
        amount: "₹119/kg",
        oldPrice: "₹149/kg", // Old price for existing customers
        details: "Light and dark clothes washed together at 90°F and professionally ironed.",
        minimumOrder: 3
      }
    ]
  },
  "heavy-wash": {
    name: "Heavy Wash",
    icon: <Package className="h-8 w-8 text-white" />,
    iconBg: "bg-teal-500",
    color: "bg-teal-50",
    themeColor: "#14B8A6", // Added theme color
    description: "Big laundry loads handled with ease.",
    discount: 0,
    minimumOrder: null,
    deliveryTime: "24-48h",
    prices: [
      {
        title: "Price per kg",
        amount: "₹109/kg",
        oldPrice: "₹129/kg", // Old price for existing customers
        details: "Perfect for blankets, comforters, heavy jackets, and other bulky items."
      }
    ]
  },
  "dry-cleaning": {
    name: "Dry Cleaning",
    icon: <Weight className="h-8 w-8 text-white" />,
    iconBg: "bg-green-500",
    color: "bg-green-50",
    themeColor: "#22C55E", // Added theme color
    description: "Delicate care, speedy turnaround.",
    discount: 0,
    minimumOrder: null,
    deliveryTime: "24-48h",
    serviceCharge: "₹50 service fee on orders under ₹250",
    // Updated with detailed price items for dry cleaning
    prices: [
      {
        title: "Men's Wear",
        amount: "",
        oldPrice: "",
        details: "",
        items: [
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
        ]
      },
      {
        title: "Women's Wear",
        amount: "",
        oldPrice: "",
        details: "",
        items: [
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
        ]
      }
    ]
  }
};
