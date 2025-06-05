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
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
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

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
      
      const isComplete = checkProfileCompleteness(profileData);
      setIsProfileComplete(isComplete);
      
      // Check if this is a first login (profile exists but is incomplete)
      if (profileData && !isComplete) {
        setIsFirstLogin(true);
      } else {
        setIsFirstLogin(false);
      }
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
        
        if (newSession?.user) {
          // Track user login in CleverTap
          if (event === 'SIGNED_IN') {
            setUserProfile({
              Identity: newSession.user.id,
              Email: newSession.user.email,
              Name: newSession.user.user_metadata?.full_name || newSession.user.user_metadata?.name
            });
            trackEvent('User Logged In', {
              'Login Method': newSession.user.app_metadata?.provider || 'email'
            });
          }
          
          // Use setTimeout to avoid blocking the auth state change
          setTimeout(async () => {
            const profileData = await fetchProfile(newSession.user.id);
            setProfile(profileData);
            
            const isComplete = checkProfileCompleteness(profileData);
            setIsProfileComplete(isComplete);
            
            console.log("Profile completeness check:", {
              hasProfile: !!profileData,
              username: profileData?.username,
              mobile_number: profileData?.mobile_number,
              isComplete
            });
            
            // User is considered first-time if they don't have BOTH username AND mobile number
            if (profileData && !isComplete) {
              setIsFirstLogin(true);
            } else {
              setIsFirstLogin(false);
            }
            setIsLoading(false);
          }, 0);
        } else {
          // Clear profile when signed out
          setProfile(null);
          setIsFirstLogin(false);
          setIsProfileComplete(false);
          setIsLoading(false);
          
          // Track user logout
          if (event === 'SIGNED_OUT') {
            trackEvent('User Logged Out');
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Got existing session:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Set user profile in CleverTap for existing session
        setUserProfile({
          Identity: session.user.id,
          Email: session.user.email,
          Name: session.user.user_metadata?.full_name || session.user.user_metadata?.name
        });
        
        const profileData = await fetchProfile(session.user.id);
        setProfile(profileData);
        
        const isComplete = checkProfileCompleteness(profileData);
        setIsProfileComplete(isComplete);
        
        console.log("Initial profile completeness check:", {
          hasProfile: !!profileData,
          username: profileData?.username,
          mobile_number: profileData?.mobile_number,
          isComplete
        });
        
        // User is considered first-time if they don't have BOTH username AND mobile number
        if (profileData && !isComplete) {
          setIsFirstLogin(true);
        } else {
          setIsFirstLogin(false);
        }
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    session,
    user,
    isLoading,
    profile,
    isFirstLogin,
    isProfileComplete,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
