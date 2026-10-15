import { api } from "./api";
import type { LoginInput, RegisterInput } from "@/lib/validations";

// ============================================
// Auth Service
// ============================================

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
  status: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.auth.login(data);
    return response.data as AuthResponse;
  },

  /**
   * Register a new user
   */
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.auth.register({
      email: data.email,
      password: data.password,
      name: data.name,
    });
    return response.data as AuthResponse;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore API errors on logout - clear local data regardless
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // Clear auth cookies
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_role=; path=/; max-age=0";
    }
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("auth_user");
    if (!userStr || userStr === "undefined" || userStr === "null") {
      localStorage.removeItem("auth_user");
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch {
      localStorage.removeItem("auth_user");
      return null;
    }
  },

  /**
   * Store auth data in localStorage and cookie
   */
  setAuthData: (token: string, user: AuthUser): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user ?? {}));
    // Set cookies for middleware (1 day expiry)
    document.cookie = `auth_token=${token}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
    document.cookie = `user_role=${user.role}; path=/; max-age=${24 * 60 * 60}; SameSite=Lax`;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  },

  /**
   * Get stored auth token
   */
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  },
};
