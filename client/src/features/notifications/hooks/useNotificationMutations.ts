import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notificationsApi";
import { NOTIFICATIONS_KEYS } from "./notificationKeys";
import toast from "react-hot-toast";

export const useMarkAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationsApi.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to mark as read");
        }
    });
};

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
            queryClient.setQueryData(NOTIFICATIONS_KEYS.unreadCount(), 0);
            toast.success("All notifications marked as read");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to mark all as read");
        }
    });
};

export const usePerformActionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, actionType }: { id: string, actionType: string }) => 
            notificationsApi.performAction(id, actionType),
        onSuccess: async (_, { actionType }) => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });

            if (actionType === "ACCEPT") {
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["teams"] });
                queryClient.invalidateQueries({ queryKey: ["organizers"] });
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Action failed");
        }
    });
};
