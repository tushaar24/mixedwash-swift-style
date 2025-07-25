
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/utils/clevertap";

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, isProfileComplete } = useAuth();

  // Check if user came from schedule flow and extract order data
  const fromSchedule = location.state?.fromSchedule;
  const orderData = location.state?.orderData;

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    // Don't redirect while auth context is still loading
    if (isLoading) return;
    
    // Check if user is already logged in
    if (user) {
      // Use setTimeout to prevent blocking the render
      setTimeout(() => {
        // Check for stored order data from Google OAuth
        const storedOrderData = sessionStorage.getItem('pendingOrderData');
        const storedFromSchedule = sessionStorage.getItem('fromSchedule');
        
        let finalOrderData = orderData;
        let finalFromSchedule = fromSchedule;
        
        if (storedOrderData && storedFromSchedule) {
          try {
            finalOrderData = JSON.parse(storedOrderData);
            finalFromSchedule = true;
            // Clear from session storage
            sessionStorage.removeItem('pendingOrderData');
            sessionStorage.removeItem('fromSchedule');
          } catch (e) {
            console.error('Error parsing stored order data:', e);
          }
        }
        
        // Priority 1: Check profile completion first
        if (!isProfileComplete) {
          // Profile incomplete - go to profile page with order data preserved
          navigate("/profile", { 
            state: finalFromSchedule && finalOrderData ? { 
              fromSchedule: true, 
              orderData: finalOrderData 
            } : undefined,
            replace: true 
          });
        } else if (finalFromSchedule && finalOrderData) {
          // Profile complete and coming from schedule - go to address selection
          navigate("/schedule", { 
            state: { 
              fromAuth: true,
              orderData: finalOrderData,
              currentStep: 1 // ADDRESS_SELECTION = 1
            },
            replace: true // Replace auth page in history
          });
        } else {
          // Profile complete but not from schedule - redirect to home
          navigate("/", { replace: true });
        }
      }, 0);
    }
  }, [user, isProfileComplete, isLoading, navigate, fromSchedule, orderData]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    
    try {
      // Always use the base URL for OAuth redirect
      // Store order data in sessionStorage instead of URL to avoid issues
      if (fromSchedule && orderData) {
        sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
        sessionStorage.setItem('fromSchedule', 'true');
        console.log('Stored order data in sessionStorage for Google auth');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) throw error;
      
      // Track user login with Google
      trackEvent('user_logged_in', {
        'provider': 'google',
        'current_time': getCurrentTime()
      });
      
      // The redirect will happen automatically
    } catch (error: any) {
      toast({
        title: "Error signing in with Google",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // Track user login with email
      trackEvent('user_logged_in', {
        'provider': 'email',
        'current_time': getCurrentTime()
      });
      
      toast({
        title: "Success!",
        description: "You are now logged in.",
      });
      
      // Navigation will happen in the useEffect when user state updates
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let redirectUrl = window.location.origin;
      
      // If coming from schedule with order data, include it in the redirect
      if (fromSchedule && orderData) {
        redirectUrl = `${window.location.origin}/schedule?fromAuth=true&orderData=${encodeURIComponent(JSON.stringify(orderData))}`;
      }

      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Please check your email and click the link to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while auth context is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If already logged in and checked, don't render the auth form
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
          MixedWash
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {fromSchedule ? "Sign in to continue with your order" : "Sign in to schedule your laundry pickup"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Google Sign In Button */}
          <div className="mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center space-x-2"
              variant="outline"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>{googleLoading ? "Signing in..." : "Continue with Google"}</span>
            </Button>
            
            {/* Progress bar for Google auth */}
            {googleLoading && (
              <div className="mt-4">
                <div className="text-center text-sm text-muted-foreground mb-2">
                  Redirecting to Google...
                </div>
                <Progress value={100} className="w-full h-2" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-card text-muted-foreground">Or continue with email</span>
            </div>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form className="space-y-6" onSubmit={handleEmailSignIn}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="mt-1">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form className="space-y-6" onSubmit={handleEmailSignUp}>
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="mt-1">
                    <Input
                      id="register-password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
