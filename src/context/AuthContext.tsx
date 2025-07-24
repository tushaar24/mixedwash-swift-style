
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
  isProfileComplete: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  profile: null,
  isFirstLogin: false,
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
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const migrateTempCustomerData = async (userId: string, userPhone: string) => {
    try {
      const { data, error } = await supabase.rpc('migrate_temp_customer_data', {
        user_phone: userPhone,
        authenticated_user_id: userId
      });
      
      if (error) {
        console.error("❌ Error migrating temp customer data:", error);
        return false;
      }
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
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{ id: userId }])
            .select()
            .single();
          
          if (createError) {
            console.error("Error creating profile:", createError);
            return null;
          }
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
    let profileData = await fetchProfile(userId);
    const isComplete = checkProfileCompleteness(profileData);
    
    // Only attempt migration if profile is complete
    if (isComplete && profileData?.mobile_number) {
      const migrationSuccess = await migrateTempCustomerData(
        userId, 
        profileData.mobile_number
      );
      
      if (migrationSuccess) {
        // Refresh profile after migration to get updated data
        profileData = await fetchProfile(userId);
      }
    }
    
    setProfile(profileData);
    // Re-check completeness after potential migration and update state
    setIsProfileComplete(checkProfileCompleteness(profileData));
  };

  const refreshProfile = async () => {
    if (user) {
      await handleProfileAndMigration(user.id);
    }
  };

  useEffect(() => {
    // onAuthStateChange handles all auth events including initial session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Set user profile in CleverTap for any session (login or restoration)
          const userName = newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name;
          setUserProfile({
            Identity: newSession.user.id,
            Email: newSession.user.email,
            Name: userName
          });
          
          await handleProfileAndMigration(newSession.user.id);
        } else {
          // Clear profile when signed out
          setProfile(null);
          setIsProfileComplete(false);
        }

        // Track user logout event specifically
        if (event === 'SIGNED_OUT') {
          trackEvent('User Logged Out');
        }

        // We are no longer loading after the first auth event is handled
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    isLoading,
    profile,
    isFirstLogin: !!user && !!profile && !isProfileComplete,
    isProfileComplete,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
