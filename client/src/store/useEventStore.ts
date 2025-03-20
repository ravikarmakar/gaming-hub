/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "@/lib/axios";
import { Event } from "@/types";
import toast from "react-hot-toast";
import { create } from "zustand";

export interface EventStore {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  selectedEvent: Event | null;
  searchQuery: string;
  isSearching: boolean;
  hasMore: boolean;
  cursor: string | null;
  limit: number;
  fetchEvents: (reset?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  loadMoreEvents: () => Promise<void>;
  getOneEvent: (id: string) => Promise<void>;
  regitserEvent: (id: string) => Promise<void>;
  cancelRegistration: (id: string) => void;
}

const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  cursor: null,
  error: null,
  hasMore: true,
  selectedEvent: null,
  isLoading: false,
  searchQuery: "",
  isSearching: false,
  limit: 6,

  setSearchQuery: (query) => {
    set({
      searchQuery: query,
      cursor: null,
      events: [],
      hasMore: true,
      isSearching: !!query,
    });
    get().fetchEvents(true);
  },

  fetchEvents: async (reset = false) => {
    set({ isLoading: true });

    try {
      const { searchQuery, cursor, events, limit } = get();
      const params: any = {
        cursor: reset ? null : cursor,
        limit,
        search: searchQuery || undefined,
      };

      const res = await axiosInstance.get("/events", { params });

      const existingEventIds = new Set(events.map((e) => e._id));
      const newEvents = res.data.events.filter(
        (event: Event) => !existingEventIds.has(event._id)
      );

      set({
        events: reset ? newEvents : [...events, ...newEvents],
        cursor: res.data.nextCursor || null,
        hasMore: res.data.hasMore,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      set({ isLoading: false, hasMore: false });
    }
  },

  loadMoreEvents: async () => {
    if (!get().hasMore || get().isLoading) return;

    await get().fetchEvents();
  },

  resetEvents: () => {
    set({
      events: [],
      cursor: null,
      hasMore: true,
      isLoading: false,
      searchQuery: "",
      isSearching: false,
    });
  },

  getOneEvent: async (id: string) => {
    try {
      const res = await axiosInstance.get(`/events/${id}`);
      set({ selectedEvent: res.data.events });
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  regitserEvent: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await axiosInstance.post(
        `/events/register/${id}`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      console.error("Error in registering event:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to register";
      toast.error(errorMessage);
      set({
        error: errorMessage,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelRegistration: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await axiosInstance.put(
        `/events/unregister/${id}`,
        {},
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      console.log("Error in unregister event", error);
      const errorMessage =
        error.response?.data?.message || "Failed to unregister";
      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useEventStore;
