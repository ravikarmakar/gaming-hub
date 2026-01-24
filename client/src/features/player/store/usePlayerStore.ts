/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { User } from "@/features/auth/store/useAuthStore";

interface PlayerStoreState {
  players: User[] | null;
  selectedPlayer: User | null;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  searchByUsername: (
    username: string,
    page: number,
    limit: number
  ) => Promise<User[] | null>;
  fetchAllPlayers: () => Promise<void>;
  fetchPlayerById: (id: string, forceRefresh?: boolean) => Promise<User | null>;
  clearPlayers: () => void;
}

// AbortController to cancel ongoing requests
let searchAbortController: AbortController | null = null;

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  players: [],
  isLoading: false,
  error: null,
  hasMore: true,
  selectedPlayer: null,
  totalCount: 0,

  searchByUsername: async (
    username: string,
    page = 1,
    limit = 10
  ): Promise<User[] | null> => {
    // Cancel any ongoing search request
    if (searchAbortController) {
      searchAbortController.abort();
    }

    // Early return for empty search
    if (!username.trim()) {
      set({ players: [], hasMore: false, isLoading: false, error: null, totalCount: 0 });
      return [];
    }

    // Minimum character validation (matches backend requirement)
    if (username.trim().length < 2) {
      set({
        players: [],
        hasMore: false,
        isLoading: false,
        error: "Please enter at least 2 characters to search",
        totalCount: 0
      });
      return [];
    }

    // Create new abort controller for this request
    searchAbortController = new AbortController();

    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
      players: page === 1 ? [] : state.players,
    }));

    try {
      const response = await axiosInstance.get(`/players/search-users`, {
        params: { username, page, limit },
        signal: searchAbortController.signal, // Add abort signal
      });

      const fetchedUsers: User[] = response.data.players || [];
      const hasMore: boolean = response.data.hasMore || false;
      const totalCount: number = response.data.total || 0;

      set((state) => ({
        ...state,
        players:
          page === 1
            ? fetchedUsers
            : [...(state.players || []), ...fetchedUsers],
        hasMore,
        totalCount,
        isLoading: false,
        error: null,
      }));

      // Clear the abort controller after successful request
      searchAbortController = null;

      return fetchedUsers;
    } catch (error) {
      // Don't update state if request was aborted (user is typing)
      if (error instanceof AxiosError) {
        if (error.code === 'ERR_CANCELED') {
          return null; // Request was cancelled, don't update state
        }

        set({
          error: error.response?.data.message || "Search failed. Please try again.",
          isLoading: false,
          hasMore: false,
        });
        return [];
      }

      set({
        error: "An unknown error occurred. Please try again.",
        isLoading: false,
        hasMore: false,
      });
      return null;
    }
  },

  fetchAllPlayers: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosInstance.get("/players");

      set({
        players: data.players || [],
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch players",
      });
    }
  },

  fetchPlayerById: async (id: string, forceRefresh = false) => {
    // Check if player is already in store and matches requested id
    const state = get();
    if (!forceRefresh && state.selectedPlayer && state.selectedPlayer._id === id) {
      return state.selectedPlayer;
    }

    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosInstance.get(`/players/${id}`);

      set({ selectedPlayer: data.player, isLoading: false, error: null });

      return data.player;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch player",
      });
      return null;
    }
  },

  // Utility function to clear players state
  clearPlayers: () => {
    // Cancel any ongoing requests
    if (searchAbortController) {
      searchAbortController.abort();
      searchAbortController = null;
    }
    set({
      players: [],
      hasMore: true,
      error: null,
      totalCount: 0,
      isLoading: false
    });
  },
}));
