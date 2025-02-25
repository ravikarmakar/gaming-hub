import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Team } from "@/types/team";
import { create } from "zustand";

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  seletedTeam: Team | null;
  createTeam: (teamName: string) => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchOneTeam: (id: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  isLoading: false,
  seletedTeam: null,

  createTeam: async (teamName: string) => {
    set({ isLoading: true });

    try {
      const response = await axiosInstance.post(
        "/teams",
        { teamName },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        toast.success("Team created successfully!");
      }
    } catch (error) {
      console.log("Error creating team:", error);
      toast.error("Failed to create team");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/teams", {
        withCredentials: true,
      });

      set({ teams: response.data.teams });
    } catch (error) {
      console.log("Error fetching team:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchOneTeam: async (id) => {
    set({ isLoading: true });

    try {
      const response = await axiosInstance.get(`/teams/${id}`, {
        withCredentials: true,
      });

      set({ seletedTeam: response.data.team });
    } catch (error) {
      console.log("Error to Fetching Single team details", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
