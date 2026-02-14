import { useEffect, useRef } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useNotificationStore } from "@/features/notifications/store/useNotificationStore";

export const useNotificationManager = () => {
    const { user } = useAuthStore();
    const { fetchNotifications, unreadCount } = useNotificationStore();
    const hasFetched = useRef(false);

    useEffect(() => {
        // Reset fetch state when user changes (login/logout)
        if (!user) {
            hasFetched.current = false;
            return;
        }

        const platformNotificationsEnabled = user.settings?.notifications?.platform !== false;

        if (user && !hasFetched.current) {
            if (platformNotificationsEnabled) {
                // Always fetch on mount if enabled, regardless of unreadCount (which starts at 0)
                fetchNotifications();
            }
            hasFetched.current = true;
        }
    }, [user, fetchNotifications]);

    return {
        unreadCount,
    };
};
