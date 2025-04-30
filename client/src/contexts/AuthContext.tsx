import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { getCurrentUser, login as loginApi, logout as logoutApi, User } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        // If user is logged in and currently on login page, redirect to dashboard
        if (currentUser && window.location.pathname === "/login") {
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const user = await loginApi(username, password);
      setUser(user);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      // Force navigation to dashboard
      navigate("/");
      
      return user;
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      navigate("/login");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
