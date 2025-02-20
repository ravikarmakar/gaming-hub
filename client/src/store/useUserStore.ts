import { axiosInstance } from "@/lib/axios";
import { User } from "@/types";
import { create } from "zustand";

interface UserStoreTypes {
  payers: User[];
  selectedUser: User | null;

  getAllUsers: () => Promise<void>;
  getOneUser: (id: string) => Promise<User>;
  clearSelectedUser: () => void;
}

const useUserStore = create<UserStoreTypes>((set) => ({
  payers: [],
  selectedUser: null,

  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get("/users");
      set({ payers: response.data.users });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  },

  getOneUser: async (id) => {
    try {
      const res = await axiosInstance.get(`/users/${id}`);

      set({ selectedUser: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  clearSelectedUser: () => set({ selectedUser: null }),
}));

export default useUserStore;
