import { create } from "zustand";

import { axiosInstance } from "@/lib/axios";
import { AUTH_ENDPOINTS } from "../lib/endpoints";
import { User } from "../lib/types";
import { runAsync } from "@/lib/store-utils";

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  unreadCount?: number;
}

interface AuthStateTypes {
  user: User | null;
  error: string | null;
  checkingAuth: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  isRefreshing: boolean; // Flag to deduplicate checkAuth calls
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: (skipCache?: boolean) => Promise<void>;
  googleAuth: (code: string) => Promise<User | null>;
  loginWithDiscord: (code: string) => Promise<User | null>;
  sendVerifyOtp: () => Promise<{ success: boolean; message: string }>;
  verifyEmail: (otp: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<boolean>;
  updateProfile: (formData: FormData) => Promise<boolean>;
  updateSettings: (settings: { allowChallenges?: boolean; allowMessages?: boolean }) => Promise<boolean>;
  sendPassResetOtp: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  verifyPassResetOtp: (
    email: string,
    otp: string
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

const updateUnreadCountCache = async (unreadCount?: number) => {
  if (typeof unreadCount === "number") {
    try {
      const { queryClient } = await import("../../../lib/query-client");
      const { NOTIFICATIONS_KEYS } = await import("../../notifications/hooks/notificationKeys");
      queryClient.setQueryData(NOTIFICATIONS_KEYS.unreadCount(), unreadCount);
    } catch (error) {
      console.error("Failed to update unread count cache:", error);
    }
  }
};

export const useAuthStore = create<AuthStateTypes>((set, get) => ({
  user: null,
  error: null,
  isLoading: true,
  isVerifying: false,
  checkingAuth: true,
  isRefreshing: false,

  register: async (username, email, password) => {
    const { data } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, {
        username,
        email,
        password,
      });
      set({ user: response.data.user });
      if (response.data.user) {
        updateUnreadCountCache(response.data.unreadCount);
      }
      return response.data.user || null;
    }, "Registration failed. Please try again.");
    return data || null;
  },

  login: async (identifier, password) => {
    const { success } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, {
        identifier,
        password,
      });
      set({ user: response.data.user });
      if (response.data.user) {
        updateUnreadCountCache(response.data.unreadCount);
      }
      return true;
    }, "Failed to login! Please try again.");
    return success;
  },

  logout: async () => {
    await runAsync(set, async () => {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    }, "Logout failed").finally(() => {
      set({
        user: null,
        isVerifying: false,
        isLoading: false,
        checkingAuth: false,
        error: null,
      });
    });
  },

  checkAuth: async (skipCache = false) => {
    const { user, checkingAuth, isRefreshing } = get();

    // Deduplicate calls to avoid thundering herd problem during rapid state updates
    if (isRefreshing) {
      return;
    }

    // Only show global loading during initial app load (no user yet)
    // Don't change checkingAuth if already false - prevents UI freezes on profile refresh
    const isInitialLoad = !user && checkingAuth;

    if (isInitialLoad) {
      set({ checkingAuth: true, isLoading: true });
    }
    set({ error: null, isRefreshing: true });

    try {
      const url = skipCache ? `${AUTH_ENDPOINTS.GET_PROFILE}?skipCache=true` : AUTH_ENDPOINTS.GET_PROFILE;
      const response = await axiosInstance.get<AuthResponse>(url);
      set({ user: response.data.user });

      // Update unread count if available
      updateUnreadCountCache(response.data.unreadCount);
    } catch {
      // 401 = guest user (normal)
      set({ user: null });

      // Ensure loading states are cleared if this was the initial load
      if (isInitialLoad) {
        set({ checkingAuth: false, isLoading: false });
      }
    } finally {
      // Clear refreshing flag
      set({ isRefreshing: false });

      // Only update checkingAuth if this was the initial load
      if (isInitialLoad) {
        set({ checkingAuth: false, isLoading: false });
      }
    }
  },

  refreshToken: async () => {
    // Background process - no UI loading state
    try {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.REFRESH_TOKEN);
      const { user, unreadCount } = response.data;
      if (user) {
        set({ user });
        updateUnreadCountCache(unreadCount);
      }
    } catch (error) {
      // fail silently in UI but throw for interceptor
      set({ user: null });
      throw error;
    }
  },

  googleAuth: async (code) => {
    const { data } = await runAsync(set, async () => {
      const response = await axiosInstance.get<AuthResponse>(`${AUTH_ENDPOINTS.GOOGLE}?code=${encodeURIComponent(code)}`);
      set({ user: response.data.user, checkingAuth: false });
      updateUnreadCountCache(response.data.unreadCount);
      return response.data.user || null;
    }, "Error while Google Register!", "isLoading", "error");
    return data || null;
  },

  loginWithDiscord: async (code) => {
    const { data } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(`${AUTH_ENDPOINTS.DISCORD}?code=${encodeURIComponent(code)}`);
      set({ user: response.data.user, checkingAuth: false });
      updateUnreadCountCache(response.data.unreadCount);
      // Return explicit null if user is undefined to match interface
      return response.data.user || null;
    }, "Error while Discord Register & login!");
    return data || null;
  },

  sendVerifyOtp: async () => {
    const { success, data, message } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.SEND_VERIFY_OTP);
      if (response.data.user) {
        set({ user: response.data.user });
      }
      return {
        success: true,
        message: response.data.message,
      };
    }, "Failed to send OTP", "isVerifying"); // Use isVerifying as loading key

    return success ? data : { success: false, message: message || "Failed to send OTP" };
  },

  verifyEmail: async (otp) => {
    const { success, data, message } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.VERIFY_ACCOUNT, {
        otp,
      });
      if (response.data.user) {
        set({ user: response.data.user });
      }
      return {
        success: true,
        message: response.data.message,
      };
    }, "Failed to verify account", "isVerifying");

    return success ? data : { success: false, message: message || "Failed to verify account" };
  },

  sendPassResetOtp: async (email) => {
    const { success, data, message } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.SEND_RESET_OTP, {
        email,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Something went wrong");
      }

      return {
        success: true,
        message: response.data.message,
      };
    }, "Failed to send password reset OTP");

    return success ? data : { success: false, message: message || "Failed to send password reset OTP" };
  },

  verifyPassResetOtp: async (email, otp) => {
    const { success, data, message } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.VERIFY_RESET_OTP, {
        email,
        otp,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Something went wrong");
      }

      return {
        success: true,
        message: response.data.message,
      };
    }, "Failed to verify reset code");

    return success ? data : { success: false, message: message || "Failed to verify reset code" };
  },

  resetPassword: async (email, otp, newPassword) => {
    const { success, data, message } = await runAsync(set, async () => {
      const response = await axiosInstance.post<AuthResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Something went wrong");
      }

      return {
        success: true,
        message: response.data.message,
      };
    }, "Failed to reset password! Try again");

    return success ? data : { success: false, message: message || "Failed to reset password! Try again" };
  },

  deleteAccount: async () => {
    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.delete<AuthResponse>(AUTH_ENDPOINTS.DELETE_ACCOUNT);
      if (data.success) {
        useAuthStore.setState({ user: null });
      }
      return data.success;
    }, "Failed to delete account");
    return success ? data : false;
  },

  updateProfile: async (formData: FormData) => {
    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.put<AuthResponse>(AUTH_ENDPOINTS.UPDATE_PROFILE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success && data.user) {
        useAuthStore.setState({ user: data.user });
      }
      return data.success;
    }, "Failed to update profile", "isLoading"); // Default is isLoading, but explicit is fine
    return success ? data : false;
  },

  updateSettings: async (settings) => {
    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.put<AuthResponse>(AUTH_ENDPOINTS.UPDATE_SETTINGS, settings);
      if (data.success && data.user) {
        set({ user: data.user });
      }
      return data.success;
    }, "Failed to update settings", "isLoading");
    return success ? data : false;
  },
}));
