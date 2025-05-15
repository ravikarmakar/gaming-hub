import { create } from "zustand";
import { User } from "../types/index";
import { FormDataType } from "@/pages/auth/SignUpPage";
import { LoginFormDataType } from "@/pages/auth/LoginPage";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface AuthStoreState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  register: (userData: FormDataType) => Promise<void>;
  logIn: (userData: LoginFormDataType) => Promise<void>;
  logOut: () => Promise<void>;
}

const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (formData: FormDataType) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/register", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
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

  logIn: async (formData: LoginFormDataType) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 200) {
        toast.success("Login successful!");
        await useAuthStore.getState().checkAuth();
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

  logOut: async () => {
    set({ isLoading: true, error: null });

    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });

      set({
        user: null,
        isAuthenticated: false,
      });

      toast.success("Logged out successfully!");
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
        toast.error(error.response?.data.message);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/auth/profile", {
        withCredentials: true,
      });

      if (response.status === 200) {
        set({
          user: response.data.user,
          isAuthenticated: true,
        });
      } else {
        throw new Error("User Not Authenticated");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
