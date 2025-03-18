/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import { Team } from "@/types/team";
import { create } from "zustand";

interface TeamState {
  teams: Team[];
  isLoading: boolean;
  error: null | string;
  seletedTeam: Team | null;
  createTeam: (teamName: string) => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchOneTeam: (id: string) => Promise<void>;

  // Team Mng
  inviteMember: (playerId: string) => Promise<void>;
  responseToInvite: (action: string) => void;
  teamJoinRequest: (teamId: string) => void;
  respondToJoinRequest: (action: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  isLoading: false,
  error: null,
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
      const response = await axiosInstance.get(`/teams/${id}/profile`, {
        withCredentials: true,
      });

      set({ seletedTeam: response.data.team });
    } catch (error) {
      console.log("Error to Fetching Single team details", error);
    } finally {
      set({ isLoading: false });
    }
  },

  inviteMember: async (playerId) => {
    try {
      set({ isLoading: true, error: null });

      const res = await axiosInstance.post(
        "invitations/invite-member",
        { playerId },
        { withCredentials: true }
      );

      if (res.status === 201) {
        toast.success(res.data.message);
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error("Invite Member Error:", error);

      toast.error(error.response?.data?.message || "Failed to send invite.");

      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  responseToInvite: async (action) => {
    try {
      set({ isLoading: true, error: null });

      const res = await axiosInstance.put(
        "/invitations/response-invite",
        { action },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      console.error("Error in responding to invite:", error);

      const errorMessage =
        error?.response?.data?.message || `Failed to ${action} invite.`;

      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  teamJoinRequest: async (teamId) => {
    set({ isLoading: true, error: null });

    try {
      const res = await axiosInstance.post(
        "/join-requests",
        { teamId },
        {
          withCredentials: true,
        }
      );

      if (res.status === 201) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      console.error("Error in sending join request:", error);

      const errorMessage =
        error?.response?.data?.message || `Failed to send join request.`;

      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  respondToJoinRequest: async (action) => {
    try {
      set({ isLoading: true, error: null });

      const res = await axiosInstance.put(
        "join-requests/respond",
        { action },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(res.data.message);
      }
    } catch (error: any) {
      console.error("Error in responding to join request:", error);

      const errorMessage =
        error?.response?.data?.message || `Failed to ${action} join request.`;

      toast.error(errorMessage);
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },
}));
