import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

import { axiosInstance } from "@/lib/axios";
import { Team } from "@/features/teams/lib/types";
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
  hasMoreTeams: boolean;
  teamsCursor: string | null;
  teamsLimit: number;

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
  fetchRegisteredTeams: (eventId: string, params?: { append?: boolean, limit?: number }) => Promise<void>;
  resetRegisteredTeams: () => void;
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
  hasMoreTeams: true,
  teamsCursor: null,
  teamsLimit: 10,

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
  fetchRegisteredTeams: async (eventId, params = {}) => {
    const { append = false, limit: customLimit } = params;
    const { teamsCursor, teamsLimit, isTeamsLoading } = get();

    if (append && !get().hasMoreTeams) return;
    if (isTeamsLoading) return; // Prevent double fetch

    set({ isTeamsLoading: true, error: null });
    try {
      const response = await axiosInstance.get(
        EVENT_ENDPOINTS.REGISTERED_TEAMS(eventId),
        {
          params: {
            cursor: append ? teamsCursor : null,
            limit: customLimit || teamsLimit
          }
        }
      );

      const newTeams: Team[] = response.data.teams;
      const nextCursor = response.data.nextCursor;
      const hasMore = response.data.hasMore;

      set((state) => ({
        registerdTeams: append ? [...state.registerdTeams, ...newTeams] : newTeams,
        teamsCursor: nextCursor,
        hasMoreTeams: hasMore,
        isTeamsLoading: false
      }));
    } catch (err) {
      const message = handleApiError(err, "Failed to fetch registered teams");
      set({ isTeamsLoading: false, error: message });
    }
  },
  resetRegisteredTeams: () => {
    set({
      registerdTeams: [],
      teamsCursor: null,
      hasMoreTeams: true,
      isTeamsLoading: false
    });
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