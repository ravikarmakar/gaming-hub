import { useQueryClient } from "@tanstack/react-query";
import { useSocketEvent } from "@/hooks/useSocket";
import { useUnreadCountQuery } from "@/features/notifications/hooks/useNotificationQueries";
import { NOTIFICATIONS_KEYS } from "./notificationKeys";

export const useNotificationManager = () => {
    const queryClient = useQueryClient();
    const { data: unreadCount = 0 } = useUnreadCountQuery();

    // Listen for real-time notification updates
    useSocketEvent("notification:new", () => {
        // Invalidate all notification related queries to get fresh data
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
    });

    useSocketEvent("notification:updated", () => {
        queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
    });

    // useNotificationManager facilitates real-time unread count updates
    // across the application via WebSocket events and the TanStack Query cache.

    return {
        unreadCount,
    };
};
