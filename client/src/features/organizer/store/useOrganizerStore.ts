import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";
import { User } from "@/features/auth/store/useAuthStore";
import { ORGANIZER_ENDPOINTS, PLAYER_ENDPOINTS } from "../lib/endpoints";
import { Notification } from "@/features/notifications/store/useNotificationStore";

export interface JoinRequest {
  _id: string;
  requester: {
    _id: string;
    username: string;
    avatar: string;
    email: string;
  };
  target: string;
  targetModel: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  createdAt: string;
}

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
  bannerUrl: string;
  description: string;
  email: string;
  members: Member[];
  isVerified: boolean;
  isHiring: boolean;
  tag: string;
  socialLinks?: {
    discord?: string;
    twitter?: string;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrganizerStateType {
  organizers: Organizer[] | null;
  currentOrg: Organizer | null;
  isLoading: boolean;
  error: string | null;
  isCreateOrgOpen: boolean;
  availableUsers: User[];
  dashboardData: any | null;
  joinRequests: JoinRequest[] | null;
  notifications: Notification[] | null;

  // Actions
  setIsCreateOrgOpen: (open: boolean) => void;
  clearAvailableUsers: () => void;

  // API Calls
  createOrg: (orgData: FormData) => Promise<boolean>;
  getOrgById: (orgId: string) => Promise<Organizer | null>;
  updateOrg: (data: any) => Promise<boolean>;
  deleteOrg: () => Promise<boolean>;

  // Staff Management
  addStaffs: (data: { staff: string[] }) => Promise<boolean>;
  removeStaff: (id: string) => Promise<boolean>;
  updateStaffRole: (id: string, role: string) => Promise<boolean>;
  transferOwnership: (userId: string) => Promise<boolean>;

  // Search & Stats
  searchAvailableUsers: (query: string, page?: number, limit?: number) => Promise<void>;
  getDashboardStats: () => Promise<void>;

  // Join Requests
  joinOrg: (orgId: string, message?: string) => Promise<boolean>;
  fetchJoinRequests: (orgId: string) => Promise<void>;
  manageJoinRequest: (orgId: string, requestId: string, action: "accepted" | "rejected") => Promise<boolean>;

  // Invites
  inviteStaff: (orgId: string, userId: string, role: string, message?: string) => Promise<boolean>;
  fetchPendingInvites: (orgId: string) => Promise<void>;
  cancelInvite: (orgId: string, inviteId: string) => Promise<boolean>;
  pendingInvites: any[] | null;

  // Notifications
  fetchNotifications: (orgId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const getErrorMessage = (error: any, defaultMsg: string) => {
  return axios.isAxiosError(error)
    ? error.response?.data.message || defaultMsg
    : defaultMsg;
};

export const useOrganizerStore = create<OrganizerStateType>((set, get) => ({
  organizers: null,
  currentOrg: null,
  isLoading: false,
  error: null,
  isCreateOrgOpen: false,
  availableUsers: [],
  dashboardData: null,
  joinRequests: null,
  pendingInvites: null,
  notifications: null,

  setIsCreateOrgOpen: (open) => set({ isCreateOrgOpen: open }),
  clearAvailableUsers: () => set({ availableUsers: [] }),

  createOrg: async (orgData) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post(ORGANIZER_ENDPOINTS.CREATE_ORG, orgData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error creating organizer"), isLoading: false });
      return false;
    }
  },

  getOrgById: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_ORG_DETAILS(orgId));
      set({ currentOrg: data.org, isLoading: false });
      return data.org;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error fetching organizer"), isLoading: false });
      return null;
    }
  },

  updateOrg: async (updateData) => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      const headers = updateData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
      const { data } = await axiosInstance.put(ORGANIZER_ENDPOINTS.UPDATE_ORG(orgId), updateData, { headers });

      if (data.success) {
        set({ currentOrg: data.org, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error updating organizer"), isLoading: false });
      return false;
    }
  },

  deleteOrg: async () => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      const { data } = await axiosInstance.delete(ORGANIZER_ENDPOINTS.DELETE_ORG(orgId));
      if (data.success) {
        set({ currentOrg: null, dashboardData: null, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error deleting organizer"), isLoading: false });
      return false;
    }
  },

  addStaffs: async (staffData) => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      await axiosInstance.put(ORGANIZER_ENDPOINTS.ADD_STAFF(orgId), staffData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error adding staff"), isLoading: false });
      return false;
    }
  },

  updateStaffRole: async (userId, role) => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      const { data } = await axiosInstance.put(ORGANIZER_ENDPOINTS.UPDATE_STAFF_ROLE(orgId), { userId, newRole: role });
      if (data.success) {
        set({ currentOrg: data.org, isLoading: false });
        return true;
      }
      set({ error: data.message || "Failed to update role", isLoading: false });
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error updating role"), isLoading: false });
      return false;
    }
  },

  transferOwnership: async (userId) => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      const { data } = await axiosInstance.put(ORGANIZER_ENDPOINTS.TRANSFER_OWNERSHIP(orgId), { newOwnerId: userId });
      if (data.success) {
        set({ currentOrg: data.org, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error transferring ownership"), isLoading: false });
      return false;
    }
  },

  removeStaff: async (id) => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    try {
      const { data } = await axiosInstance.delete(ORGANIZER_ENDPOINTS.REMOVE_STAFF(orgId, id));
      if (data.success) {
        set({ currentOrg: data.org, isLoading: false });
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error removing staff"), isLoading: false });
      return false;
    }
  },

  searchAvailableUsers: async (query, page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get(PLAYER_ENDPOINTS.SEARCH, {
        params: { username: query, hasOrg: false, page, limit },
      });
      set((state) => ({
        availableUsers: page === 1 ? data.players : [...state.availableUsers, ...data.players],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: getErrorMessage(error, "Error searching users"), isLoading: false });
    }
  },

  getDashboardStats: async () => {
    set({ isLoading: true, error: null });
    const orgId = get().currentOrg?._id;
    // We don't error out here if no orgId, because backend might find it from user context.
    // But sending it is safer.

    try {
      const { data } = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_DASHBOARD_STATS, {
        params: { orgId }
      });
      set({
        dashboardData: data,
        currentOrg: data.org,
        isLoading: false
      });
    } catch (error) {
      set({ error: getErrorMessage(error, "Error fetching dashboard stats"), isLoading: false });
    }
  },

  joinOrg: async (orgId, message) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.post(ORGANIZER_ENDPOINTS.JOIN_ORG(orgId), { message });
      set({ isLoading: false });
      return data.success;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error sending join request"), isLoading: false });
      return false;
    }
  },

  fetchJoinRequests: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_JOIN_REQUESTS(orgId));
      set({ joinRequests: data.requests, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Error fetching join requests"), isLoading: false });
    }
  },

  manageJoinRequest: async (orgId, requestId, action) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.put(ORGANIZER_ENDPOINTS.MANAGE_JOIN_REQUEST(orgId, requestId), { action });
      if (data.success) {
        // Optimistic update or refresh
        const currentRequests = get().joinRequests;
        if (currentRequests) {
          set({
            joinRequests: currentRequests.filter(req => req._id !== requestId),
            isLoading: false
          });
        } else {
          set({ isLoading: false });
        }
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, `Error ${action === 'accepted' ? 'accepting' : 'rejecting'} request`), isLoading: false });
      return false;
    }
  },

  inviteStaff: async (orgId, userId, role, message) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.post(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invite`, { userId, role, message });
      set({ isLoading: false });
      return data.success;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error sending invite"), isLoading: false });
      return false;
    }
  },

  fetchPendingInvites: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites`);
      set({ pendingInvites: data.invites, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Error fetching pending invites"), isLoading: false });
    }
  },

  cancelInvite: async (orgId, inviteId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.delete(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites/${inviteId}`);
      if (data.success) {
        const currentInvites = get().pendingInvites;
        if (currentInvites) {
          set({ pendingInvites: currentInvites.filter(i => i._id !== inviteId), isLoading: false });
        } else {
          set({ isLoading: false });
        }
        return true;
      }
      return false;
    } catch (error) {
      set({ error: getErrorMessage(error, "Error cancelling invite"), isLoading: false });
      return false;
    }
  },

  fetchNotifications: async (orgId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_NOTIFICATIONS(orgId));
      set({ notifications: data.notifications, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error, "Error fetching notifications"), isLoading: false });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/notifications/${notificationId}/read`);
      const { notifications } = get();
      if (notifications) {
        set({
          notifications: notifications.map((n) =>
            n._id === notificationId ? { ...n, status: "read" } : n
          ),
        });
      }
    } catch (error) {
      set({ error: getErrorMessage(error, "Error marking notification as read") });
    }
  },
}));
