import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Order, Address, TimeSlot } from "@/types/models";
import { trackEvent } from "@/utils/clevertap";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSameDay, isAfter } from "date-fns";
import { 
  Loader2, 
  Calendar, 
  X, 
  Plus, 
  Home, 
  Check, 
  User, 
  Phone, 
  MapPin, 
  Edit 
} from "lucide-react";

const Profile = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isFirstLogin, isProfileComplete, refreshProfile, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract schedule flow data from location state
  const fromSchedule = location.state?.fromSchedule;
  const orderData = location.state?.orderData;
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  
  // New address form state
  const [newAddress, setNewAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Reschedule order state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [reschedulePickupDate, setReschedulePickupDate] = useState<Date | null>(null);
  const [reschedulePickupSlot, setReschedulePickupSlot] = useState<string>("");
  const [rescheduleDeliveryDate, setRescheduleDeliveryDate] = useState<Date | null>(null);
  const [rescheduleDeliverySlot, setRescheduleDeliverySlot] = useState<string>("");
  const [rescheduling, setRescheduling] = useState(false);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Initialize form fields when component mounts or user/profile changes
  useEffect(() => {
    console.log("=== PROFILE FORM INITIALIZATION ===");
    console.log("User:", user?.id, "Profile:", profile, "IsProfileComplete:", isProfileComplete);
    
    if (profile) {
      // Profile exists, use profile data
      console.log("Using profile data for form fields");
      setName(profile.username || "");
      setPhone(profile.mobile_number || "");
    } else if (user) {
      // No profile but user exists, use user metadata or empty values
      console.log("Using user metadata for form fields");
      const userDisplayName = user.user_metadata?.full_name || user.user_metadata?.name || "";
      setName(userDisplayName);
      setPhone("");
    } else {
      // No user, reset to empty
      console.log("Resetting form fields to empty");
      setName("");
      setPhone("");
    }
    
    console.log("Form fields set to:", { name: name, phone: phone });
  }, [profile, user, isProfileComplete]);

  // Track complete_profile_viewed event for incomplete profiles
  useEffect(() => {
    if (!isProfileComplete && user) {
      console.log("Tracking complete_profile_viewed event");
      trackEvent('complete_profile_viewed', {
        'current_time': getCurrentTime()
      });
    }
  }, [isProfileComplete, user]);

  // Handle redirection to schedule flow when profile becomes complete
  useEffect(() => {
    console.log("=== CHECKING SCHEDULE FLOW REDIRECT ===");
    console.log("User:", user?.id, "IsProfileComplete:", isProfileComplete, "FromSchedule:", fromSchedule, "OrderData:", !!orderData);
    
    if (user && isProfileComplete && fromSchedule && orderData) {
      console.log("Profile is complete and came from schedule, redirecting to address selection");
      navigate("/schedule", { 
        state: { 
          returnTo: "/schedule",
          returnStep: 1, // ADDRESS_SELECTION = 1
          orderData: orderData
        },
        replace: true
      });
    }
  }, [user, isProfileComplete, fromSchedule, orderData, navigate]);

  useEffect(() => {
    console.log("=== PROFILE PAGE MAIN EFFECT ===");
    console.log("User:", user?.id, "IsProfileComplete:", isProfileComplete);
    
    if (!user) {
      console.log("No user, redirecting to auth");
      navigate("/auth");
      return;
    }

    // Only fetch orders and addresses if profile is complete
    if (!isProfileComplete) {
      console.log("Profile incomplete, skipping data fetch");
      setDataLoading(false);
      return;
    }

    const fetchOrdersAndAddresses = async () => {
      setDataLoading(true);
      setError(null);
      
      try {
        console.log("Fetching profile data for user:", user.id);
        
        // First, fetch time slots separately
        const { data: timeSlots, error: timeSlotsError } = await supabase
          .from("time_slots")
          .select("*");
          
        if (timeSlotsError) {
          console.error("Error fetching time slots:", timeSlotsError);
          throw timeSlotsError;
        }
        
        // Store time slots for reschedule feature
        setTimeSlots(timeSlots || []);
        
        // Create a map for easy slot lookup
        const slotsMap = new Map();
        timeSlots?.forEach(slot => {
          slotsMap.set(slot.id, slot);
        });
        
        // Then fetch orders without joined relations
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            service:services(*),
            address:addresses(*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          throw ordersError;
        }
        
        console.log("Orders data fetched:", ordersData?.length || 0);
        
        // Process orders to add the time slot data from our map
        const processedOrders = ordersData?.map((order: any) => {
          return {
            ...order,
            pickup_slot: slotsMap.get(order.pickup_slot_id) || null,
            delivery_slot: slotsMap.get(order.delivery_slot_id) || null
          };
        }) || [];
        
        // Fetch addresses
        const { data: addressesData, error: addressesError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false });

        if (addressesError) {
          console.error("Error fetching addresses:", addressesError);
          throw addressesError;
        }
        
        console.log("Addresses data fetched:", addressesData?.length || 0);

        setOrders(processedOrders as Order[]);
        setAddresses(addressesData || []);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        setError(error.message || "Failed to load your profile data");
        toast({
          title: "Error",
          description: "Failed to load your profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setDataLoading(false);
      }
    };

    fetchOrdersAndAddresses();
  }, [user, navigate, toast, isProfileComplete]);

  // Handle phone number input with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow digits
    const digitsOnly = value.replace(/\D/g, '');
    
    setPhone(digitsOnly);
    
    // Validate length
    if (digitsOnly.length === 0) {
      setPhoneError("");
    } else if (digitsOnly.length !== 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError("");
    }
  };

  const handleFirstTimeProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and phone number.",
        variant: "destructive",
      });
      return;
    }

    if (phone.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Track complete_profile_cta_clicked event
    trackEvent('complete_profile_cta_clicked', {
      'name': name.trim(),
      'phone_number': phone.trim(),
      'current_time': getCurrentTime()
    });
    
    setLoading(true);

    try {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: name.trim(),
          mobile_number: phone.trim(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Profile completed",
        description: "Your profile has been successfully completed.",
      });
      
      // Check if user came from schedule flow
      if (fromSchedule && orderData) {
        // Redirect to schedule flow to continue with order
        navigate("/schedule", { 
          state: { 
            returnTo: "/schedule",
            returnStep: 1, // ADDRESS_SELECTION = 1
            orderData: orderData
          },
          replace: true
        });
      } else {
        // Normal flow - redirect to home page
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    if (phone.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }
    
    setProfileUpdateLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: name,
          mobile_number: phone,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully."
      });
      
      setEditProfileDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  // Handle address form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Save new address
  const handleSaveAddress = async () => {
    // Basic validation
    if (!newAddress.address_line1 || !newAddress.city || !newAddress.state || !newAddress.postal_code) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setSavingAddress(true);
    
    try {
      if (!user) {
        throw new Error("You must be logged in to add an address");
      }

      // Check if this is the first address, make it default if so
      if (addresses.length === 0) {
        newAddress.is_default = true;
      }
      
      const { data, error } = await supabase
        .from("addresses")
        .insert([{
          ...newAddress,
          user_id: user.id
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // If setting this as default, update other addresses
        if (newAddress.is_default) {
          await supabase
            .from("addresses")
            .update({ is_default: false })
            .neq("id", data[0].id);
        }
        
        toast({
          title: "Address saved",
          description: "Your address has been saved successfully",
        });
        
        // Add the new address to the list
        setAddresses(prevAddresses => [data[0], ...prevAddresses]);
        
        // Close the dialog
        setDialogOpen(false);
        
        // Reset form
        setNewAddress({
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          postal_code: "",
          is_default: false
        });
      }
    } catch (error: any) {
      toast({
        title: "Error saving address",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // Set address as default
  const setAddressAsDefault = async (addressId: string) => {
    try {
      // First update the selected address to be default
      const { error: updateError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId);
        
      if (updateError) throw updateError;
      
      // Then set all other addresses to not be default
      const { error: bulkUpdateError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .neq("id", addressId);
        
      if (bulkUpdateError) throw bulkUpdateError;
      
      // Update local state
      setAddresses(prevAddresses => 
        prevAddresses.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        }))
      );
      
      toast({
        title: "Default address updated",
        description: "Your default address has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error updating address",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Reschedule order functions
  const openRescheduleDialog = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      setReschedulePickupDate(new Date(order.pickup_date));
      setReschedulePickupSlot(order.pickup_slot_id);
      setRescheduleDeliveryDate(new Date(order.delivery_date));
      setRescheduleDeliverySlot(order.delivery_slot_id);
      setRescheduleDialogOpen(true);
    }
  };

  const getAvailableTimeSlots = (selectedDate: Date | null, isPickup: boolean = true) => {
    if (!selectedDate) return [];
    const today = new Date();
    
    // For pickup slots
    if (isPickup) {
      // If selected date is today, only show all slots (removed enabled filter since property doesn't exist)
      if (isSameDay(selectedDate, today)) {
        return timeSlots;
      }
      // For future dates, show all slots
      return timeSlots;
    }
    
    // For delivery slots
    if (!isPickup && reschedulePickupDate && reschedulePickupSlot) {
      const pickupSlot = timeSlots.find(slot => slot.id === reschedulePickupSlot);
      
      // If delivery is next day after pickup, filter by pickup slot time or later
      if (pickupSlot && isSameDay(selectedDate, addDays(reschedulePickupDate, 1))) {
        return timeSlots.filter(slot => slot.start_time >= pickupSlot.start_time);
      }
      
      // For delivery dates more than 1 day after pickup, show all slots
      if (isAfter(selectedDate, addDays(reschedulePickupDate, 1))) {
        return timeSlots;
      }
    }
    
    // Default: show all slots
    return timeSlots;
  };

  const handleRescheduleOrder = async () => {
    if (!selectedOrderId || !reschedulePickupDate || !reschedulePickupSlot || !rescheduleDeliveryDate || !rescheduleDeliverySlot) {
      toast({
        title: "Missing information",
        description: "Please select both pickup and delivery dates and slots",
        variant: "destructive",
      });
      return;
    }

    setRescheduling(true);

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          pickup_date: reschedulePickupDate.toISOString().split('T')[0],
          pickup_slot_id: reschedulePickupSlot,
          delivery_date: rescheduleDeliveryDate.toISOString().split('T')[0],
          delivery_slot_id: rescheduleDeliverySlot,
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedOrderId);

      if (error) throw error;

      // Update local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === selectedOrderId) {
            const pickupSlot = timeSlots.find(slot => slot.id === reschedulePickupSlot);
            const deliverySlot = timeSlots.find(slot => slot.id === rescheduleDeliverySlot);
            return {
              ...order,
              pickup_date: reschedulePickupDate.toISOString().split('T')[0],
              pickup_slot_id: reschedulePickupSlot,
              pickup_slot: pickupSlot || null,
              delivery_date: rescheduleDeliveryDate.toISOString().split('T')[0],
              delivery_slot_id: rescheduleDeliverySlot,
              delivery_slot: deliverySlot || null,
            };
          }
          return order;
        })
      );

      toast({
        title: "Order rescheduled",
        description: "Your order has been successfully rescheduled",
      });

      setRescheduleDialogOpen(false);
      setSelectedOrderId(null);
    } catch (error: any) {
      toast({
        title: "Error rescheduling order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq("id", orderId);

      if (error) throw error;

      // Update local orders state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      toast({
        title: "Order cancelled",
        description: "Your order has been successfully cancelled",
      });
    } catch (error: any) {
      toast({
        title: "Error cancelling order",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    console.log("Rendering null - no user");
    return null;
  }

  // Show first-time user form if profile is incomplete
  if (!isProfileComplete) {
    console.log("=== RENDERING INCOMPLETE PROFILE FORM ===");
    console.log("State:", { 
      name, 
      phone, 
      profile, 
      user: user?.id,
      isProfileComplete,
      loading 
    });
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-lg border-0">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Welcome to MixedWash!
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Please complete your profile to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <form onSubmit={handleFirstTimeProfileSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 text-base"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  className="h-12 text-base"
                  placeholder="Enter your phone number"
                  maxLength={10}
                />
                {phoneError && (
                  <p className="text-sm text-red-500">{phoneError}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base rounded-lg"
                disabled={loading || !!phoneError || phone.length !== 10}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state for profile data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
          <p className="text-gray-500">Loading your profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-500">Error</CardTitle>
              <CardDescription>
                We encountered an issue loading your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // Normal profile page for returning users
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

        <Tabs defaultValue="orders">
          <TabsList className="mb-6">
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="addresses">My Addresses</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View all your laundry orders history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/schedule')}
                    >
                      Schedule Your First Pickup
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between p-4 border-b">
                          <div>
                            <h3 className="font-semibold">
                              {order.service?.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Order #{order.id.substring(0, 8)}
                            </p>
                          </div>
                          <div className="mt-2 md:mt-0 flex flex-col md:flex-row gap-2 items-start md:items-center">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            {order.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openRescheduleDialog(order.id)}
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Reschedule
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                                      <X className="h-4 w-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to cancel this order? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleCancelOrder(order.id)}>
                                        Cancel Order
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Pickup</p>
                              <p className="text-sm">
                                {new Date(order.pickup_date).toLocaleDateString()} | {" "}
                                {order.pickup_slot?.label || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Delivery</p>
                              <p className="text-sm">
                                {new Date(order.delivery_date).toLocaleDateString()} | {" "}
                                {order.delivery_slot?.label || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Address</p>
                            <p className="text-sm">
                              {order.address?.address_line1}
                              {order.address?.address_line2 && `, ${order.address.address_line2}`}, {" "}
                              {order.address?.city}, {order.address?.state} {order.address?.postal_code}
                            </p>
                          </div>
                          {order.special_instructions && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-gray-500">Notes</p>
                              <p className="text-sm">{order.special_instructions}</p>
                            </div>
                          )}
                          {order.total_amount && (
                            <div className="mt-4 text-right">
                              <p className="text-lg font-bold">
                                ₹{order.total_amount.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Addresses</CardTitle>
                  <CardDescription>
                    Manage your saved addresses
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add a New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="address_line1" className="text-sm font-medium">
                          Address Line 1 *
                        </label>
                        <Input 
                          id="address_line1"
                          name="address_line1"
                          value={newAddress.address_line1}
                          onChange={handleAddressChange}
                          placeholder="House/Flat No., Building Name, Street"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="address_line2" className="text-sm font-medium">
                          Address Line 2 (Optional)
                        </label>
                        <Input 
                          id="address_line2"
                          name="address_line2"
                          value={newAddress.address_line2}
                          onChange={handleAddressChange}
                          placeholder="Landmark, Area"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-medium">
                            City *
                          </label>
                          <Input 
                            id="city"
                            name="city"
                            value={newAddress.city}
                            onChange={handleAddressChange}
                            placeholder="City"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="state" className="text-sm font-medium">
                            State *
                          </label>
                          <Input 
                            id="state"
                            name="state"
                            value={newAddress.state}
                            onChange={handleAddressChange}
                            placeholder="State"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="postal_code" className="text-sm font-medium">
                          Postal Code *
                        </label>
                        <Input 
                          id="postal_code"
                          name="postal_code"
                          value={newAddress.postal_code}
                          onChange={handleAddressChange}
                          placeholder="Postal Code"
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="is_default"
                          name="is_default"
                          checked={newAddress.is_default}
                          onChange={handleAddressChange}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor="is_default" className="text-sm">
                          Set as default address
                        </label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveAddress} 
                        disabled={savingAddress}
                      >
                        {savingAddress ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : "Save Address"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You don't have any saved addresses yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <Card key={address.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Home className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {address.address_line1}
                                {address.address_line2 && `, ${address.address_line2}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                              {address.is_default && (
                                <span className="mt-2 inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                          {!address.is_default && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setAddressAsDefault(address.id)}
                            >
                              Set as Default
                            </Button>
                          )}
                          {address.is_default && (
                            <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    {/* User info section */}
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">{profile?.username || "Not set"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{profile?.mobile_number || "Not set"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Dialog open={editProfileDialogOpen} onOpenChange={setEditProfileDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" /> Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label htmlFor="edit-name" className="text-sm font-medium">
                                Name
                              </label>
                              <Input 
                                id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label htmlFor="edit-phone" className="text-sm font-medium">
                                Phone Number
                              </label>
                              <Input 
                                id="edit-phone"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="Enter 10 digit phone number"
                                maxLength={10}
                                className={phoneError ? "border-red-500" : ""}
                              />
                              {phoneError && (
                                <p className="text-sm text-red-500">{phoneError}</p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setEditProfileDialogOpen(false);
                                setPhoneError("");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleProfileUpdate} 
                              disabled={profileUpdateLoading || !!phoneError || phone.length !== 10}
                            >
                              {profileUpdateLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : "Save Changes"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      variant="destructive"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        navigate("/");
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Reschedule Order Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Reschedule Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Pickup Section */}
              <div>
                <h3 className="font-medium mb-3">Pickup Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {reschedulePickupDate ? format(reschedulePickupDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          selectedDate={reschedulePickupDate}
                          onSelectDate={setReschedulePickupDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Time</label>
                    <select
                      value={reschedulePickupSlot}
                      onChange={(e) => setReschedulePickupSlot(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots(reschedulePickupDate, true).map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Section */}
              <div>
                <h3 className="font-medium mb-3">Delivery Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Delivery Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {rescheduleDeliveryDate ? format(rescheduleDeliveryDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          selectedDate={rescheduleDeliveryDate}
                          onSelectDate={setRescheduleDeliveryDate}
                          disabled={(date) => 
                            !reschedulePickupDate || date <= reschedulePickupDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Delivery Time</label>
                    <select
                      value={rescheduleDeliverySlot}
                      onChange={(e) => setRescheduleDeliverySlot(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select time</option>
                      {getAvailableTimeSlots(rescheduleDeliveryDate, false).map((slot) => (
                        <option key={slot.id} value={slot.id}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {rescheduleDeliveryDate && reschedulePickupDate && isSameDay(rescheduleDeliveryDate, addDays(reschedulePickupDate, 1)) && reschedulePickupSlot && (
                  <p className="text-xs text-blue-600 mt-2">
                    Only slots equal or later than pickup time ({timeSlots.find(slot => slot.id === reschedulePickupSlot)?.label}) are shown for next day delivery
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setRescheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRescheduleOrder} 
                disabled={rescheduling}
              >
                {rescheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rescheduling...
                  </>
                ) : "Reschedule Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
