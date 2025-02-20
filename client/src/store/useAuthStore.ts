import { create } from "zustand";
import { User } from "../types/index";
import { FormDataType } from "@/pages/auth/SignUpPage";
import { formDataType } from "@/pages/auth/LoginPage";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

interface AuthStoreState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  checkingAuth: boolean;
  checkAuth: () => Promise<void>;
  register: (userData: FormDataType) => Promise<void>;
  logIn: (userData: formDataType) => Promise<void>;
  logOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  isLoading: false,
  checkingAuth: false,
  error: null,

  register: async (formData: formDataType) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/register", formData, {
        headers: { "Content-Type": "application/json" },
      });
      set({ user: response.data });

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
      set({ user: response.data });
      if (response.status === 200) {
        toast.success("Login successful!");
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
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null });
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
        toast.error(error.response?.data.message);
      }
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axiosInstance.get("/auth/profile", {
        withCredentials: true,
      });
      if (response?.data) {
        set({ user: response.data });
      } else {
        set({ user: null });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        set({ error: error.response?.data.message });
      } else {
        console.error("Unknown error:", error);
      }
    } finally {
      set({ checkingAuth: false });
    }
  },
}));
