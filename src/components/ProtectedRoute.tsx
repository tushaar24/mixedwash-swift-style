
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCompleteProfile?: boolean;
}

export const ProtectedRoute = ({ children, requireCompleteProfile = true }: ProtectedRouteProps) => {
  const { user, isLoading, isProfileComplete } = useAuth();

  console.log("=== PROTECTED ROUTE DEBUG ===");
  console.log("isLoading:", isLoading);
  console.log("user:", user?.id);
  console.log("isProfileComplete:", isProfileComplete);
  console.log("requireCompleteProfile:", requireCompleteProfile);
  console.log("Current location:", window.location.pathname);

  if (isLoading) {
    console.log("ProtectedRoute: Showing loading spinner");
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // If we're on the profile page, allow access even with incomplete profile
  if (window.location.pathname === '/profile') {
    console.log("ProtectedRoute: On profile page, allowing access regardless of profile completeness");
    return <>{children}</>;
  }

  if (requireCompleteProfile && !isProfileComplete) {
    console.log("ProtectedRoute: Profile incomplete, redirecting to /profile");
    return <Navigate to="/profile" replace />;
  }

  console.log("ProtectedRoute: Rendering children");
  return <>{children}</>;
};
