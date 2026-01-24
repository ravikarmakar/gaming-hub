import { axiosInstance } from "@/lib/axios";
import axios from "axios";
import { create } from "zustand";
import { teamEndpoints } from "../api/endpoints";

export interface TeamMembersTypes {
  _id: string;
  username: string;
  avatar: string;
  user: string;
  roleInTeam: "igl" | "rusher" | "sniper" | "support" | "player" | "coach" | "analyst" | "substitute";
  joinedAt: string;
  isActive: boolean;
}

export interface Team {
  _id: string;
  teamName: string;
  slug: string;
  tag: string;
  captain: string;
  teamMembers: TeamMembersTypes[];
  imageUrl: string | null;
  bannerUrl: string | null;
  bio: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    youtube?: string;
    instagram?: string;
  };
  playedTournaments: {
    event: string;
    placement?: number;
    prizeWon: number;
    playedAt: string;
    status: "upcoming" | "ongoing" | "completed" | "eliminated";
  }[];
  stats: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    tournamentWins: number;
    totalPrizeWon: number;
    winRate: number;
  };
  isVerified: boolean;
  isRecruiting: boolean;
  region: "NA" | "EU" | "ASIA" | "SEA" | "SA" | "OCE" | "MENA" | "INDIA" | null;
  game?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamStateTypes {
  teams: Team[];
  paginatedTeams: Team[];
  pagination: {
    totalCount: number;
    currentPage: number;
    limit: number;
    hasMore: boolean;
  };
  isLoading: boolean;
  error: null | string;
  currentTeam: Team | null;
  createTeam: (teamData: FormData) => Promise<Team | null>;
  addMembers: (members: string[]) => Promise<Team | null>;
  getTeamById: (id: string, forceRefresh?: boolean) => Promise<Team | null>;
  updateMemberRole: (role: string, memberId: string) => Promise<Team | null>;
  removeMember: (id: string) => Promise<Team | null>;
  leaveMember: () => Promise<Team | null>;
  transferTeamOwnerShip?: () => void;
  deleteTeam?: () => void;
  fetchAllTeams: () => Promise<void>;
  fetchTeamsPaginated: (params: {
    page?: number;
    limit?: number;
    search?: string;
    region?: string;
    isRecruiting?: boolean;
    isVerified?: boolean;
    append?: boolean;
  }) => Promise<void>;
  updateTeam: (teamData: FormData) => Promise<Team | null>;
  inviteMember: (playerId: string) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
}

const getErrorMessage = (error: unknown, defaultMsg: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || defaultMsg;
  }
  return (error as Error).message || defaultMsg;
};

export const useTeamStore = create<TeamStateTypes>((set, get) => ({
  teams: [],
  paginatedTeams: [],
  pagination: {
    totalCount: 0,
    currentPage: 1,
    limit: 10,
    hasMore: false,
  },
  isLoading: false,
  error: null,
  currentTeam: null,

  clearError: () => set({ error: null }),

  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(teamEndpoints.create(), teamData);
      set({ currentTeam: response.data.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error creating new team");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  getTeamById: async (id, forceRefresh = false) => {
    // Check if team is already in store and matches requested id
    const state = get();
    if (!forceRefresh && state.currentTeam && state.currentTeam._id === id) {
      return state.currentTeam;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(teamEndpoints.getById(id));
      set({ currentTeam: response?.data?.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  addMembers: async (members) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(teamEndpoints.members.add(), {
        members,
      });
      const updatedTeam = response.data.team;

      set(() => ({
        currentTeam: updatedTeam,
        isLoading: false,
      }));

      return updatedTeam;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error adding team members");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  removeMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(teamEndpoints.members.remove(id));
      const updatedTeam = response.data.team;

      set({
        currentTeam: updatedTeam,
        isLoading: false,
      });

      return updatedTeam;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error removing team member");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  updateMemberRole: async (role, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(teamEndpoints.members.updateRole(), {
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
      const errMsg = getErrorMessage(error, "Error updating team member role");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  leaveMember: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(teamEndpoints.members.leave());
      const updatedTeam = response.data.team;

      set({
        currentTeam: updatedTeam,
        isLoading: false,
      });

      return updatedTeam;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error while leaving team");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  transferTeamOwnerShip: () => { },
  deleteTeam: () => { },

  fetchAllTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(teamEndpoints.getAll());
      set({ teams: response.data.teams, isLoading: false });
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching all teams");
      set({ error: errMsg, isLoading: false });
    }
  },

  fetchTeamsPaginated: async ({ page = 1, limit = 10, search, region, isRecruiting, isVerified, append = false }) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (region) params.append("region", region);
      if (isRecruiting !== undefined) params.append("isRecruiting", isRecruiting.toString());
      if (isVerified !== undefined) params.append("isVerified", isVerified.toString());

      const response = await axiosInstance.get(`${teamEndpoints.getAll()}?${params.toString()}`);

      const newTeams = response.data.teams;
      const pagination = response.data.pagination;

      set((state) => ({
        paginatedTeams: append ? [...state.paginatedTeams, ...newTeams] : newTeams,
        pagination,
        isLoading: false,
      }));
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching paginated teams");
      set({ error: errMsg, isLoading: false });
    }
  },

  updateTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(teamEndpoints.update(), teamData);
      set({ currentTeam: response.data.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error updating team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  inviteMember: async (playerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        teamEndpoints.invitations.invite(),
        { playerId }
      );
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to invite player");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },
}));
