import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { Team } from "@/features/teams/store/useTeamStore";
import { EVENT_ENDPOINTS } from "../lib/endpoints";
import { handleApiError } from "@/lib/api-helper";
import { Event } from "../lib/types";

interface EventStateTypes {
  events: Event[];
  orgEvents: Event[];
  isLoading: boolean;
  isTeamsLoading: boolean;
  error: string | null;
  eventDetails: Event | null;
  selectedEvent: Event | null; // Alias for eventDetails
  registerdTeams: Team[];

  // Pagination & Search
  searchQuery: string;
  isSearching: boolean;
  hasMore: boolean;
  cursor: string | null;
  limit: number;

  createEvent: (eventData: FormData) => Promise<Event | null>;
  fetchEventsByOrgId: (orgId: string) => Promise<void>;
  fetchEventDetailsById: (eventId: string) => Promise<void>;
  getOneEvent: (id: string) => Promise<void>; // Alias for fetchEventDetailsById
  fetchAllEvents: () => Promise<void>;

  // Paginated Fetch
  fetchEvents: (params?: {
    search?: string;
    game?: string;
    category?: string;
    status?: string;
    cursor?: string | null;
    limit?: number;
    append?: boolean;
  }) => Promise<void>;
  resetEvents: () => void;
  clearEvents: () => void;

  registerEvent: (
    eventId: string
  ) => Promise<{ success: boolean; message?: string }>;
  isTeamRegistered: (eventId: string, teamId: string) => Promise<{ registered: boolean; status: "approved" | "pending" | "none" }>;
  fetchRegisteredTeams: (eventId: string) => Promise<void>;
  updateEvent: (eventId: string, eventData: FormData) => Promise<Event | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  cancelRegistration: (id: string) => Promise<void>;
}

let abortController: AbortController | null = null;

export const useEventStore = create<EventStateTypes>((set, get) => ({
  events: [],
  orgEvents: [],
  registerdTeams: [],
  isLoading: false,
  isTeamsLoading: false,
  error: null,
  eventDetails: null,
  selectedEvent: null,

  // Pagination & Search state
  searchQuery: "",
  isSearching: false,
  hasMore: true,
  cursor: null,
  limit: 6,

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        EVENT_ENDPOINTS.CREATE,
        eventData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const newEvent = response.data.data;
      set((state) => ({
        events: [newEvent, ...state.events],
        orgEvents: [newEvent, ...state.orgEvents],
        isLoading: false
      }));
      return newEvent;
    } catch (err) {
      const message = handleApiError(err, "Failed to create event");
      set({ isLoading: false, error: message });
      return null;
    }
  },
  fetchEventsByOrgId: async (orgId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(EVENT_ENDPOINTS.ORG_EVENTS(orgId));
      set({ orgEvents: response.data.data, isLoading: false });
    } catch (err) {
      const message = handleApiError(err, "Failed to fetch org events");
      set({ isLoading: false, error: message });
    }
  },
  fetchEventDetailsById: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(EVENT_ENDPOINTS.DETAILS(eventId));
      const details = response.data.data;
      set({ eventDetails: details, selectedEvent: details, isLoading: false });
    } catch (err) {
      const message = handleApiError(err, "Failed to fetch event details");
      set({ isLoading: false, error: message });
    }
  },
  getOneEvent: async (id) => {
    return get().fetchEventDetailsById(id);
  },
  fetchAllEvents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(EVENT_ENDPOINTS.ALL);
      set({ events: response.data.data, isLoading: false });
    } catch (err) {
      const message = handleApiError(err, "Failed to fetch events");
      set({ isLoading: false, error: message });
    }
  },

  fetchEvents: async (params = {}) => {
    const {
      append = false,
      search,
      game,
      category,
      status,
      cursor: customCursor,
      limit: customLimit
    } = params;

    // Abort previous request if it exists
    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    set({ isLoading: true, error: null });

    try {
      const { cursor, limit } = get();
      const queryParams: any = {
        cursor: append ? cursor : customCursor || null,
        limit: customLimit || limit,
        search: search || undefined,
        game: game || undefined,
        category: category || undefined,
        status: status || undefined,
      };

      const res = await axiosInstance.get(EVENT_ENDPOINTS.ALL, {
        params: queryParams,
        signal: abortController.signal
      });

      const newEventsData = res.data.data || [];

      set((state) => ({
        events: append ? [...state.events, ...newEventsData] : newEventsData,
        cursor: res.data.nextCursor || null,
        hasMore: res.data.hasMore !== undefined ? res.data.hasMore : false,
        isLoading: false,
      }));
    } catch (error) {
      if (axios.isCancel(error)) return;
      const message = handleApiError(error, "Failed to fetch events");
      set({ isLoading: false, error: message, hasMore: false });
    } finally {
      abortController = null;
    }
  },

  loadMoreEvents: async () => {
    if (!get().hasMore || get().isLoading) return;
    await get().fetchEvents({ append: true });
  },

  resetEvents: () => {
    set({
      events: [],
      cursor: null,
      hasMore: true,
      isLoading: false,
    });
  },

  clearEvents: () => {
    set({
      events: [],
      cursor: null,
      hasMore: true,
      isLoading: false,
      error: null
    });
  },

  registerEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        EVENT_ENDPOINTS.REGISTER(eventId),
        {}
      );
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "Failed to register event";
      set({ isLoading: false, error: message });
      console.error("Error registering event:", error);
      return { success: false, message };
    }
  },
  isTeamRegistered: async (eventId, teamId) => {
    try {
      const response = await axiosInstance.get(
        EVENT_ENDPOINTS.IS_REGISTERED(eventId, teamId)
      );
      return {
        registered: response.data.registered,
        status: response.data.status || (response.data.registered ? "approved" : "none")
      };
    } catch (error) {
      console.error("Error checking team registration:", error);
      return { registered: false, status: "none" };
    }
  },
  fetchRegisteredTeams: async (eventId) => {
    set({ isTeamsLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        EVENT_ENDPOINTS.REGISTERED_TEAMS(eventId)
      );
      const registerdTeams: Team[] = response.data.teams;
      set({ registerdTeams, isTeamsLoading: false });
    } catch (err) {
      const message = handleApiError(err, "Failed to fetch registered teams");
      set({ isTeamsLoading: false, error: message });
    }
  },
  updateEvent: async (eventId, eventData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(EVENT_ENDPOINTS.UPDATE(eventId), eventData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedEvent: Event = response.data.data;
      set((state) => ({
        isLoading: false,
        events: state.events.map((e) => (e._id === eventId ? updatedEvent : e)),
        orgEvents: state.orgEvents.map((e) => (e._id === eventId ? updatedEvent : e)),
        eventDetails: state.eventDetails?._id === eventId ? updatedEvent : state.eventDetails,
        selectedEvent: state.selectedEvent?._id === eventId ? updatedEvent : state.selectedEvent,
      }));
      return updatedEvent;
    } catch (err) {
      const message = handleApiError(err, "Failed to update event");
      set({ isLoading: false, error: message });
      return null;
    }
  },
  deleteEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.delete(EVENT_ENDPOINTS.DELETE(eventId));
      set((state) => ({
        isLoading: false,
        events: state.events.filter((e) => e._id !== eventId),
        orgEvents: state.orgEvents.filter((e) => e._id !== eventId),
        eventDetails: state.eventDetails?._id === eventId ? null : state.eventDetails,
        selectedEvent: state.selectedEvent?._id === eventId ? null : state.selectedEvent,
      }));
      return true;
    } catch (err) {
      const message = handleApiError(err, "Failed to delete event");
      set({ isLoading: false, error: message });
      return false;
    }
  },
  cancelRegistration: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.put(
        EVENT_ENDPOINTS.UNREGISTER(id),
        {},
        { withCredentials: true }
      );
      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to unregister";
      set({ error: message });
      toast.error(message);
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useEventStore;