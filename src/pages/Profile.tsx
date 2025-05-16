
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [updating, setUpdating] = useState(false);

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
      
      navigate("/");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
        </div>
        
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
              className="w-full"
            >
              {updating ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
