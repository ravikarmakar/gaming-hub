import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";

export interface Member {
  _id: string;
  username: string;
  email: string;
  role: string;
  avatar: string;
}

export interface Organizer {
  _id?: string;
  ownerId: string;
  name: string;
  imageUrl: string;
  description: string;
  email: string;
  members: Member[];
  isVerified: boolean;
  tag: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerStateType {
  organizers: Organizer[] | null;
  orgData: Organizer | null;
  isLoading: boolean;
  error: string | null;
  createOrg: (orgData: FormData) => Promise<boolean>;
  getOrgById: (orgId: string) => Promise<Organizer | null>;
  addStaffs: (data: { staff: string[] }) => Promise<boolean>;
  removeStaff: (id: string) => Promise<boolean>;
  updateStaffRole: (id: string, role: string) => Promise<boolean>;
  // fetchAllOrganizers: () => Promise<void>;
}

export const useOrganizerStore = create<OrganizerStateType>((set) => ({
  organizers: null,
  orgData: null,
  isLoading: false,
  error: null,

  createOrg: async (orgData) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/organizers/create-org", orgData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error creating organizer"
        : "Error creating organizer";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },
  getOrgById: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/organizers/details/${orgId}`);
      set({ orgData: response.data.org, isLoading: false });
      return response.data.org;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error fetching organizer"
        : "Error fetching organizer";
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  addStaffs: async (staff) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.put("/organizers/add-staff", staff);
      set({ isLoading: false });
      return true;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error adding staff"
        : "Error adding staff";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },
  updateStaffRole: async (id, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put("/organizers/update-staff-role", {
        userId: id,
        newRole: role,
      });
      if (res.status === 200 && res.data.success) {
        set({ isLoading: false });
        return true;
      }
      set({
        error: res.data.message || "Failed to update role",
        isLoading: false,
      });
      return false;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error updating role"
        : "Error updating role";

      set({ error: errMsg, isLoading: false });
      return false;
    }
  },
  removeStaff: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.delete(`/organizers/remove-staff/${id}`);
      if (res.status === 200 && res.data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ isLoading: false });
        return false;
      }
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error removeing staff"
        : "Error removeing staff";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },
  // fetchAllOrganizers: () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const response = axiosInstance.get("/organizers");
  //     set({ organizers: response?.data?.org, isLoading: false });
  //     return response.data.org;
  //   } catch (error) {
  //     const errMsg = axios.isAxiosError(error)
  //       ? error.response?.data.message || "Error fetching organizers"
  //       : "Error fetching organizers";
  //     set({ error: errMsg, isLoading: false });
  //   }
  // },
}));
