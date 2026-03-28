import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";
import { NOTIFICATIONS_KEYS } from "./notificationKeys";
import { NotificationsResponse } from "../types";

export const useNotificationsQuery = (page = 1) => {
    return useQuery({
        queryKey: NOTIFICATIONS_KEYS.list(page),
        queryFn: () => notificationsApi.getNotifications(page),
        staleTime: 30000,
    });
};

export const useInfiniteNotificationsQuery = () => {
    return useInfiniteQuery({
        queryKey: [...NOTIFICATIONS_KEYS.all, "infinite"],
        queryFn: ({ pageParam = 1 }) => notificationsApi.getNotifications(pageParam as number),
        getNextPageParam: (lastPage: NotificationsResponse) => {
            if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
                return lastPage.pagination.currentPage + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
};

export const useTeamNotificationsQuery = (teamId: string, page = 1, options = {}) => {
    return useQuery({
        queryKey: NOTIFICATIONS_KEYS.teamList(teamId, page),
        queryFn: () => notificationsApi.getTeamNotifications(teamId, page),
        enabled: !!teamId,
        ...options,
    });
};

export const useUnreadCountQuery = () => {
    return useQuery({
        queryKey: NOTIFICATIONS_KEYS.unreadCount(),
        queryFn: async () => {
            const data = await notificationsApi.getNotifications(1, 1);
            return data?.pagination?.unreadCount || 0;
        },
        enabled: false, // Don't fetch automatically - updated via Socket and Profile Refresh
        initialData: 0,
        staleTime: Infinity,
    });
};
