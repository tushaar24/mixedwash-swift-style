
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, Home, Truck, ShoppingBag, ArrowRight, Loader2, Package } from "lucide-react";
import { format } from "date-fns";
import { useSEO } from "@/hooks/useSEO";

interface OrderDetails {
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  address: string;
  dryCleaningItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  specialInstructions?: string;
}

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useSEO({
    title: "Order Confirmed - WashWise",
    description: "Your laundry pickup has been successfully scheduled",
    canonical: "/order-success"
  });

  useEffect(() => {
    // Handle browser back button - redirect to home page
    const handlePopState = () => {
      navigate("/", { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    // Simulate loading delay for better UX
    const loadOrderDetails = async () => {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get order details from location state or localStorage
      const details = location.state?.orderDetails || 
                     JSON.parse(localStorage.getItem('lastOrderDetails') || 'null');
      
      if (details) {
        setOrderDetails(details);
        // Clear from localStorage after retrieving
        localStorage.removeItem('lastOrderDetails');
      } else {
        // If no order details, redirect to home
        navigate("/", { replace: true });
      }
      
      setIsLoading(false);
    };

    loadOrderDetails();
  }, [location.state, navigate]);

  const handleTrackOrder = () => {
    navigate("/profile", { replace: true });
  };

  const handleBackToHome = () => {
    navigate("/", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">Just a sec—we're finalizing your order!</h2>
              <p className="text-gray-600">Please wait while we prepare your order confirmation...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Order details not found. Redirecting...</p>
          </div>
        </main>
      </div>
    );
  }

  const totalAmount = orderDetails.dryCleaningItems.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          </div>

          {/* Order Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Services */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900">Selected Services</h3>
                <div className="space-y-3">
                  {orderDetails.services.map((service) => (
                    <div key={service.id} className="flex items-start">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <span className="text-2xl">
                          {service.name.includes("Wash & Fold") ? "👕" : 
                           service.name.includes("Wash & Iron") ? "👔" : 
                           service.name.includes("Heavy Wash") ? "🧺" : "✨"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Price:</span> ₹{service.price}
                          {!service.name.toLowerCase().includes('dry cleaning') ? '/kg' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dry Cleaning Items */}
              {orderDetails.dryCleaningItems.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-3 text-gray-900">Dry Cleaning Items</h3>
                  <div className="space-y-2 mb-3">
                    {orderDetails.dryCleaningItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between items-center font-semibold">
                    <span className="text-gray-900">Items Total</span>
                    <span className="text-gray-900">₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Schedule Details */}
              <div className="border-t border-gray-200 pt-4 grid md:grid-cols-2 gap-4">
                {/* Pickup */}
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Pickup</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(orderDetails.pickupDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {orderDetails.pickupSlot}
                    </p>
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Delivery</h3>
                    <p className="text-sm text-gray-600">
                      {format(new Date(orderDetails.deliveryDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {orderDetails.deliverySlot}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Home className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Pickup & Delivery Address</h3>
                    <p className="text-sm text-gray-600">{orderDetails.address}</p>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {orderDetails.specialInstructions && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-2 text-gray-900">Special Instructions</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                    {orderDetails.specialInstructions}
                  </p>
                </div>
              )}

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Payment Method</span>
                  <span className="text-gray-600">Cash on Delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Be Ready For Pickup</h4>
                    <p className="text-sm text-gray-600">
                      Our driver will call you 30 min before pickup. Keep your clothes ready for pickup. 
                      No need for any bags our driver will carry a bag to collect your clothes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Professional Care</h4>
                    <p className="text-sm text-gray-600">
                      Your clothes will be professionally cleaned with care and attention to detail.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-4 mt-1">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Delivery</h4>
                    <p className="text-sm text-gray-600">
                      Clean, fresh laundry delivered back to you at your scheduled time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="px-8 py-3 text-base"
            >
              Back to Home
            </Button>
            <Button 
              onClick={handleTrackOrder}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-base"
            >
              Track Order
              <Package className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
