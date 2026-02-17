import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import { Team } from "../lib/types";
import { TEAM_ENDPOINTS } from "../lib/endpoints";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { useTeamListStore } from "./useTeamListStore";

interface TeamManagementState {
    currentTeam: Team | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    getTeamById: (id: string, forceRefresh?: boolean, skipServerCache?: boolean) => Promise<Team | null>;
    createTeam: (teamData: FormData) => Promise<Team | null>;
    updateTeam: (teamId: string, teamData: FormData) => Promise<Team | null>;
    deleteTeam: () => Promise<{ success: boolean; message: string }>;
    removeMember: (memberId: string) => Promise<{ success: boolean; message: string } | null>;
    leaveMember: () => Promise<{ success: boolean; message: string } | null>;
    updateMemberRole: (role: string, memberId: string) => Promise<Team | null>;
    promoteMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
    demoteMember: (memberId: string) => Promise<{ success: boolean; message: string }>;
    transferTeamOwnerShip: (memberId: string) => Promise<{ success: boolean; message: string }>;
    clearError: () => void;
    setCurrentTeam: (team: Team | null) => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set, get) => ({
    currentTeam: null,
    isLoading: false,
    error: null,

    clearError: () => set({ error: null }),
    setCurrentTeam: (team) => set({ currentTeam: team }),

    getTeamById: async (id, forceRefresh = false, skipServerCache = false) => {
        // Always check ListStore first if not forceRefreshing
        if (!forceRefresh) {
            const listTeam = useTeamListStore.getState().teamsById[id];
            if (listTeam) {
                set({ currentTeam: listTeam });
                return listTeam;
            }
        }

        set({ isLoading: true, error: null });
        try {
            const url = skipServerCache
                ? `${TEAM_ENDPOINTS.GET_BY_ID(id)}?skipCache=true`
                : TEAM_ENDPOINTS.GET_BY_ID(id);
            const response = await axiosInstance.get(url);
            const team = response.data.data;

            set({ currentTeam: team, isLoading: false });
            useTeamListStore.getState().updateTeamInList(team);

            return team;
        } catch (error) {
            set({ error: getErrorMessage(error, "Error fetching team details"), isLoading: false });
            return null;
        }
    },

    createTeam: async (teamData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.post(TEAM_ENDPOINTS.CREATE, teamData);
            const team = response.data.data;
            set({ currentTeam: team, isLoading: false });
            useTeamListStore.getState().updateTeamInList(team);
            return team;
        } catch (error) {
            set({ error: getErrorMessage(error, "Error creating new team"), isLoading: false });
            return null;
        }
    },

    updateTeam: async (teamId, teamData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(`${TEAM_ENDPOINTS.UPDATE}?teamId=${teamId}`, teamData);
            const updatedTeam = response.data.data;
            set({ currentTeam: updatedTeam, isLoading: false });
            useTeamListStore.getState().updateTeamInList(updatedTeam);
            return updatedTeam;
        } catch (error) {
            set({ error: getErrorMessage(error, "Error updating team details"), isLoading: false });
            return null;
        }
    },

    deleteTeam: async () => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team" };

        set({ isLoading: true });
        try {
            const response = await axiosInstance.delete(`${TEAM_ENDPOINTS.DELETE}?teamId=${currentTeam._id}`);
            if (response.data.success) {
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
                useTeamListStore.getState().removeTeamFromList(currentTeam._id);
                set({ currentTeam: null });
            }
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error deleting team") };
        }
    },

    removeMember: async (memberId) => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team" };

        set({ isLoading: true });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.REMOVE_MEMBER(memberId), {
                teamId: currentTeam._id
            });

            if (response.data.success) {
                const updatedTeam = response.data.data;
                set({ currentTeam: updatedTeam, isLoading: false });
                useTeamListStore.getState().updateTeamInList(updatedTeam);
            } else {
                set({ isLoading: false });
            }
            return response.data;
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error removing member") };
        }
    },

    leaveMember: async () => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return null;

        set({ isLoading: true });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.LEAVE_TEAM, {
                teamId: currentTeam._id
            });

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

            set({ currentTeam: null, isLoading: false });
            // We don't remove it from ListStore as the team still exists, 
            // but we might want to refresh its member count if needed.

            return response.data;
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error leaving team") };
        }
    },

    updateMemberRole: async (role, memberId) => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return null;

        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.UPDATE_MEMBER_ROLE, {
                teamId: currentTeam._id,
                role,
                memberId,
            });
            const updatedTeam = response.data.data;
            set({ currentTeam: updatedTeam, isLoading: false });
            useTeamListStore.getState().updateTeamInList(updatedTeam);
            return updatedTeam;
        } catch (error) {
            set({ error: getErrorMessage(error, "Error updating role"), isLoading: false });
            return null;
        }
    },

    promoteMember: async (memberId) => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team" };

        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
                teamId: currentTeam._id,
                memberId,
                action: "promote"
            });

            if (response.data.success) {
                const updatedTeam = response.data.data || currentTeam;
                set({ currentTeam: updatedTeam, isLoading: false });
                useTeamListStore.getState().updateTeamInList(updatedTeam);
            }
            return { success: true, message: response.data.message };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error promoting member") };
        }
    },

    demoteMember: async (memberId) => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team" };

        set({ isLoading: true, error: null });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, {
                teamId: currentTeam._id,
                memberId,
                action: "demote"
            });

            if (response.data.success) {
                const updatedTeam = response.data.data || currentTeam;
                set({ currentTeam: updatedTeam, isLoading: false });
                useTeamListStore.getState().updateTeamInList(updatedTeam);
            }
            return { success: true, message: response.data.message };
        } catch (error) {
            set({ error: getErrorMessage(error, "Error demoting member"), isLoading: false });
            return { success: false, message: getErrorMessage(error, "Error demoting member") };
        }
    },

    transferTeamOwnerShip: async (memberId) => {
        const currentTeam = get().currentTeam;
        if (!currentTeam) return { success: false, message: "No active team" };

        set({ isLoading: true });
        try {
            const response = await axiosInstance.put(TEAM_ENDPOINTS.TRANSFER_OWNERSHIP, {
                memberId,
                teamId: currentTeam._id,
            });

            if (response.data.success) {
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
                const updatedTeam = response.data.data || currentTeam;
                set({ currentTeam: updatedTeam, isLoading: false });
                useTeamListStore.getState().updateTeamInList(updatedTeam);
            } else {
                set({ isLoading: false });
            }
            return response.data;
        } catch (error) {
            const errMsg = getErrorMessage(error, "Error transferring ownership");
            set({ isLoading: false, error: errMsg });
            return { success: false, message: errMsg };
        }
    },
}));
