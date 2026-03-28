import { axiosInstance } from "@/lib/axios";
import { TEAM_ENDPOINTS } from "../lib/endpoints";
import { TOURNAMENT_ENDPOINTS } from "@/features/tournaments/lib/endpoints";
import { Team } from "../lib/types";

export const teamApi = {
    // --- Team CRUD ---
    createTeam: async (data: FormData): Promise<Team> => {
        const response = await axiosInstance.post(TEAM_ENDPOINTS.CREATE, data);
        return response.data.data;
    },

    getTeamById: async (id: string, skipCache: boolean = false): Promise<Team> => {
        const url = skipCache
            ? `${TEAM_ENDPOINTS.GET_BY_ID(id)}?skipCache=true`
            : TEAM_ENDPOINTS.GET_BY_ID(id);
        const response = await axiosInstance.get(url);
        return response.data.data;
    },

    updateTeam: async ({ teamId, data }: { teamId: string, data: FormData }): Promise<Team> => {
        const response = await axiosInstance.put(`${TEAM_ENDPOINTS.UPDATE}?teamId=${teamId}`, data);
        return response.data.data;
    },

    deleteTeam: async (teamId: string): Promise<{ success: boolean; message: string }> => {
        const response = await axiosInstance.delete(`${TEAM_ENDPOINTS.DELETE}?teamId=${teamId}`);
        return response.data;
    },

    // --- Team Listing ---
    fetchTeams: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        region?: string;
        isRecruiting?: boolean;
        isVerified?: boolean;
    }) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append("page", params.page.toString());
        if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
        if (params.search) queryParams.append("search", params.search);
        if (params.region) queryParams.append("region", params.region);
        if (params.isRecruiting !== undefined) queryParams.append("isRecruiting", params.isRecruiting.toString());
        if (params.isVerified !== undefined) queryParams.append("isVerified", params.isVerified.toString());

        const response = await axiosInstance.get(`${TEAM_ENDPOINTS.GET_ALL}?${queryParams.toString()}`);
        return {
            data: response.data.data,
            pagination: response.data.pagination
        };
    },

    fetchAllTeams: async (): Promise<Team[]> => {
        const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_ALL);
        return response.data.data;
    },

    // --- Member Management ---
    removeMember: async ({ teamId, memberId }: { teamId: string, memberId: string }) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.REMOVE_MEMBER(memberId), { teamId });
        return response.data;
    },

    leaveTeam: async (teamId: string) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.LEAVE_TEAM, { teamId });
        return response.data;
    },

    updateMemberRole: async ({ teamId, memberId, role }: { teamId: string, memberId: string, role: string }) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.UPDATE_MEMBER_ROLE, { teamId, memberId, role });
        return response.data.data;
    },

    manageStaff: async ({ teamId, memberId, action }: { teamId: string, memberId: string, action: "promote" | "demote" }) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.MANAGE_STAFF, { teamId, memberId, action });
        return response.data;
    },

    transferOwnership: async ({ teamId, memberId }: { teamId: string, memberId: string }) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.TRANSFER_OWNERSHIP, { teamId, memberId });
        return response.data;
    },

    // --- Join Requests ---
    fetchJoinRequests: async (teamId: string) => {
        const response = await axiosInstance.get(TEAM_ENDPOINTS.FETCH_JOIN_REQUESTS(teamId));
        return response.data.data;
    },

    handleJoinRequest: async ({ teamId, requestId, action }: { teamId: string, requestId: string, action: "accepted" | "rejected" }) => {
        const response = await axiosInstance.put(TEAM_ENDPOINTS.HANDLE_JOIN_REQUEST(teamId, requestId), { action });
        return response.data;
    },

    clearAllJoinRequests: async (teamId: string) => {
        const response = await axiosInstance.delete(TEAM_ENDPOINTS.CLEAR_ALL_JOIN_REQUESTS(teamId));
        return response.data;
    },

    sendJoinRequest: async ({ teamId, message }: { teamId: string, message?: string }) => {
        const response = await axiosInstance.post(TEAM_ENDPOINTS.SEND_JOIN_REQUEST(teamId), { message });
        return response.data;
    },

    // --- Invitations ---
    inviteMember: async (data: { playerId: string, teamId: string, message?: string }) => {
        const response = await axiosInstance.post(TEAM_ENDPOINTS.INVITE_MEMBER, {
            playerId: data.playerId,
            message: data.message,
            targetId: data.teamId,
            targetModel: "Team"
        });
        return response.data;
    },

    fetchPendingInvites: async (teamId: string) => {
        const response = await axiosInstance.get(TEAM_ENDPOINTS.GET_PENDING_INVITES(teamId));
        return response.data.data;
    },

    // --- Tournaments ---
    fetchTeamTournaments: async (teamId: string) => {
        const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.TEAM_TOURNAMENTS(teamId));
        return response.data.data;
    }
};
