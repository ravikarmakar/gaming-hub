/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "@/lib/axios";
import { Event } from "@/types";
import { create } from "zustand";

export interface EventStore {
  events: Event[];
  isLoading: boolean;
  selectedEvent: Event | null;
  searchQuery: string;
  isSearching: boolean;
  fetchEvents: (reset?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  loadMoreEvents: () => Promise<void>;
  getOneEvent: (id: string) => Promise<void>;
  hasMore: boolean;
  cursor: string | null;
  limit: number;
}

const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  cursor: null,
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
      set({ selectedEvent: res.data });
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },
}));

export default useEventStore;
