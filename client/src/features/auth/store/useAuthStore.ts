import { create } from "zustand";
import axios from "axios";

import { axiosInstance } from "@/lib/axios";
import "../../../lib/axiosInterceptor";
import { AUTH_ENDPOINTS } from "../api/endpoints";

export interface Roles {
  scope: "platform" | "org" | "team";
  role: string;
  scopeId: string;
  scopeModel: string;
}

type EsportsRole = "player" | "sniper" | "support" | "igl" | "coach" | "rusher";

export interface User {
  _id?: string;
  username: string;
  email: string;
  avatar: string;
  roles: Roles[];
  orgId: string;
  teamId: string;
  esportsRole: EsportsRole;
  canCreateOrg: boolean;
  isAccountVerified: boolean;
  verifyOtp: string;
  verifyOtpExpireAt: number;
  resetOtp: string;
  resetOtpExpireAt: number;
  createdAt: string;
  updatedAt: string;
  bio?: string;
}

interface AuthStateTypes {
  user: User | null;
  error: string | null;
  checkingAuth: boolean;
  isLoading: boolean;
  isVerifying: boolean;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  googleAuth: (code: string) => Promise<User | null>;
  loginWithDiscord: (code: string) => Promise<User | null>;
  sendVerifyOtp: () => Promise<{ success: boolean; message: string }>;
  verifyEmail: (otp: string) => Promise<{ success: boolean; message: string }>;
  sendPassResetOtp: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;
  resetPassword: (
    email: string,
    otp: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
}

const getErrorMessage = (error: unknown, defaultMsg: string): string => {
  return axios.isAxiosError(error)
    ? error.response?.data?.message || defaultMsg
    : "Network error. Please check your connection.";
};

export const useAuthStore = create<AuthStateTypes>((set, get) => ({
  user: null,
  error: null,
  isLoading: true,
  isVerifying: false,
  checkingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.REGISTER, {
        username,
        email,
        password,
      });
      set({ user: response.data.user });
      return response.data.user;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Registration failed. Please try again.");
      set({ error: errMsg });
      return null;
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.LOGIN, {
        identifier,
        password,
      });
      set({ user: response.data.user });
      return true;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to login! Please try again.");
      set({ error: errMsg });
      return false;
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Silently fail on logout errors (state will be cleared anyway)
      console.error("Logout failed:", error);
    } finally {
      set({
        user: null,
        isVerifying: false,
        isLoading: false,
        checkingAuth: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const { user, checkingAuth } = get();

    // Only show global loading during initial app load (no user yet)
    // Don't change checkingAuth if already false - prevents UI freezes on profile refresh
    const isInitialLoad = !user && checkingAuth;

    if (isInitialLoad) {
      set({ checkingAuth: true, isLoading: true });
    }
    set({ error: null });

    try {
      const response = await axiosInstance.get(AUTH_ENDPOINTS.GET_PROFILE);
      set({ user: response.data.user });
    } catch {
      // 401 = guest user (normal)
      set({ user: null });
    } finally {
      // Only update checkingAuth if this was the initial load
      if (isInitialLoad) {
        set({ checkingAuth: false, isLoading: false });
      }
    }
  },

  refreshToken: async () => {
    // Background process - no UI loading state
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.REFRESH_TOKEN);
      const { user } = response.data;
      if (user) set({ user });
      return response.data;
    } catch (error) {
      // fail silently in UI but throw for interceptor
      set({ user: null });
      throw error;
    }
  },

  googleAuth: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`${AUTH_ENDPOINTS.GOOGLE}?code=${code}`);
      set({ user: response.data.user });
      return response.data.user;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error while Google Register!");
      set({ error: errMsg });
      return null;
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },

  loginWithDiscord: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`${AUTH_ENDPOINTS.DISCORD}?code=${code}`);
      set({ user: response.data.user });
      return response.data.user;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error while Discord Register & login!");
      set({ error: errMsg });
      return null;
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },

  sendVerifyOtp: async () => {
    set({ isVerifying: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.SEND_VERIFY_OTP);

      if (response.data.user) {
        set({ user: response.data.user });
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to send OTP");
      set({ error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isVerifying: false });
    }
  },

  verifyEmail: async (otp) => {
    set({ isVerifying: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.VERIFY_ACCOUNT, {
        otp,
      });

      if (response.data.user) {
        set({ user: response.data.user });
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to verify account");
      set({ error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isVerifying: false });
    }
  },

  sendPassResetOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.SEND_RESET_OTP, {
        email,
      });

      if (!response.data.success) {
        const errorMsg = response.data.message || "Something went wrong";
        set({ error: errorMsg });
        return { success: false, message: errorMsg };
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to send password reset OTP");
      set({ error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
        email,
        otp,
        newPassword,
      });

      if (!response.data.success) {
        const errorMsg = response.data.message || "Something went wrong";
        set({ error: errorMsg });
        return { success: false, message: errorMsg };
      }

      return {
        success: true,
        message: response.data.message,
      };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to reset password! Try again");
      set({ error: errMsg });
      return { success: false, message: errMsg };
    } finally {
      set({ isLoading: false, checkingAuth: false });
    }
  },
}));
