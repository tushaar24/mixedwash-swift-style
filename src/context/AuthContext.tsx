
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/models";
import { setUserProfile, trackEvent } from "@/utils/clevertap";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  profile: Profile | null;
  isFirstLogin: boolean;
  isProfileChecked: boolean;
  isProfileComplete: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  profile: null,
  isFirstLogin: false,
  isProfileChecked: false,
  isProfileComplete: false,
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isProfileChecked, setIsProfileChecked] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const migrateTempCustomerData = async (userId: string, userPhone: string) => {
    try {
      console.log("=== MIGRATION DEBUG ===");
      console.log("Attempting to migrate temp customer data for:");
      console.log("- userId:", userId);
      console.log("- userPhone:", userPhone);
      
      const { data, error } = await supabase.rpc('migrate_temp_customer_data', {
        user_phone: userPhone,
        authenticated_user_id: userId
      });
      
      if (error) {
        console.error("❌ Error migrating temp customer data:", error);
        return false;
      }
      
      console.log("✅ Migration result:", data);
      console.log("Migration successful:", data === true ? "YES" : "NO");
      console.log("=== END MIGRATION DEBUG ===");
      return data;
    } catch (error) {
      console.error("❌ Exception in migrateTempCustomerData:", error);
      return false;
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log("Profile doesn't exist, creating new profile for user:", userId);
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{ id: userId }])
            .select()
            .single();
          
          if (createError) {
            console.error("Error creating profile:", createError);
            return null;
          }
          
          console.log("New profile created:", newProfile);
          return newProfile as Profile;
        }
        
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as Profile;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  const checkProfileCompleteness = (profileData: Profile | null) => {
    if (!profileData) return false;
    // Profile is complete if both username and mobile_number are present and not empty
    return !!(profileData.username?.trim() && profileData.mobile_number?.trim());
  };

  const handleProfileAndMigration = async (userId: string) => {
    console.log("=== PROFILE & MIGRATION CHECK ===");
    console.log("Handling profile and migration for userId:", userId);
    
    let profileData = await fetchProfile(userId);
    console.log("📋 Profile data fetched:", {
      hasProfile: !!profileData,
      username: profileData?.username,
      mobile_number: profileData?.mobile_number
    });
    
    const isComplete = checkProfileCompleteness(profileData);
    console.log("✅ Profile completeness check:", {
      isComplete,
      hasUsername: !!(profileData?.username?.trim()),
      hasMobileNumber: !!(profileData?.mobile_number?.trim())
    });
    
    // Only attempt migration if profile is complete
    if (isComplete && profileData?.mobile_number) {
      console.log("🔄 Profile is complete, attempting temp customer migration...");
      console.log("📞 Using phone number for migration:", profileData.mobile_number);
      
      const migrationSuccess = await migrateTempCustomerData(
        userId, 
        profileData.mobile_number
      );
      
      if (migrationSuccess) {
        console.log("🎉 Temp customer data migrated successfully!");
        // Refresh profile after migration to get updated data
        profileData = await fetchProfile(userId);
        console.log("📋 Profile after migration:", profileData);
      } else {
        console.log("ℹ️  No temp customer data found to migrate or migration failed");
      }
    } else if (!isComplete) {
      console.log("⚠️  Profile is incomplete, skipping migration check");
      console.log("Missing:", {
        username: !profileData?.username?.trim(),
        mobile_number: !profileData?.mobile_number?.trim()
      });
    } else {
      console.log("⚠️  No mobile number found, skipping migration");
    }
    
    setProfile(profileData);
    setIsProfileComplete(isComplete);
    
    // User is considered first-time if they don't have BOTH username AND mobile number
    if (profileData && !isComplete) {
      setIsFirstLogin(true);
    } else {
      setIsFirstLogin(false);
    }
    
    setIsProfileChecked(true);
    console.log("=== END PROFILE & MIGRATION CHECK ===");
  };

  const refreshProfile = async () => {
    if (user) {
      await handleProfileAndMigration(user.id);
    }
  };

  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Auth state changed:", event, newSession?.user?.id);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false); // Stop loading as soon as we know auth state
        
        if (newSession?.user) {
          setIsProfileChecked(false);
          
          // Defer ALL heavy operations to avoid blocking render
          requestIdleCallback(() => {
            // Set user profile in CleverTap for any session (login or restoration)
            const userName = newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name;
            setUserProfile({
              Identity: newSession.user.id,
              Email: newSession.user.email,
              Name: userName
            });
            
            handleProfileAndMigration(newSession.user.id);
          }, { timeout: 5000 });
        } else {
          // Clear profile when signed out
          setProfile(null);
          setIsFirstLogin(false);
          setIsProfileComplete(false);
          setIsProfileChecked(true); // Profile state is known (empty)
          
          // Track user logout - defer this too
          if (event === 'SIGNED_OUT') {
            requestIdleCallback(() => {
              trackEvent('User Logged Out');
            });
          }
        }
      }
    );

    // THEN check for existing session - optimize initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false); // Stop loading, we have auth state
      
      if (session?.user) {
        setIsProfileChecked(false);
        
        // Defer heavy operations until browser is idle
        requestIdleCallback(() => {
          // Set user profile in CleverTap for existing session
          const userName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          setUserProfile({
            Identity: session.user.id,
            Email: session.user.email,
            Name: userName
          });
          
          handleProfileAndMigration(session.user.id);
        }, { timeout: 5000 });
      } else {
        setIsProfileChecked(true); // Profile state is known (empty)
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    isLoading,
    profile,
    isFirstLogin,
    isProfileChecked,
    isProfileComplete,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
