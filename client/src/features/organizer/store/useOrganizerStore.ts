import { create } from "zustand";


import { axiosInstance } from "@/lib/axios";
import { User } from "@/features/auth/lib/types";
import { ORGANIZER_ENDPOINTS, PLAYER_ENDPOINTS } from "../lib/endpoints";
import { Notification } from "@/features/notifications/store/useNotificationStore";
import { Organizer, DashboardStats, Pagination, Invite } from "../lib/types";
import { runAsync } from "@/lib/store-utils";

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

interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

interface ApiSingleResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination; // Sometimes single response includes pagination for sub-resources i.e members
}

interface SearchResponse {
  players: User[];
  pagination: Pagination;
}

export interface OrganizerStateType {
  organizers: Organizer[] | null;
  currentOrg: Organizer | null;
  isLoading: boolean;
  error: string | null;
  isCreateOrgOpen: boolean;
  availableUsers: User[];
  dashboardData: DashboardStats | null;
  joinRequests: JoinRequest[] | null;
  notifications: Notification[] | null;

  // Pagination State
  memberPagination: Pagination | null;
  joinRequestPagination: Pagination | null;
  organizersPagination: Pagination | null;

  // Actions
  setIsCreateOrgOpen: (open: boolean) => void;
  clearAvailableUsers: () => void;
  clearError: () => void;

  // API Calls
  createOrg: (orgData: FormData) => Promise<boolean>;
  fetchOrganizers: (page?: number, limit?: number, search?: string, append?: boolean) => Promise<void>;
  getOrgById: (orgId: string, page?: number, limit?: number, search?: string) => Promise<Organizer | null>;
  updateOrg: (data: FormData | Partial<Organizer>) => Promise<boolean>;
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
  fetchJoinRequests: (orgId: string, page?: number, limit?: number) => Promise<void>;
  manageJoinRequest: (orgId: string, requestId: string, action: "accepted" | "rejected") => Promise<boolean>;

  // Invites
  inviteStaff: (orgId: string, userId: string, role: string, message?: string) => Promise<boolean>;
  fetchPendingInvites: (orgId: string) => Promise<void>;
  cancelInvite: (orgId: string, inviteId: string) => Promise<boolean>;
  pendingInvites: Invite[] | null;

  // Notifications
  fetchNotifications: (orgId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

export const useOrganizerStore = create<OrganizerStateType>((set, get) => ({
  organizers: null,
  currentOrg: null,
  isLoading: false,
  error: null,
  isCreateOrgOpen: false,
  availableUsers: [],
  dashboardData: null,
  joinRequests: null,
  pendingInvites: [],
  notifications: [],
  memberPagination: null,
  joinRequestPagination: null,
  organizersPagination: null,

  setIsCreateOrgOpen: (open) => set({ isCreateOrgOpen: open }),
  clearAvailableUsers: () => set({ availableUsers: [] }),
  clearError: () => set({ error: null }),

  createOrg: async (orgData) => {
    const { success } = await runAsync(set, async () => {
      await axiosInstance.post(ORGANIZER_ENDPOINTS.CREATE_ORG, orgData);
    }, "Error creating organizer");
    return success;
  },

  fetchOrganizers: async (page = 1, limit = 20, search = "", append = false) => {
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<ApiListResponse<Organizer>>(ORGANIZER_ENDPOINTS.LIST_ORGANIZERS, {
        params: { page, limit, search }
      });
      set((state) => ({
        organizers: append && state.organizers
          ? [...state.organizers, ...data.data]
          : data.data,
        organizersPagination: data.pagination
      }));
    }, "Error fetching organizers");
  },

  getOrgById: async (orgId: string, page = 1, limit = 20, search = "") => {
    const { data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.get<ApiSingleResponse<Organizer>>(ORGANIZER_ENDPOINTS.GET_ORG_DETAILS(orgId), {
        params: { page, limit, search }
      });
      set({
        currentOrg: data.data,
        memberPagination: data.pagination || null
      });
      return data.data;
    }, "Error fetching organizer");
    return data || null;
  },

  updateOrg: async (updateData) => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success, data } = await runAsync(set, async () => {
      const headers = updateData instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
      const { data } = await axiosInstance.put<{ success: boolean; data: Organizer }>(
        ORGANIZER_ENDPOINTS.UPDATE_ORG(orgId),
        updateData,
        { headers }
      );
      if (data.success) {
        set({ currentOrg: data.data });
      }
      return data.success;
    }, "Error updating organizer");

    return success && data;
  },

  deleteOrg: async () => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.delete<{ success: boolean }>(ORGANIZER_ENDPOINTS.DELETE_ORG(orgId));
      if (data.success) {
        set({ currentOrg: null, dashboardData: null });
      }
      return data.success;
    }, "Error deleting organizer");

    return success && data;
  },

  addStaffs: async (staffData) => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success } = await runAsync(set, async () => {
      await axiosInstance.put(ORGANIZER_ENDPOINTS.ADD_STAFF(orgId), staffData);
      return true;
    }, "Error adding staff");

    return success;
  },

  updateStaffRole: async (userId, role) => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success } = await runAsync(set, async () => {
      const { data } = await axiosInstance.put<{ success: boolean; data: Organizer; message?: string }>(
        ORGANIZER_ENDPOINTS.UPDATE_STAFF_ROLE(orgId),
        { userId, newRole: role }
      );
      if (data.success) {
        set({ currentOrg: data.data });
        return true;
      }
      throw new Error(data.message || "Failed to update role");
    }, "Error updating role");

    return success;
  },

  transferOwnership: async (userId) => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.put<{ success: boolean; data: Organizer }>(
        ORGANIZER_ENDPOINTS.TRANSFER_OWNERSHIP(orgId),
        { newOwnerId: userId }
      );
      if (data.success) {
        set({ currentOrg: data.data });
        return true;
      }
      return false;
    }, "Error transferring ownership");

    return success && data;
  },

  removeStaff: async (id) => {
    const orgId = get().currentOrg?._id;
    if (!orgId) {
      set({ error: "No organization selected", isLoading: false });
      return false;
    }

    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.delete<{ success: boolean; data: Organizer }>(
        ORGANIZER_ENDPOINTS.REMOVE_STAFF(orgId, id)
      );
      if (data.success) {
        set({ currentOrg: data.data });
      }
      return data.success;
    }, "Error removing staff");

    return success && data;
  },

  searchAvailableUsers: async (query, page = 1, limit = 20) => {
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<SearchResponse>(PLAYER_ENDPOINTS.SEARCH, {
        params: { username: query, hasOrg: false, page, limit },
      });
      set((state) => ({
        availableUsers: page === 1 ? (data.players || []) : [...state.availableUsers, ...(data.players || [])],
      }));
    }, "Error searching users").catch(() => {
      set({ availableUsers: [] });
    });
  },

  getDashboardStats: async () => {
    const orgId = get().currentOrg?._id;
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<{ success: boolean; data: DashboardStats }>(
        ORGANIZER_ENDPOINTS.GET_DASHBOARD_STATS, {
        params: { orgId }
      });
      set({
        dashboardData: data.data,
        currentOrg: data.data.org
      });
    }, "Error fetching dashboard stats");
  },

  joinOrg: async (orgId, message) => {
    const { success } = await runAsync(set, async () => {
      await axiosInstance.post<{ success: boolean }>(
        ORGANIZER_ENDPOINTS.JOIN_ORG(orgId),
        { message }
      );
      return true;
    }, "Error sending join request");
    return success;
  },

  fetchJoinRequests: async (orgId, page = 1, limit = 20) => {
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<ApiListResponse<JoinRequest>>(
        ORGANIZER_ENDPOINTS.GET_JOIN_REQUESTS(orgId),
        { params: { page, limit } }
      );
      set({
        joinRequests: data.data,
        joinRequestPagination: data.pagination
      });
    }, "Error fetching join requests");
  },

  manageJoinRequest: async (orgId, requestId, action) => {
    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.put<{ success: boolean }>(
        ORGANIZER_ENDPOINTS.MANAGE_JOIN_REQUEST(orgId, requestId),
        { action }
      );
      if (data.success) {
        // Optimistic update
        const currentRequests = get().joinRequests;
        if (currentRequests) {
          set({
            joinRequests: currentRequests.filter(req => req._id !== requestId)
          });
        }
      }
      return data.success;
    }, `Error ${action === 'accepted' ? 'accepting' : 'rejecting'} request`);

    return success && data;
  },

  inviteStaff: async (orgId, userId, role, message) => {
    const { success } = await runAsync(set, async () => {
      await axiosInstance.post<{ success: boolean }>(`/invitations/invite-member`, {
        playerId: userId,
        role,
        message,
        targetId: orgId,
        targetModel: "Organizer"
      });
      return true;
    }, "Error sending invite");
    return success;
  },

  fetchPendingInvites: async (orgId) => {
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<{ success: boolean; data: Invite[] }>(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites`);
      set({ pendingInvites: data.data });
    }, "Error fetching pending invites");
  },

  cancelInvite: async (orgId, inviteId) => {
    const { success, data } = await runAsync(set, async () => {
      const { data } = await axiosInstance.delete<{ success: boolean }>(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites/${inviteId}`);
      if (data.success) {
        const currentInvites = get().pendingInvites;
        if (currentInvites) {
          set({ pendingInvites: currentInvites.filter(i => i._id !== inviteId) });
        }
      }
      return data.success;
    }, "Error cancelling invite");
    return success && data;
  },

  fetchNotifications: async (orgId: string) => {
    await runAsync(set, async () => {
      const { data } = await axiosInstance.get<{ notifications: Notification[] }>(ORGANIZER_ENDPOINTS.GET_NOTIFICATIONS(orgId));
      set({ notifications: data.notifications });
    }, "Error fetching notifications");
  },

  markNotificationAsRead: async (notificationId) => {
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
      console.error("Error marking notification as read:", error);
    }
  },
}));
