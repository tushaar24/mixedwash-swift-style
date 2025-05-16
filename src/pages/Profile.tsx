
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Order, Address } from "@/types/models";

const Profile = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isFirstLogin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchOrdersAndAddresses = async () => {
      try {
        // Fetch orders with related data
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            service:services(*),
            address:addresses(*),
            pickup_slot:time_slots(*),
            delivery_slot:time_slots(*)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;
        
        // Fetch addresses
        const { data: addressesData, error: addressesError } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id);

        if (addressesError) throw addressesError;

        setOrders(ordersData as Order[]);
        setAddresses(addressesData);
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "Failed to load your profile data",
          variant: "destructive",
        });
      }
    };

    fetchOrdersAndAddresses();
  }, [user, navigate, toast]);

  const handleFirstTimeProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: name,
          mobile_number: phone,
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
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

  if (!user) {
    return null;
  }

  // Show first-time user form if it's their first login
  if (isFirstLogin) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Welcome to MixedWash!</CardTitle>
              <CardDescription>
                Please complete your profile to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFirstTimeProfileSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : "Complete Profile"}
                </Button>
              </form>
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
                                {order.pickup_slot?.label}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Delivery</p>
                              <p className="text-sm">
                                {new Date(order.delivery_date).toLocaleDateString()} | {" "}
                                {order.delivery_slot?.label}
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
                <Button onClick={() => navigate('/schedule')}>
                  Add Address
                </Button>
              </CardHeader>
              <CardContent>
                {addresses.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You don't have any saved addresses yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate('/schedule')}
                    >
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <Card key={address.id} className="p-4">
                        <div className="flex items-start justify-between">
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input value={user.email} disabled />
                  </div>

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
