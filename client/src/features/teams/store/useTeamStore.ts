import axios from "axios";
import { create } from "zustand";

import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ENDPOINTS } from "../api/endpoints";

export const roleInTeam = [
  "igl",
  "rusher",
  "sniper",
  "support",
  "player",
  "coach",
  "analyst",
  "substitute",
];

export const systemRole = ["player", "owner", "manager"];

export interface TeamMembersTypes {
  _id: string;
  username: string;
  avatar: string;
  user: string;
  roleInTeam: typeof roleInTeam[number];
  systemRole: typeof systemRole[number];
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
  hasPendingRequest?: boolean;
  pendingRequestsCount?: number;
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
  isRequestingJoin: boolean;
  error: null | string;
  currentTeam: Team | null;
  joinRequests: any[];
  isCreateTeamOpen: boolean; // Added state
  setIsCreateTeamOpen: (isOpen: boolean) => void; // Added action

  createTeam: (teamData: FormData) => Promise<Team | null>;
  getTeamById: (id: string, forceRefresh?: boolean) => Promise<Team | null>;
  updateMemberRole: (role: string, memberId: string) => Promise<Team | null>;

  // Staff Management
  promoteMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
  demoteMember: (memberId: string) => Promise<{ success: boolean; message: string }>;

  removeMember: (id: string) => Promise<{ success: boolean; message: string } | null>;
  leaveMember: () => Promise<{ success: boolean; message: string } | null>;
  transferTeamOwnerShip: (memberId: string) => Promise<{ success: boolean; message: string }>;
  deleteTeam: () => Promise<{ success: boolean; message: string }>;
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
  inviteMember: (playerId: string, message?: string) => Promise<{ success: boolean; message: string }>;
  sendJoinRequest: (teamId: string, message?: string) => Promise<{ success: boolean; message: string }>;
  fetchJoinRequests: () => Promise<void>;
  handleJoinRequest: (requestId: string, action: 'accepted' | 'rejected') => Promise<{ success: boolean; message: string }>;
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
  isRequestingJoin: false,
  error: null,
  currentTeam: null,
  joinRequests: [],
  isCreateTeamOpen: false,

  setIsCreateTeamOpen: (isOpen) => set({ isCreateTeamOpen: isOpen }),

  clearError: () => set({ error: null }),

  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(TEAM_ENDPOINTS.CREATE, teamData);
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
      const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_BY_ID(id));
      set({ currentTeam: response?.data?.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  removeMember: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.REMOVE_MEMBER(id));
      if (response.data.success) {
        set({ currentTeam: response.data.team, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return response.data;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error removing team member");
      console.error("Failed to remove member:", errMsg);
      set({ isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  updateMemberRole: async (role, memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.UPDATE_MEMBER_ROLE, {
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

  promoteMember: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
        memberId,
        action: "promote"
      });

      if (response.data.success) {
        set((state) => ({
          currentTeam: response.data.team || state.currentTeam,
          isLoading: false
        }));
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error promoting member");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  demoteMember: async (memberId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
        memberId,
        action: "demote"
      });

      if (response.data.success) {
        set((state) => ({
          currentTeam: response.data.team || state.currentTeam,
          isLoading: false
        }));
      }

      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error demoting member");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  leaveMember: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.LEAVE_TEAM);

      // Update Auth Store to reflect that user no longer has a team
      const authUser = useAuthStore.getState().user;
      if (authUser) {
        useAuthStore.setState({
          user: {
            ...authUser,
            teamId: "",
            roles: authUser.roles.filter(r => r.scope !== 'team')
          }
        });
      }

      set({
        currentTeam: null,
        isLoading: false,
      });

      return response.data;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error while leaving team");
      console.error("Failed to leave team:", errMsg);
      set({ isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  transferTeamOwnerShip: async (memberId: string) => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.TRANSFER_OWNERSHIP, {
        memberId,
      });

      if (response.data.success) {
        // Consolidate updates to skip redundant re-renders
        const authStore = useAuthStore.getState();
        if (authStore.user) {
          useAuthStore.setState({
            user: {
              ...authStore.user,
              roles: authStore.user.roles.map((r) =>
                r.scope === "team" ? { ...r, role: "team:player" } : r
              ),
            },
          });
        }

        set({
          currentTeam: response.data.team || get().currentTeam,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }

      return response.data;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error transferring team ownership");
      set({ isLoading: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  deleteTeam: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.delete(TEAM_ENDPOINTS.DELETE);

      if (response.data.success) {
        // Clear team from auth store for all members (but locally for this user)
        const authUser = useAuthStore.getState().user;
        if (authUser) {
          useAuthStore.setState({
            user: {
              ...authUser,
              teamId: "",
              roles: authUser.roles.filter(r => r.scope !== 'team')
            }
          });
        }
        set({ currentTeam: null });
      }

      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error deleting team");
      set({ isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  fetchAllTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_ALL);
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

      const response = await axiosInstance.get(`${TEAM_ENDPOINTS.GET_ALL}?${params.toString()}`);

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
      const response = await axiosInstance.put(TEAM_ENDPOINTS.UPDATE, teamData);
      set({ currentTeam: response.data.team, isLoading: false });
      return response.data.team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error updating team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  inviteMember: async (playerId: string, message?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(
        TEAM_ENDPOINTS.INVITE_MEMBER,
        { playerId, message }
      );
      set({ isLoading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to invite player");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  sendJoinRequest: async (teamId, message) => {
    set({ isRequestingJoin: true, error: null });
    try {
      const response = await axiosInstance.post(TEAM_ENDPOINTS.SEND_JOIN_REQUEST(teamId), { message });
      set({ isRequestingJoin: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to send join request");
      set({ isRequestingJoin: false, error: errMsg });
      return { success: false, message: errMsg };
    }
  },

  fetchJoinRequests: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get(TEAM_ENDPOINTS.FETCH_JOIN_REQUESTS);
      set({ joinRequests: response.data.requests, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch join requests:", error);
      set({ isLoading: false });
    }
  },

  handleJoinRequest: async (requestId, action) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.HANDLE_JOIN_REQUEST(requestId), { action });

      // Update local state
      set((state) => {
        const nextState: any = {
          joinRequests: state.joinRequests.filter((req) => req._id !== requestId),
          isLoading: false
        };

        if (action === 'accepted' && response.data.team) {
          nextState.currentTeam = response.data.team;
        }

        return nextState;
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to handle join request");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },
}));
