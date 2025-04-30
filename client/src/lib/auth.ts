import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  name: string;
  role: "admin" | "staff";
}

export async function login(username: string, password: string): Promise<User> {
  try {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const userData = await response.json();
    
    // Store user in session/local storage for persistence
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    // Clear any stored user data on login failure
    localStorage.removeItem('user');
    throw error;
  }
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
  // Clear stored user data
  localStorage.removeItem('user');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    // First check if we have a user in localStorage from a previous session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Verify the stored user with the server
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 401) {
        // Clear invalid stored user if server says not authenticated
        localStorage.removeItem('user');
        return null;
      }
    }

    // If no stored user or verification failed, try to get user from server
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('user');
        return null;
      }
      throw new Error("Failed to get current user");
    }

    const userData = await response.json();
    // Store the user data from the server
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
