"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { LoginCredentials } from "@/types";
import {
  login as authLogin,
  clearTokens,
  getAccessToken,
  isTokenExpired,
  getRefreshToken,
  refreshAccessToken,
} from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check auth state on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      if (!accessToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (!isTokenExpired(accessToken)) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Access token expired, try refresh
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        await refreshAccessToken();
        setIsAuthenticated(true);
      } catch {
        clearTokens();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await authLogin(credentials);
      setIsAuthenticated(true);
      router.push("/");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearTokens();
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
