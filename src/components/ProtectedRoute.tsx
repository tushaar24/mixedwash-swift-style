
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requireCompleteProfile?: boolean;
}

export const ProtectedRoute = ({ children, requireCompleteProfile = true }: ProtectedRouteProps) => {
  const { user, isLoading, isProfileComplete } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireCompleteProfile && !isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
