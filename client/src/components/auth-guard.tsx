import { useLocation } from "wouter";
import { useEffect } from "react";
import { auth } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [, navigate] = useLocation();
  const user = auth.getCurrentUser();
  const isAuthenticated = auth.isAuthenticated();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    if (requiredRole && user?.role !== requiredRole) {
      navigate("/");
      return;
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
