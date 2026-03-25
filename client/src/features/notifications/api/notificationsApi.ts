import { axiosInstance } from "@/lib/axios";
import { NotificationsResponse } from "../types";

export const notificationsApi = {
    getNotifications: async (page = 1, limit = 10): Promise<NotificationsResponse> => {
        const response = await axiosInstance.get(`/notifications?page=${page}&limit=${limit}`);
        return response.data;
    },

    getTeamNotifications: async (teamId: string, page = 1): Promise<NotificationsResponse> => {
        const response = await axiosInstance.get(`/notifications/team/${encodeURIComponent(teamId)}?page=${page}`);
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await axiosInstance.patch(`/notifications/${encodeURIComponent(id)}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await axiosInstance.patch("/notifications/read-all");
        return response.data;
    },

    performAction: async (id: string, actionType: string) => {
        const response = await axiosInstance.post(`/notifications/${encodeURIComponent(id)}/action`, { actionType });
        return response.data;
    },

};
