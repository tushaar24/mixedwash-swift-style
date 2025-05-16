
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Loader2, Home, Plus, Package2, Truck, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface TimeSlot {
  id: string;
  label: string;
  start_time: string;
  end_time: string;
}

interface Order {
  id: string;
  service_id: string;
  address_id: string;
  pickup_date: string;
  pickup_slot_id: string;
  delivery_date: string;
  delivery_slot_id: string;
  special_instructions: string | null;
  estimated_weight: number | null;
  total_amount: number | null;
  status: string;
  created_at: string;
  service: {
    name: string;
    price: number;
    discount_price: number | null;
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    mobile_number: "",
  });
  const [newAddress, setNewAddress] = useState({
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    is_default: false,
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      setProfileData(profileData);
      setFormData({
        username: profileData?.username || "",
        mobile_number: profileData?.mobile_number || "",
      });

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          service:service_id(name, price, discount_price, icon),
          pickup_slot:pickup_slot_id(label),
          delivery_slot:delivery_slot_id(label)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      // Type assertion to satisfy TypeScript
      const typedOrders = ordersData as Order[];
      setOrders(typedOrders);

      // Fetch addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false });

      if (addressesError) throw addressesError;

      setAddresses(addressesData || []);
    } catch (error: any) {
      console.error("Error fetching user data:", error.message);
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateProfile = async () => {
    if (!user) return;

    setUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          mobile_number: formData.mobile_number,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      setEditingProfile(false);
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const saveNewAddress = async () => {
    if (!user) return;

    // Basic validation
    if (
      !newAddress.address_line1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postal_code
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSavingAddress(true);
    try {
      // Check if this is the first address, make it default if so
      if (addresses.length === 0) {
        newAddress.is_default = true;
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert([{
          ...newAddress,
          user_id: user.id // Add user_id here
        }])
        .select();

      if (error) throw error;

      if (data && data.length > 0 && newAddress.is_default) {
        // If setting this as default, update other addresses
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .neq("id", data[0].id)
          .eq("user_id", user.id);
      }

      toast({
        title: "Address added",
        description: "Your address has been added successfully",
      });

      setAddingAddress(false);
      setNewAddress({
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        is_default: false,
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error adding address",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // First, set all addresses to non-default
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);

      // Then set the selected address as default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId);

      if (error) throw error;

      toast({
        title: "Default address updated",
        description: "Your default address has been updated",
      });
      fetchUserData();
    } catch (error: any) {
      toast({
        title: "Error updating default address",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) return;

    try {
      // Check if address is used in any orders
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("id")
        .eq("address_id", addressId)
        .limit(1);

      if (orderError) throw orderError;

      if (orderData && orderData.length > 0) {
        toast({
          title: "Cannot delete address",
          description: "This address is used in existing orders",
          variant: "destructive",
        });
        return;
      }

      // Delete the address
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (error) throw error;

      toast({
        title: "Address deleted",
        description: "Your address has been deleted",
      });
      fetchUserData();
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs
            defaultValue="profile"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Email</label>
                      <div className="bg-gray-100 px-3 py-2 rounded-md border">
                        {user?.email}
                      </div>
                    </div>

                    {editingProfile ? (
                      <>
                        <div className="space-y-2">
                          <label
                            htmlFor="username"
                            className="block text-sm font-medium"
                          >
                            Username
                          </label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="mobile_number"
                            className="block text-sm font-medium"
                          >
                            Mobile Number
                          </label>
                          <Input
                            id="mobile_number"
                            name="mobile_number"
                            value={formData.mobile_number}
                            onChange={handleInputChange}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Username
                          </label>
                          <div className="bg-gray-100 px-3 py-2 rounded-md border">
                            {profileData?.username || "Not set"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Mobile Number
                          </label>
                          <div className="bg-gray-100 px-3 py-2 rounded-md border">
                            {profileData?.mobile_number || "Not set"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  {editingProfile ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditingProfile(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={updateProfile}
                        disabled={updatingProfile}
                        className="bg-black hover:bg-gray-800"
                      >
                        {updatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingProfile(true)}
                      className="bg-black hover:bg-gray-800"
                    >
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>My Orders</CardTitle>
                  <CardDescription>Track your laundry orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <Table>
                      <TableCaption>Your recent laundry orders</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Schedule</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              {format(
                                new Date(order.created_at),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center">
                                <span className="text-xl mr-2">
                                  {order.service.icon}
                                </span>
                                {order.service.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "in-progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {order.status.charAt(0).toUpperCase() +
                                  order.status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                <div className="flex items-center">
                                  <Package2 className="h-3 w-3 mr-1" />
                                  {format(
                                    new Date(order.pickup_date),
                                    "MMM d"
                                  )}{" "}
                                  • {order.pickup_slot.label}
                                </div>
                                <div className="flex items-center mt-1">
                                  <Truck className="h-3 w-3 mr-1" />
                                  {format(
                                    new Date(order.delivery_date),
                                    "MMM d"
                                  )}{" "}
                                  • {order.delivery_slot.label}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              ₹
                              {order.total_amount?.toFixed(2) ||
                                (order.estimated_weight &&
                                  order.service.discount_price
                                  ? (
                                      order.estimated_weight *
                                      order.service.discount_price
                                    ).toFixed(2)
                                  : "N/A")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12">
                      <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        No orders yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        You haven't placed any orders yet
                      </p>
                      <Button
                        onClick={() => navigate("/schedule")}
                        className="bg-black hover:bg-gray-800"
                      >
                        Schedule a Pickup
                      </Button>
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
                      Manage your delivery addresses
                    </CardDescription>
                  </div>
                  <Dialog open={addingAddress} onOpenChange={setAddingAddress}>
                    <DialogTrigger asChild>
                      <Button className="bg-black hover:bg-gray-800">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add a New Address</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="address_line1"
                            className="text-sm font-medium"
                          >
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
                          <label
                            htmlFor="address_line2"
                            className="text-sm font-medium"
                          >
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
                            <label
                              htmlFor="city"
                              className="text-sm font-medium"
                            >
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
                            <label
                              htmlFor="state"
                              className="text-sm font-medium"
                            >
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
                          <label
                            htmlFor="postal_code"
                            className="text-sm font-medium"
                          >
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
                          onClick={() => setAddingAddress(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={saveNewAddress}
                          disabled={savingAddress}
                          className="bg-black hover:bg-gray-800"
                        >
                          {savingAddress ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Address"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {addresses.length > 0 ? (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <Card
                          key={address.id}
                          className={address.is_default ? "border-black" : ""}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <Home className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h3 className="font-bold">
                                    {address.address_line1}
                                  </h3>
                                  {address.is_default && (
                                    <span className="ml-2 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                {address.address_line2 && (
                                  <p className="text-sm text-gray-600">
                                    {address.address_line2}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state}{" "}
                                  {address.postal_code}
                                </p>

                                <div className="mt-3 pt-2 border-t flex justify-end space-x-2">
                                  {!address.is_default && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        setDefaultAddress(address.id)
                                      }
                                      className="text-xs h-8"
                                    >
                                      Set as Default
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteAddress(address.id)}
                                    className="text-xs h-8 text-red-500 hover:text-red-700"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">
                        No addresses yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Add an address to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
