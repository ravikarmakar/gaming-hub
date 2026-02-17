import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { TEAM_ENDPOINTS } from "../lib/endpoints";
import { useTeamManagementStore } from "./useTeamManagementStore";

interface JoinRequestState {
    joinRequests: any[];
    sentInvitations: any[];
    isLoading: boolean;
    isRequestingJoin: boolean;
    error: string | null;

    // Actions
    fetchJoinRequests: (teamId: string) => Promise<void>;
    handleJoinRequest: (requestId: string, action: 'accepted' | 'rejected') => Promise<{ success: boolean; message: string }>;
    clearAllJoinRequests: () => Promise<{ success: boolean; message: string }>;
    sendJoinRequest: (teamId: string, message?: string) => Promise<{ success: boolean; message: string }>;
    inviteMember: (playerId: string, teamId: string, message?: string) => Promise<{ success: boolean; message: string }>;
    fetchSentInvitations: (teamId: string) => Promise<void>;
    clearError: () => void;
    addIncomingJoinRequest: (request: any) => void;
}

export const useJoinRequestStore = create<JoinRequestState>((set) => ({
    joinRequests: [],
    sentInvitations: [],
    isLoading: false,
    isRequestingJoin: false,
    error: null,

    clearError: () => set({ error: null }),

    addIncomingJoinRequest: (request) => {
        set((state) => ({
            joinRequests: [request, ...state.joinRequests]
        }));
    },

    fetchJoinRequests: async (teamId) => {
        if (!teamId) return;
        set({ isLoading: true });
        try {
            const response = await axiosInstance.get(TEAM_ENDPOINTS.FETCH_JOIN_REQUESTS(teamId));
            set({ joinRequests: response.data.data || [], isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: getErrorMessage(error, "Error fetching join requests") });
        }
    },

    handleJoinRequest: async (requestId, action) => {
        const currentTeam = useTeamManagementStore.getState().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team found" };

        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.HANDLE_JOIN_REQUEST(currentTeam._id, requestId), { action });

            // Update local requests list
            set((state) => ({
                joinRequests: state.joinRequests.filter((req) => req._id !== requestId),
                isLoading: false
            }));

            // If accepted, we might need to update the team member count/roster in management store
            if (action === 'accepted' && response.data.data) {
                useTeamManagementStore.getState().setCurrentTeam(response.data.data);
                // Also update list store if needed (already handled by ManagementStore strategy usually)
            }

            return { success: true, message: response.data.message };
        } catch (error) {
            set({ error: getErrorMessage(error, "Error handling join request"), isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error handling join request") };
        }
    },

    clearAllJoinRequests: async () => {
        const currentTeam = useTeamManagementStore.getState().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team found" };

        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.delete(TEAM_ENDPOINTS.CLEAR_ALL_JOIN_REQUESTS(currentTeam._id));
            if (response.data.success) {
                set({ joinRequests: [], isLoading: false });
            }
            return { success: true, message: response.data.message };
        } catch (error) {
            set({ error: getErrorMessage(error, "Error clearing join requests"), isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error clearing join requests") };
        }
    },

    sendJoinRequest: async (teamId, message) => {
        set({ isRequestingJoin: true, error: null });
        try {
            const response = await axiosInstance.post(TEAM_ENDPOINTS.SEND_JOIN_REQUEST(teamId), { message });
            set({ isRequestingJoin: false });
            return { success: true, message: response.data.message };
        } catch (error) {
            const errMsg = getErrorMessage(error, "Error sending join request");
            set({ isRequestingJoin: false, error: errMsg });
            return { success: false, message: errMsg };
        }
    },

    inviteMember: async (playerId, teamId, message) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post(
                TEAM_ENDPOINTS.INVITE_MEMBER,
                {
                    playerId,
                    message,
                    targetId: teamId,
                    targetModel: "Team"
                }
            );
            set({ isLoading: false });
            return { success: true, message: response.data.message };
        } catch (error) {
            set({ error: getErrorMessage(error, "Error inviting member"), isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error inviting member") };
        }
    },

    fetchSentInvitations: async (teamId) => {
        if (!teamId) return;
        try {
            const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_PENDING_INVITES(teamId));
            set({ sentInvitations: response.data.data });
        } catch (error) {
            console.error("Error fetching sent invitations:", error);
        }
    },
}));
