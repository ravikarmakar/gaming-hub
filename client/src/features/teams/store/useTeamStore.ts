import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";

export interface TeamMembersTypes {
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
  teamMembers: TeamMembersTypes[];
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
  addMembers: (members: string[]) => Promise<Team | null>;
  getTeamById: (id: string) => Promise<Team | null>;
  updateMemberRole: (role: string, memberId: string) => Promise<Team | null>;
  removeMember: (id: string) => Promise<Team | null>;
  leaveMember: () => Promise<Team | null>;
  transferTeamOwnerShip?: () => void;
  deleteTeam?: () => void;

  fetchAllTeams: () => Promise<void>;
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
  addMembers: async (members) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put("/teams/add-members", {
        members,
      });
      const updatedTeam = response.data.team;

      set(() => ({
        currentTeam: updatedTeam,
        isLoading: false,
      }));

      return updatedTeam;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error adding team members"
        : "Error adding team members";
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  removeMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/teams/remove-member/${id}`);
      const updatedTeam = response.data.team;

      set({
        currentTeam: updatedTeam,
        isLoading: false,
      });

      return updatedTeam;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error removing team member"
        : "Error removing team member";

      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  updateMemberRole: async (role, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`/teams/manage-member-role`, {
        role,
        memberId,
      });
      const updatedTeam = response.data.team;

      set({
        currentTeam: updatedTeam,
        isLoading: false,
      });

      return updatedTeam;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error upading team member role"
        : "Error upading team member role";

      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  leaveMember: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put("/teams/leave-member");
      const updatedTeam = response.data.team;

      set({
        currentTeam: updatedTeam,
        isLoading: false,
      });

      return updatedTeam;
    } catch (error) {
      const errMsg = axios.isAxiosError(error)
        ? error.response?.data.message || "Error while leaving team"
        : "Error while leaving team";

      set({ error: errMsg, isLoading: false });
      return null;
    }
  },
  transferTeamOwnerShip: () => {},
  deleteTeam: () => {},

  //
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
}));
