import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string | string[];
  requiredPermission?: string | string[];
  redirectTo?: string;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  redirectTo = "/login",
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Store the current location when the component mounts or location changes
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      sessionStorage.setItem(
        "redirectAfterLogin",
        location.pathname + location.search,
      );
    }
  }, [isAuthenticated, isLoading, location]);

  // If still loading auth state, show loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Navigate to login with the current location in state for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement if specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location, requiredRole }}
        replace
      />
    );
  }

  // Check permission requirement if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location, requiredPermission }}
        replace
      />
    );
  }

  // If all checks pass, render children
  return <>{children}</>;
};

export default ProtectedRoute;
