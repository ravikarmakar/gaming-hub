import { axiosInstance } from "@/lib/axios";
import Notification from "@/types";
import { create } from "zustand";

interface NotificationStore {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  fetchNotification: () => Promise<void>;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotification: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/notifications", {
        withCredentials: true,
      });
      set({ notifications: response.data.notifications, isLoading: false });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load notifications",
        notifications: [],
        isLoading: false,
      });
    }
  },
}));

export default useNotificationStore;
