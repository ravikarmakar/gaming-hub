import { axiosInstance } from "@/lib/axios";
import { ORGANIZER_ENDPOINTS, PLAYER_ENDPOINTS } from "../lib/endpoints";
import { Organizer, DashboardStats, Invite, JoinRequest } from "../types";
import { User } from "@/features/auth/lib/types";
import { Notification } from "@/features/notifications/store/useNotificationStore";


import { ApiListResponse, ApiSingleResponse } from "@/lib/api-types";

export const organizerApi = {
    // GET APIs
    fetchOrganizers: async (page = 1, limit = 20, search = ""): Promise<ApiListResponse<Organizer>> => {
        const response = await axiosInstance.get(ORGANIZER_ENDPOINTS.LIST_ORGANIZERS, {
            params: { page, limit, search }
        });
        return response.data;
    },

    getOrgById: async (id: string, page = 1, limit = 20, search = ""): Promise<ApiSingleResponse<Organizer>> => {
        const response = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_ORG_DETAILS(id), {
            params: { page, limit, search }
        });
        return response.data;
    },

    getDashboardStats: async (orgId: string): Promise<DashboardStats> => {
        const response = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_DASHBOARD_STATS, {
            params: { orgId }
        });
        return response.data.data;
    },

    searchAvailableUsers: async (query: string, page = 1, limit = 20): Promise<User[]> => {
        const response = await axiosInstance.get(PLAYER_ENDPOINTS.SEARCH, {
            params: { username: query, hasOrg: false, page, limit },
        });
        return response.data.players || [];
    },

    fetchJoinRequests: async (orgId: string, page = 1, limit = 20): Promise<ApiListResponse<JoinRequest>> => {
        const response = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_JOIN_REQUESTS(orgId), {
            params: { page, limit }
        });
        return response.data;
    },

    fetchPendingInvites: async (orgId: string): Promise<Invite[]> => {
        const response = await axiosInstance.get(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites`);
        return response.data.data;
    },

    fetchNotifications: async (orgId: string): Promise<Notification[]> => {
        const response = await axiosInstance.get(ORGANIZER_ENDPOINTS.GET_NOTIFICATIONS(orgId));
        return response.data.notifications;
    },

    // POST, PATCH, PUT, DELETE APIs
    createOrg: async (data: FormData): Promise<Organizer> => {
        const response = await axiosInstance.post(ORGANIZER_ENDPOINTS.CREATE_ORG, data);
        return response.data.data;
    },

    updateOrg: async ({ orgId, data }: { orgId: string, data: FormData | Partial<Organizer> }): Promise<Organizer> => {
        const headers = data instanceof FormData ? { "Content-Type": "multipart/form-data" } : {};
        const response = await axiosInstance.put(ORGANIZER_ENDPOINTS.UPDATE_ORG(orgId), data, { headers });
        return response.data.data;
    },

    deleteOrg: async (orgId: string): Promise<boolean> => {
        const response = await axiosInstance.delete(ORGANIZER_ENDPOINTS.DELETE_ORG(orgId));
        return response.data.success;
    },

    leaveOrg: async (orgId: string): Promise<boolean> => {
        const response = await axiosInstance.delete(ORGANIZER_ENDPOINTS.LEAVE_ORG(orgId));
        return response.data.success;
    },

    addStaffs: async ({ orgId, data }: { orgId: string, data: { staff: string[] } }): Promise<boolean> => {
        const response = await axiosInstance.put(ORGANIZER_ENDPOINTS.ADD_STAFF(orgId), data);
        return response.data.success;
    },

    updateStaffRole: async ({ orgId, userId, role }: { orgId: string, userId: string, role: string }): Promise<Organizer> => {
        const response = await axiosInstance.put(ORGANIZER_ENDPOINTS.UPDATE_STAFF_ROLE(orgId), { userId, newRole: role });
        return response.data.data;
    },

    transferOwnership: async ({ orgId, userId }: { orgId: string, userId: string }): Promise<boolean> => {
        const response = await axiosInstance.put(ORGANIZER_ENDPOINTS.TRANSFER_OWNERSHIP(orgId), { newOwnerId: userId });
        return response.data.success;
    },

    removeStaff: async ({ orgId, id }: { orgId: string, id: string }): Promise<Organizer> => {
        const response = await axiosInstance.delete(ORGANIZER_ENDPOINTS.REMOVE_STAFF(orgId, id));
        return response.data.data;
    },

    joinOrg: async ({ orgId, message }: { orgId: string, message?: string }): Promise<boolean> => {
        const response = await axiosInstance.post(ORGANIZER_ENDPOINTS.JOIN_ORG(orgId), { message });
        return response.data.success;
    },

    manageJoinRequest: async ({ orgId, requestId, action }: { orgId: string, requestId: string, action: "accepted" | "rejected" }): Promise<boolean> => {
        const response = await axiosInstance.put(ORGANIZER_ENDPOINTS.MANAGE_JOIN_REQUEST(orgId, requestId), { action });
        return response.data.success;
    },

    inviteStaff: async ({ orgId, userId, role, message }: { orgId: string, userId: string, role: string, message?: string }): Promise<boolean> => {
        const response = await axiosInstance.post(`/invitations/invite-member`, {
            playerId: userId,
            role,
            message,
            targetId: orgId,
            targetModel: "Organizer"
        });
        return response.data.success;
    },

    cancelInvite: async ({ orgId, inviteId }: { orgId: string, inviteId: string }): Promise<boolean> => {
        const response = await axiosInstance.delete(`${ORGANIZER_ENDPOINTS.GET_CURRENT_ORG}/${orgId}/invites/${inviteId}`);
        return response.data.success;
    },

    markNotificationAsRead: async (notificationId: string): Promise<boolean> => {
        const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
        return response.data.success;
    },
};
