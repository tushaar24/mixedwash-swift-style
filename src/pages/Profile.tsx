import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, MapPin, Plus, Home, Check, Phone, User, Edit } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

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
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  
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

  // Set initial name and phone values from the profile
  useEffect(() => {
    if (profile) {
      setName(profile.username || "");
      setPhone(profile.mobile_number || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Only fetch orders and addresses if profile is complete
    if (!isProfileComplete) {
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
      
      // Redirect to home page after completing first-time profile
      navigate("/");
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

  if (!user) {
    return null;
  }

  // Show first-time user form if profile is incomplete
  if (!isProfileComplete) {
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
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="h-12 text-base"
                  placeholder="Enter your phone number"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base rounded-lg"
                disabled={loading}
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
                          <div className="mt-2 md:mt-0">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
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
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Your phone number"
                                type="tel"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setEditProfileDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleProfileUpdate} 
                              disabled={profileUpdateLoading}
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
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
