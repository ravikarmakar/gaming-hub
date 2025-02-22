import { create } from "zustand";
import { User } from "../types/index";
import { FormDataType } from "@/pages/auth/SignUpPage";
import { formDataType } from "@/pages/auth/LoginPage";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  register: (userData: FormDataType) => Promise<void>;
  logIn: (userData: formDataType) => Promise<void>;
  logOut: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  register: async (formData: formDataType) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/register", formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        toast.success("Registration successful!");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
        toast.error(error.response?.data.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logIn: async (formData: formDataType) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { token, ...user } = response.data;

      if (!token) throw new Error("Token not received from server");

      localStorage.setItem("gamingHubToken", token);

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      set({ user, token, isAuthenticated: true });

      toast.success("Login successful!");
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
        toast.error(error.response?.data.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logOut: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      localStorage.removeItem("gamingHubToken");

      delete axiosInstance.defaults.headers.common["Authorization"];

      set({ user: null, token: null, isAuthenticated: false });

      toast.success("Logged out successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
        toast.error(error.response?.data.message);
      }
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("gamingHubToken");
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false });
      return;
    }

    try {
      const response = await axiosInstance.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.valid) {
        set({ token, user: response.data.user, isAuthenticated: true });

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
      } else {
        throw new Error("Invalid token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("gamingHubToken");
      delete axiosInstance.defaults.headers.common["Authorization"];
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  setToken: (token: string) => {
    try {
      const decoded = jwtDecode<User>(token);

      // ✅ Token ko localStorage me save karo
      localStorage.setItem("gamingHubToken", token);

      // ✅ Authorization header set karo
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      set({ user: decoded, token, isAuthenticated: true });
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("gamingHubToken");
      delete axiosInstance.defaults.headers.common["Authorization"];
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
