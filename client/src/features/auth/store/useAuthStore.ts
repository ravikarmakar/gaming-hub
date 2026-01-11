import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import "../../../lib/axiosInterceptor";
import axios from "axios";

interface Roles {
  scope: "platform" | "org" | "team";
  role: string;
  scopeId: string;
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

export const useAuthStore = create<AuthStateTypes>((set) => ({
  user: null,
  error: null,
  isLoading: false,
  isVerifying: false,
  checkingAuth: true,
  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/register", {
        username,
        email,
        password,
      });
      set({ user: response.data.user, isLoading: false });
      return response.data.user;
    } catch {
      set({ error: "Error while register", isLoading: false });
      return null;
    }
  },
  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", {
        identifier,
        password,
      });
      set({ user: response.data.user, isLoading: false });
      return true;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to login! Tray again!"
        : "Something went wrong";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/auth/logout");
      set({
        user: null,
        isLoading: false,
        checkingAuth: false,
        isVerifying: false,
      });
    } catch {
      set({
        user: null,
        error: "Error while logot",
        isLoading: false,
        checkingAuth: false,
        isVerifying: false,
      });
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true, error: null, isLoading: true });
    try {
      const response = await axiosInstance.get("/auth/get-profile");
      set({ user: response.data.user });
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message ||
          "Something went wrong during authentication"
        : "Unexpected error occurred";

      set({ error: errMsg, user: null });
    } finally {
      console.log("SET FALSE form chekcing auth");
      set({ checkingAuth: false, isLoading: false });
    }
  },
  refreshToken: async () => {
    set({ checkingAuth: true, isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      const { user } = response.data;
      if (user) set({ user });
      return response.data;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to refresh session"
        : "Unexpected error occurred during token refresh";

      set({ user: null, error: errMsg });
    } finally {
      console.log("SET FALSE");
      set({ checkingAuth: false, isLoading: false });
    }
  },
  googleAuth: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/auth/google?code=${code}`);
      set({ user: response.data.user, isLoading: false });
      return response.data.user;
    } catch {
      set({ error: "Error while Google Register!", isLoading: false });
      return null;
    }
  },
  loginWithDiscord: async (code) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(`/auth/discord?code=${code}`);
      set({ user: response.data.user, isLoading: false });
      return response.data.user;
    } catch {
      set({ isLoading: false, error: "Error while Discord Register & login!" });
      return null;
    }
  },
  sendVerifyOtp: async () => {
    set({ isVerifying: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/send-verify-otp");
      set({ isVerifying: false });

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
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP"
        : "Something went wrong";

      set({ error: errMsg, isVerifying: false });
      return { success: false, message: errMsg };
    }
  },
  verifyEmail: async (otp) => {
    set({ isVerifying: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/verify-account", {
        otp,
      });
      set({ isVerifying: false });

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
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send OTP"
        : "Something went wrong";

      set({ error: errMsg, isVerifying: false });
      return { success: false, message: errMsg };
    }
  },
  sendPassResetOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/send-reset-otp", {
        email,
      });
      set({ isLoading: false });

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
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send passward reset OTP"
        : "Something went wrong";

      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },
  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      set({ isLoading: false });

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
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to reset passward! Try again"
        : "Something went wrong";

      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },
  resetLoadingStates: () =>
    set({ isLoading: false, checkingAuth: false, isVerifying: false }),
}));
