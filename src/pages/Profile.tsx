
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Home, Loader2, Package, User } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Address {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

interface Order {
  id: string;
  service_id: string;
  pickup_date: string;
  delivery_date: string;
  status: string;
  created_at: string;
  total_amount: number | null;
  service: {
    name: string;
    icon: string;
  };
  pickup_slot: {
    label: string;
  };
  delivery_slot: {
    label: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const [addAddressDialogOpen, setAddAddressDialogOpen] = useState(false);
  const [editAddressDialogOpen, setEditAddressDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  
  // New address form state
  const [addressForm, setAddressForm] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }
      
      setUser(user);
      
      // Fetch profile data
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, mobile_number")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUsername(profile.username || "");
        setMobileNumber(profile.mobile_number || "");
      }
      
      setLoading(false);
    };
    
    getUser();
  }, [navigate]);
  
  // Fetch user addresses
  const fetchAddresses = async () => {
    if (!user) return;
    
    setFetchingAddresses(true);
    
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false });
        
      if (error) throw error;
      
      setAddresses(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching addresses",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchingAddresses(false);
    }
  };
  
  // Fetch user orders
  const fetchOrders = async () => {
    if (!user) return;
    
    setFetchingOrders(true);
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          service:service_id (name, icon),
          pickup_slot:pickup_slot_id (label),
          delivery_slot:delivery_slot_id (label)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setFetchingOrders(false);
    }
  };

  // Load addresses when tab changes
  const handleTabChange = (value: string) => {
    if (value === "addresses" && addresses.length === 0) {
      fetchAddresses();
    } else if (value === "orders" && orders.length === 0) {
      fetchOrders();
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          mobile_number: mobileNumber,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  
  // Handle address form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };
  
  // Set up form for editing an address
  const editAddress = (address: Address) => {
    setCurrentAddress(address);
    setAddressForm({
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      is_default: address.is_default
    });
    setEditAddressDialogOpen(true);
  };
  
  // Save new address
  const handleSaveAddress = async () => {
    // Basic validation
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setUpdating(true);
    
    try {
      // Check if this is the first address, make it default if so
      if (addresses.length === 0) {
        addressForm.is_default = true;
      }
      
      const { data, error } = await supabase
        .from("addresses")
        .insert([addressForm])
        .select();
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // If setting this as default, update other addresses
        if (addressForm.is_default) {
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
        await fetchAddresses();
        
        // Close the dialog
        setAddAddressDialogOpen(false);
        
        // Reset form
        setAddressForm({
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
      setUpdating(false);
    }
  };
  
  // Update existing address
  const handleUpdateAddress = async () => {
    if (!currentAddress) return;
    
    // Basic validation
    if (!addressForm.address_line1 || !addressForm.city || !addressForm.state || !addressForm.postal_code) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from("addresses")
        .update(addressForm)
        .eq("id", currentAddress.id);
        
      if (error) {
        throw error;
      }
      
      // If setting this as default, update other addresses
      if (addressForm.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .neq("id", currentAddress.id);
      }
      
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully",
      });
      
      // Refresh addresses list
      await fetchAddresses();
      
      // Close the dialog
      setEditAddressDialogOpen(false);
      
      // Reset form and current address
      setCurrentAddress(null);
      setAddressForm({
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false
      });
    } catch (error: any) {
      toast({
        title: "Error updating address",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };
  
  // Delete address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Address deleted",
        description: "Your address has been deleted successfully",
      });
      
      // Refresh addresses list
      await fetchAddresses();
    } catch (error: any) {
      toast({
        title: "Error deleting address",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
        </div>
        
        <Tabs defaultValue="profile" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input value={user?.email || ""} disabled />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium mb-2">
                    Mobile Number
                  </label>
                  <Input
                    id="mobile"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    type="tel"
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={updateProfile} 
                    disabled={updating} 
                    className="w-full bg-black hover:bg-gray-800"
                  >
                    {updating ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {fetchingAddresses ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div 
                          key={address.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-bold">{address.address_line1}</h3>
                                {address.is_default && (
                                  <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              {address.address_line2 && (
                                <p className="text-sm text-gray-600">{address.address_line2}</p>
                              )}
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} {address.postal_code}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => editAddress(address)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No addresses found</h3>
                      <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
                    </div>
                  )}
                  
                  {/* Add new address button */}
                  <Dialog open={addAddressDialogOpen} onOpenChange={setAddAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-dashed border-gray-300"
                      >
                        Add a New Address
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
                            value={addressForm.address_line1}
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
                            value={addressForm.address_line2}
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
                              value={addressForm.city}
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
                              value={addressForm.state}
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
                            value={addressForm.postal_code}
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
                            checked={addressForm.is_default}
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
                          onClick={() => setAddAddressDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveAddress} 
                          disabled={updating}
                          className="bg-black hover:bg-gray-800"
                        >
                          {updating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : "Save Address"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Edit address dialog */}
                  <Dialog open={editAddressDialogOpen} onOpenChange={setEditAddressDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="edit_address_line1" className="text-sm font-medium">
                            Address Line 1 *
                          </label>
                          <Input 
                            id="edit_address_line1"
                            name="address_line1"
                            value={addressForm.address_line1}
                            onChange={handleAddressChange}
                            placeholder="House/Flat No., Building Name, Street"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="edit_address_line2" className="text-sm font-medium">
                            Address Line 2 (Optional)
                          </label>
                          <Input 
                            id="edit_address_line2"
                            name="address_line2"
                            value={addressForm.address_line2}
                            onChange={handleAddressChange}
                            placeholder="Landmark, Area"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="edit_city" className="text-sm font-medium">
                              City *
                            </label>
                            <Input 
                              id="edit_city"
                              name="city"
                              value={addressForm.city}
                              onChange={handleAddressChange}
                              placeholder="City"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="edit_state" className="text-sm font-medium">
                              State *
                            </label>
                            <Input 
                              id="edit_state"
                              name="state"
                              value={addressForm.state}
                              onChange={handleAddressChange}
                              placeholder="State"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label htmlFor="edit_postal_code" className="text-sm font-medium">
                            Postal Code *
                          </label>
                          <Input 
                            id="edit_postal_code"
                            name="postal_code"
                            value={addressForm.postal_code}
                            onChange={handleAddressChange}
                            placeholder="Postal Code"
                            required
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <input
                            type="checkbox"
                            id="edit_is_default"
                            name="is_default"
                            checked={addressForm.is_default}
                            onChange={handleAddressChange}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor="edit_is_default" className="text-sm">
                            Set as default address
                          </label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setEditAddressDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdateAddress} 
                          disabled={updating}
                          className="bg-black hover:bg-gray-800"
                        >
                          {updating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : "Update Address"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </TabsContent>
          
          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              {fetchingOrders ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start">
                              <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <span className="text-2xl">{order.service?.icon}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{order.service?.name}</h3>
                                  <span 
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    {order.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Pickup: {new Date(order.pickup_date).toLocaleDateString()} • {order.pickup_slot?.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Delivery: {new Date(order.delivery_date).toLocaleDateString()} • {order.delivery_slot?.label}
                                </p>
                                {order.total_amount && (
                                  <p className="font-medium mt-1">
                                    Total: ₹{order.total_amount.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No orders yet</h3>
                      <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                      <Button 
                        className="bg-black hover:bg-gray-800"
                        onClick={() => navigate("/schedule")}
                      >
                        Schedule a Pickup
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
