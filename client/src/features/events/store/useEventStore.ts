import { create } from "zustand";
import axios from "axios";

import { axiosInstance } from "@/lib/axios";
import { Team } from "@/features/teams/store/useTeamStore";

type Status =
  | "registration-open"
  | "registration-closed"
  | "live"
  | "completed";

export interface Event {
  _id: string;
  title: string;
  game: string;
  startDate: string;
  eventEndAt: string;
  registrationEndsAt: string;
  slots: number;
  category: string;
  prizePool: number;
  image: string;
  description: string;
  trending: boolean;
  status: Status;
  likes: number;
  views: number;
  orgId?: string;
  teamId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EventStateTypes {
  events: Event[];
  orgEvents: Event[];
  isLoading: boolean;
  isTeamsLoading: boolean;
  error: string | null;
  eventDetails: Event | null;
  registerdTeams: Team[];

  createEvent: (eventData: FormData) => Promise<Event | null>;
  fetchEventsByOrgId: (orgId: string) => Promise<void>;
  fetchEventDetailsById: (eventId: string) => Promise<void>;
  fetchAllEvents: () => Promise<void>;
  regitserEvent: (
    eventId: string
  ) => Promise<{ success: boolean; message?: string }>;
  isTeamRegistered: (eventId: string, teamId: string) => Promise<boolean>;
  fetchRegisteredTeams: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventStateTypes>((set) => ({
  events: [],
  orgEvents: [],
  registerdTeams: [],
  isLoading: false,
  isTeamsLoading: false,
  error: null,
  eventDetails: null,

  createEvent: async (eventData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.post(
        "/events/create-event",
        eventData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      set({ isLoading: false });
      const newEvent: Event = response.data;

      return newEvent;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? "Failed to create event"
        : err instanceof Error
        ? err.message
        : "Failed to create event";

      set({ isLoading: false, error: message });
      console.error("Error creating event:", err);
      return null;
    }
  },
  fetchEventsByOrgId: async (orgId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get(`/events/org-events/${orgId}`);
      const orgEvents: Event[] = response.data.data;

      set({ orgEvents, isLoading: false });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ??
          "Failed to fetch org events"
        : err instanceof Error
        ? err.message
        : "Failed to fetch org events";

      set({ isLoading: false, error: message });
      console.error("Error fetching events:", err);
    }
  },
  fetchEventDetailsById: async (eventId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `events/event-details/${eventId}`
      );
      const eventDetails: Event = response.data.data;

      set({ eventDetails, isLoading: false });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? "Failed to fetch event"
        : err instanceof Error
        ? err.message
        : "Failed to fetch event";

      set({ isLoading: false, error: message });
      console.error("Error fetching event details:", err);
    }
  },
  fetchAllEvents: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await axiosInstance.get("/events/all-events");
      const events: Event[] = response.data.data;

      set({ events, isLoading: false });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ?? "Failed to fetch events"
        : err instanceof Error
        ? err.message
        : "Failed to fetch events";

      set({ isLoading: false, error: message });
      console.error("Error fetching events:", err);
    }
  },
  regitserEvent: async (eventId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        `/events/register-event/${eventId}`,
        {}
      );
      set({ isLoading: false });

      return { success: true, message: response.data.message };
    } catch (error) {
      set({
        isLoading: false,
        error: axios.isAxiosError(error)
          ? error.message
          : "Failed to register event",
      });
      console.error("Error registering event:", error);
      return { success: false, message: "Failed to register event" };
    }
  },
  isTeamRegistered: async (eventId, teamId) => {
    try {
      const response = await axiosInstance.get(
        `events/is-registered/${eventId}/teams/${teamId}`
      );
      set({ isLoading: false });
      return response.data.registered;
    } catch (error) {
      set({
        isLoading: false,
        error: axios.isAxiosError(error)
          ? error.message
          : "Failed to check team registration",
      });
      console.error("Error checking team registration:", error);
      return false;
    }
  },
  fetchRegisteredTeams: async (eventId) => {
    set({ isTeamsLoading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `/events/registered-teams/${eventId}`
      );
      const registerdTeams: Team[] = response.data.teams;

      set({ registerdTeams, isTeamsLoading: false });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string) ??
          "Failed to fetch registered teams"
        : err instanceof Error
        ? err.message
        : "Failed to fetch registered teams";

      set({ isTeamsLoading: false, error: message });
      console.error("Error fetching registered teams:", err);
    }
  },
}));
