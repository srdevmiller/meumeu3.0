import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
  logout: () => void;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials.username);
      const res = await apiRequest("POST", "/api/login", credentials);
      const userData = await res.json();
      console.log("Login response:", userData);
      return userData;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login successful, updating user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      refetch();
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Attempting logout");
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      console.log("Logout successful, clearing all cache data");
      // Clear all query cache to ensure no data persists between users
      queryClient.clear();
      queryClient.setQueryData(["/api/user"], null);
      refetch();
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Attempting registration");
      const res = await apiRequest("POST", "/api/register", credentials);
      const userData = await res.json();
      console.log("Registration response:", userData);
      return userData;
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registration successful, updating user data:", user);
      queryClient.setQueryData(["/api/user"], user);
      refetch(); 
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  useEffect(() => {
    console.log("Current auth state:", {
      user,
      isLoading,
      error
    });
  }, [user, isLoading, error]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}