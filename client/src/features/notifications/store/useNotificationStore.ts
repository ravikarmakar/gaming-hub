import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";

export interface NotificationAction {
    label: string;
    actionType: "ACCEPT" | "REJECT" | "VIEW";
    payload: any;
}

export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        username: string;
        avatar: string;
    } | null;
    type: "TEAM_INVITE" | "TEAM_JOIN_REQUEST" | "TEAM_LEAVE" | "TEAM_KICK" | "EVENT_REMINDER" | "EVENT_REGISTRATION" | "ORGANIZATION_INVITE" | "SYSTEM" | "ROUND_CREATED" | "GROUP_CREATED";
    content: {
        title: string;
        message: string;
    };
    status: "unread" | "read" | "archived";
    relatedData?: {
        teamId?: any;
        eventId?: any;
        orgId?: any;
        groupId?: any;
        inviteId?: string;
    };
    actions: NotificationAction[];
    createdAt: string;
    updatedAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
    };
    fetchNotifications: (page?: number) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    setUnreadCount: (count: number) => void;
    performAction: (id: string, actionType: string) => Promise<void>;
    fetchTeamNotifications: (teamId: string, page?: number) => Promise<void>;
    clearError: () => void;
}

const getErrorMessage = (error: unknown, defaultMsg: string) => {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || defaultMsg;
    }
    return (error as Error).message || defaultMsg;
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    },

    clearError: () => set({ error: null }),

    setUnreadCount: (count) => set({ unreadCount: count }),

    fetchNotifications: async (page = 1) => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/notifications?page=${page}`);
            const newNotifications: Notification[] = response.data.notifications;

            set({
                notifications: newNotifications,
                unreadCount: response.data.pagination.unreadCount,
                pagination: {
                    currentPage: response.data.pagination.currentPage,
                    totalPages: response.data.pagination.totalPages,
                    totalCount: response.data.pagination.totalCount,
                },
                isLoading: false,
            });

            // Trigger team refetch if any team-related notifications are received 
            // and they are new (unread or recently created)
            const hasTeamUpdate = newNotifications.some(n =>
                ["TEAM_LEAVE", "TEAM_KICK", "TEAM_JOIN_SUCCESS", "TEAM_JOIN_REQUEST"].includes(n.type) &&
                n.status === "unread"
            );

            if (hasTeamUpdate) {
                const { useTeamManagementStore } = await import("@/features/teams/store/useTeamManagementStore");
                const teamId = useTeamManagementStore.getState().currentTeam?._id;
                if (teamId) {
                    await useTeamManagementStore.getState().getTeamById(teamId, true);
                }
            }
        } catch (error) {
            set({
                error: getErrorMessage(error, "Failed to fetch notifications"),
                isLoading: false,
            });
        }
    },

    markAsRead: async (id) => {
        try {
            await axiosInstance.patch(`/notifications/${id}/read`);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, status: "read" } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (error) {
            set({ error: getErrorMessage(error, "Failed to mark notification as read") });
        }
    },

    markAllAsRead: async () => {
        try {
            await axiosInstance.patch("/notifications/read-all");
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, status: "read" })),
                unreadCount: 0,
            }));
        } catch (error) {
            set({ error: getErrorMessage(error, "Failed to mark all notifications as read") });
        }
    },

    performAction: async (id, actionType) => {
        set({ isLoading: true, error: null });
        try {
            await axiosInstance.post(`/notifications/${id}/action`, { actionType });

            // Refresh notifications if it was unread to get updated count
            const notification = get().notifications.find(n => n._id === id);

            // Handle immediate UI updates for team/org invites
            if (actionType === "ACCEPT" && notification) {
                if (notification.type === "TEAM_INVITE") {
                    const { useAuthStore } = await import("@/features/auth/store/useAuthStore");
                    const { useTeamManagementStore } = await import("@/features/teams/store/useTeamManagementStore");

                    // Sync user roles and teamId
                    await useAuthStore.getState().checkAuth();

                    // Fetch team details immediately to update dashboard
                    // relatedData.teamId may be a populated object {_id, teamName, ...} or a raw string
                    const rawTeamId = notification.relatedData?.teamId;
                    const teamId = rawTeamId?._id ? String(rawTeamId._id) : rawTeamId ? String(rawTeamId) : null;
                    if (teamId) {
                        await useTeamManagementStore.getState().getTeamById(teamId, true, true);
                    }
                } else if (notification.type === "ORGANIZATION_INVITE") {
                    const { useAuthStore } = await import("@/features/auth/store/useAuthStore");

                    await useAuthStore.getState().checkAuth();

                    const rawOrgId = notification.relatedData?.orgId;
                    const orgId = rawOrgId?._id ? String(rawOrgId._id) : rawOrgId ? String(rawOrgId) : null;
                    if (orgId) {
                        await import("@/features/organizer/api/organizerApi").then(api => api.organizerApi.getOrgById(orgId));
                    }
                }
            }

            // Update the notification in the list
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n._id === id ? { ...n, status: "archived" } : n
                ),
                isLoading: false,
            }));
            if (notification?.status === "unread") {
                set(state => ({ unreadCount: Math.max(0, state.unreadCount - 1) }));
            }
        } catch (error) {
            set({
                error: getErrorMessage(error, "Failed to perform notification action"),
                isLoading: false,
            });
        }
    },

    fetchTeamNotifications: async (teamId, page = 1) => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.get(`/notifications/team/${teamId}?page=${page}`);
            const newNotifications: Notification[] = response.data.notifications;

            set({
                notifications: newNotifications,
                unreadCount: response.data.pagination.unreadCount,
                pagination: {
                    currentPage: response.data.pagination.currentPage,
                    totalPages: response.data.pagination.totalPages,
                    totalCount: response.data.pagination.totalCount,
                },
                isLoading: false,
            });
        } catch (error) {
            set({
                error: getErrorMessage(error, "Failed to fetch team notifications"),
                isLoading: false,
            });
        }
    },
}));
