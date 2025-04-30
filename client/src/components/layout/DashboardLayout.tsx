import React, { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNotifications?: boolean;
  requireAdmin?: boolean;
}

export default function DashboardLayout({ 
  children, 
  title, 
  showNotifications = true,
  requireAdmin = false 
}: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isLoginPage] = useRoute("/login");

  useEffect(() => {
    // Only redirect after we know for sure the user is not authenticated
    if (!isLoading && !user && !isLoginPage) {
      navigate("/login");
    }

    // Only redirect for admin-only pages if we know the user is not an admin
    if (!isLoading && requireAdmin && user?.role !== "admin") {
      navigate("/");
    }
  }, [user, isLoading, navigate, isLoginPage, requireAdmin]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and not on login page, return null (will be redirected)
  if (!user && !isLoginPage) {
    return null;
  }

  // If admin required but user is not admin, return null (will be redirected)
  if (requireAdmin && user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={title} showNotifications={showNotifications} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
