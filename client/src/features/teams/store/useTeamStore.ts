import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { TOURNAMENT_ENDPOINTS } from "@/features/tournaments/lib/endpoints";

interface TeamState {
  teamTournaments: any[];
  isLoading: boolean;
  error: string | null;
  isCreateTeamOpen: boolean;

  // Actions
  setIsCreateTeamOpen: (isOpen: boolean) => void;
  fetchTeamTournaments: (teamId: string) => Promise<void>;
  clearError: () => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teamTournaments: [],
  isLoading: false,
  error: null,
  isCreateTeamOpen: false,

  setIsCreateTeamOpen: (isOpen) => set({ isCreateTeamOpen: isOpen }),

  clearError: () => set({ error: null }),

  fetchTeamTournaments: async (teamId) => {
    if (!teamId) return;
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.TEAM_TOURNAMENTS(teamId));
      set({ teamTournaments: response.data.data || [], isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error, "Error fetching team tournaments") });
    }
  },
}));
