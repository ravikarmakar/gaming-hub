import { create } from "zustand";
import axios from "axios";

import { axiosInstance } from "@/lib/axios";

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
  error: string | null;
  eventDetails: Event | null;

  createEvent: (eventData: FormData) => Promise<Event | null>;
  fetchEventsByOrgId: (orgId: string) => Promise<void>;
  fetchEventDetailsById: (eventId: string) => Promise<void>;
}

export const useEventStore = create<EventStateTypes>((set) => ({
  events: [],
  isLoading: false,
  error: null,
  orgEvents: [],
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
      const response = await axiosInstance.get(`/event-details/${eventId}`);
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
}));
