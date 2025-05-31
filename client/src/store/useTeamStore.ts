import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import toast from "react-hot-toast";
import { create } from "zustand";

interface Members {
  _id: string;
  username: string;
  avatar: string;
  user: string;
  roleInTeam: "rusher" | "sniper" | "support" | "igl" | "player";
}

export interface Team {
  _id: string;
  teamName: string;
  slug: string;
  captain: string;
  teamMembers: Members[];
  description: string;
  imageUrl: string;
  bio: string;
  isVerified: boolean;
  totalWins: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamStateTypes {
  teams: Team[];
  isLoading: boolean;
  error: null | string;
  currentTeam: Team | null;
  createTeam: (teamData: FormData) => Promise<Team | null>;
  getTeamById: (id: string) => Promise<Team | null>;
  fetchAllTeams: () => Promise<void>;

  // Team Mng
  inviteMember: (playerId: string) => Promise<void>;
  responseToInvite: (action: string) => void;
  teamJoinRequest: (teamId: string) => void;
  respondToJoinRequest: (action: string) => void;
}

export const useTeamStore = create<TeamStateTypes>((set) => ({
  teams: [],
  isLoading: false,
  error: null,
  currentTeam: null,
  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/teams/create-team", teamData);
      set({ currentTeam: response.data.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error creating new team"
        : "Error creating new team";
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  getTeamById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(`/teams/details/${id}`);
      set({ currentTeam: response?.data?.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error fetching team details"
        : "Error fetching team details";
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  fetchAllTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get("/teams");
      set({ teams: response.data.teams, isLoading: false });
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error fetching all teams"
        : "Error fetching all teams";
      set({ error: errMsg, isLoading: false });
    }
  },
  //
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
