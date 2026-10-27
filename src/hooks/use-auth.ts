"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService, AuthUser } from "@/services/auth.service";
import type { LoginInput, RegisterInput } from "@/lib/validations";

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

function getRedirectPath() {
  if (typeof window === "undefined") return null;
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (data: LoginInput) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.login(data);
        authService.setAuthData(response.token, response.user);
        setUser(response.user);

        const redirectPath = getRedirectPath();
        if (redirectPath) {
          router.push(redirectPath);
        } else if (response.user.role === "CUSTOMER") {
          router.push("/customer");
        } else {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterInput) => {
      try {
        setLoading(true);
        setError(null);

        const response = await authService.register(data);
        authService.setAuthData(response.token, response.user);
        setUser(response.user);

        const redirectPath = getRedirectPath();
        if (redirectPath) {
          router.push(redirectPath);
        } else if (response.user.role === "CUSTOMER") {
          router.push("/customer");
        } else {
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    error,
    clearError,
  };
}
