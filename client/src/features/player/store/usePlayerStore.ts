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
  searchByUsername: (
    username: string,
    page: number,
    limit: number
  ) => Promise<User[] | null>;
  fetchAllPlayers: () => Promise<void>;
  fetchPlayerById: (id: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerStoreState>((set) => ({
  players: [],
  isLoading: false,
  error: null,
  hasMore: true,
  selectedPlayer: null,

  searchByUsername: async (
    username: string,
    page = 1,
    limit = 10
  ): Promise<User[] | null> => {
    if (!username.trim()) {
      set({ players: [], hasMore: false, isLoading: false, error: null });
      return [];
    }

    set((state) => ({
      ...state,
      isLoading: true,
      error: null,
      players: page === 1 ? [] : state.players,
    }));

    try {
      const response = await axiosInstance.get(`/players/search-users`, {
        params: { username, page, limit },
      });

      const fetchedUsers: User[] = response.data.players;
      const hasMore: boolean = response.data.hasMore;

      set((state) => ({
        ...state,
        players:
          page === 1
            ? fetchedUsers
            : [...(state.players || []), ...fetchedUsers],
        hasMore,
        isLoading: false,
        error: null,
      }));

      return fetchedUsers;
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error: error.response?.data.message || "Request failed",
          isLoading: false,
        });
        return [];
      }
      set({
        error: "An unknown error occurred.",
        isLoading: false,
      });
      return null;
    }
  },

  fetchAllPlayers: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data } = await axiosInstance.get("/players");

      set({
        players: data.players,
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

  fetchPlayerById: async (id: string) => {
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
}));
