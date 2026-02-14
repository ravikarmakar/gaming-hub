import { create } from "zustand";

import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { TEAM_ENDPOINTS } from "../lib/endpoints";
import { EVENT_ENDPOINTS } from "@/features/events/lib/endpoints";
import { getErrorMessage } from "@/lib/utils";
import { Team } from "../lib/types";

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
  teamTournaments: any[];
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
  fetchTeams: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    region?: string;
    isRecruiting?: boolean;
    isVerified?: boolean;
    append?: boolean;
  }) => Promise<void>;
  updateTeam: (teamId: string, teamData: FormData) => Promise<Team | null>;
  inviteMember: (playerId: string, message?: string) => Promise<{ success: boolean; message: string }>;
  sendJoinRequest: (teamId: string, message?: string) => Promise<{ success: boolean; message: string }>;
  fetchJoinRequests: (teamId: string) => Promise<void>;
  handleJoinRequest: (requestId: string, action: 'accepted' | 'rejected') => Promise<{ success: boolean; message: string }>;
  clearAllJoinRequests: () => Promise<{ success: boolean; message: string }>;
  fetchTeamTournaments: (teamId: string) => Promise<void>;

  sentInvitations: any[];
  fetchSentInvitations: (teamId: string) => Promise<void>;

  clearError: () => void;
}


export const useTeamStore = create<TeamStateTypes>((set, get) => ({
  teams: [],
  paginatedTeams: [],
  pagination: {
    totalCount: 0,
    currentPage: 1,
    limit: 20,
    hasMore: false,
  },
  isLoading: false,
  isRequestingJoin: false,
  error: null,
  currentTeam: null,
  joinRequests: [],
  teamTournaments: [],
  isCreateTeamOpen: false,
  sentInvitations: [],

  setIsCreateTeamOpen: (isOpen) => set({ isCreateTeamOpen: isOpen }),

  clearError: () => set({ error: null }),

  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post(TEAM_ENDPOINTS.CREATE, teamData);
      const team = response.data.data;
      set({ currentTeam: team, isLoading: false });
      return team;
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
      const team = response.data.data;
      set({ currentTeam: team, isLoading: false });
      return team;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  removeMember: async (id) => {
    set({ isLoading: true });

    // Ensure we have currentTeam loaded
    const currentTeam = get().currentTeam;
    if (!currentTeam) {
      set({ isLoading: false, error: "No active team found." });
      return { success: false, message: "No active team found." };
    }

    try {
      // Send teamId in body for middleware authorization
      const response = await axiosInstance.put(TEAM_ENDPOINTS.REMOVE_MEMBER(id), {
        teamId: currentTeam._id
      });

      if (response.data.success) {
        set({ currentTeam: response.data.data, isLoading: false });
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

    // Validate current team
    const currentTeam = get().currentTeam;
    if (!currentTeam) {
      set({ isLoading: false, error: "No active team found." });
      return null;
    }

    try {
      // Include teamId for middleware
      const response = await axiosInstance.put(TEAM_ENDPOINTS.UPDATE_MEMBER_ROLE, {
        teamId: currentTeam._id,
        role,
        memberId,
      });
      const updatedTeam = response.data.data;

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

    const currentTeam = get().currentTeam;
    if (!currentTeam) {
      set({ isLoading: false, error: "No active team found." });
      return { success: false, message: "No active team found." };
    }

    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
        teamId: currentTeam._id,
        memberId,
        action: "promote"
      });

      if (response.data.success) {
        set((state) => ({
          currentTeam: response.data.data || state.currentTeam,
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

    const currentTeam = get().currentTeam;
    if (!currentTeam) {
      set({ isLoading: false, error: "No active team found." });
      return { success: false, message: "No active team found." };
    }

    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
        teamId: currentTeam._id,
        memberId,
        action: "demote"
      });

      if (response.data.success) {
        set((state) => ({
          currentTeam: response.data.data || state.currentTeam,
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

    // Validate current team
    const currentTeam = get().currentTeam;
    if (!currentTeam) {
      set({ isLoading: false, error: "No active team found." });
      return null;
    }

    try {
      // Pass teamId for authorization
      const response = await axiosInstance.put(TEAM_ENDPOINTS.LEAVE_TEAM, {
        teamId: currentTeam._id
      });

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
          currentTeam: response.data.data || get().currentTeam,
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
      set({ teams: response.data.data, isLoading: false });
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching all teams");
      set({ error: errMsg, isLoading: false });
    }
  },

  fetchTeams: async (params = {}) => {
    const { page = 1, limit = 20, search, region, isRecruiting, isVerified, append = false } = params;
    set({ isLoading: true, error: null });
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) queryParams.append("search", search);
      if (region) queryParams.append("region", region);
      if (isRecruiting !== undefined) queryParams.append("isRecruiting", isRecruiting.toString());
      if (isVerified !== undefined) queryParams.append("isVerified", isVerified.toString());

      const response = await axiosInstance.get(`${TEAM_ENDPOINTS.GET_ALL}?${queryParams.toString()}`);

      const newTeams = response.data.data || [];
      const pagination = response.data.pagination;

      set((state) => ({
        paginatedTeams: append ? [...state.paginatedTeams, ...newTeams] : newTeams,
        pagination,
        isLoading: false,
      }));
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error fetching teams");
      set({ error: errMsg, isLoading: false });
    }
  },

  updateTeam: async (teamId, teamData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(`${TEAM_ENDPOINTS.UPDATE}?teamId=${teamId}`, teamData);
      set({ currentTeam: response.data.data, isLoading: false });
      return response.data.data;
    } catch (error) {
      const errMsg = getErrorMessage(error, "Error updating team details");
      set({ error: errMsg, isLoading: false });
      return null;
    }
  },

  inviteMember: async (playerId: string, message?: string) => {
    set({ isLoading: true, error: null });
    const currentTeam = get().currentTeam;

    if (!currentTeam) {
      set({ error: "No active team found to invite to", isLoading: false });
      return { success: false, message: "No active team found" };
    }

    try {
      const response = await axiosInstance.post(
        TEAM_ENDPOINTS.INVITE_MEMBER,
        {
          playerId,
          message,
          targetId: currentTeam._id,
          targetModel: "Team"
        }
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

  fetchJoinRequests: async (teamId) => {
    if (!teamId) return;
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get(TEAM_ENDPOINTS.FETCH_JOIN_REQUESTS(teamId));
      set({ joinRequests: response.data.data || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch join requests:", error);
      set({ isLoading: false });
    }
  },

  handleJoinRequest: async (requestId, action) => {
    const currentTeam = get().currentTeam;
    if (!currentTeam) return { success: false, message: "No active team found" };

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.put(TEAM_ENDPOINTS.HANDLE_JOIN_REQUEST(currentTeam._id, requestId), { action });

      // Update local state
      set((state) => {
        const nextState: any = {
          joinRequests: state.joinRequests.filter((req) => req._id !== requestId),
          isLoading: false
        };

        if (action === 'accepted' && response.data.data) {
          nextState.currentTeam = response.data.data;
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

  clearAllJoinRequests: async () => {
    const currentTeam = get().currentTeam;
    if (!currentTeam) return { success: false, message: "No active team found" };

    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.delete(TEAM_ENDPOINTS.CLEAR_ALL_JOIN_REQUESTS(currentTeam._id));
      if (response.data.success) {
        set({ joinRequests: [], isLoading: false });
        // Refresh team count
        await get().getTeamById(currentTeam._id, true);
      }
      return { success: true, message: response.data.message };
    } catch (error) {
      const errMsg = getErrorMessage(error, "Failed to clear join requests");
      set({ error: errMsg, isLoading: false });
      return { success: false, message: errMsg };
    }
  },

  fetchTeamTournaments: async (teamId) => {
    if (!teamId) return;
    try {
      const response = await axiosInstance.get(EVENT_ENDPOINTS.TEAM_EVENTS(teamId));
      set({ teamTournaments: response.data.data });
    } catch (error) {
      console.error("Error fetching team tournaments:", error);
    }
  },

  fetchSentInvitations: async (teamId) => {
    try {
      const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_PENDING_INVITES(teamId));
      set({ sentInvitations: response.data.data });
    } catch (error) {
      console.error("Error fetching sent invitations:", error);
    }
  },
}));
