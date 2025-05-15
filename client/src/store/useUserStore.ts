import { axiosInstance } from "@/lib/axios";
import { create } from "zustand";
import "../lib/axiosInterceptor";

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserStateTypes {
  user: User | null;
  error: string | null;
  checkingAuth: boolean;
  isLoading: boolean;
  accessToken: string | null;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useUserStore = create<UserStateTypes>((set) => ({
  user: null,
  error: null,
  isLoading: false,
  checkingAuth: true,
  accessToken: null,

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
    } catch {
      set({ error: "Error while login", isLoading: false });
      return false;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null, accessToken: null });
    try {
      await axiosInstance.post("/auth/logout");
      set({ user: null, isLoading: false });
    } catch {
      set({ error: "Error while logot", isLoading: false });
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true, error: null });
    try {
      const response = await axiosInstance.get("/auth/get-profile");
      set({ user: response.data.user, checkingAuth: false });
    } catch {
      set({
        error: "Error while checking loggedin user or unauthorized (401)",
        checkingAuth: false,
        user: null,
      });
    }
  },
  refreshToken: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axiosInstance.post("/auth/refresh-token");
      const { user } = response.data;
      if (user) set({ user });

      set({ checkingAuth: false });
      return response.data;
    } catch (error) {
      set({ user: null, checkingAuth: false, error: "Session expired" });
      throw error;
    }
  },
}));
