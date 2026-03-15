import { axiosInstance } from "@/lib/axios";
import { TOURNAMENT_ENDPOINTS } from "@/features/tournaments/lib";
import { Tournament } from "@/features/tournaments/types";

export const tournamentApi = {
    createTournament: async (data: FormData): Promise<Tournament> => {
        const response = await axiosInstance.post(TOURNAMENT_ENDPOINTS.CREATE, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    },
    deleteTournament: async (eventId: string): Promise<boolean> => {
        const response = await axiosInstance.delete(TOURNAMENT_ENDPOINTS.DELETE(eventId));
        return response.status >= 200 && response.status < 300;
    },
    updateTournament: async (data: { eventId: string; payload: FormData }): Promise<Tournament> => {
        const response = await axiosInstance.put(TOURNAMENT_ENDPOINTS.UPDATE(data.eventId), data.payload, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    },
    getTournamentDetails: async (eventId: string, skipCache = false): Promise<Tournament> => {
        const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.DETAILS(eventId), {
            params: skipCache ? { skipCache: true } : {}
        });
        return response.data.data;
    },
    getOrgTournaments: async (orgId: string): Promise<Tournament[]> => {
        const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.ORG_EVENTS(orgId));
        return response.data.data;
    },
    startTournament: async (eventId: string): Promise<Tournament> => {
        const res = await axiosInstance.post(`/events/${eventId}/start`);
        return res.data.data;
    },

    // Round operations
    getRounds: async (eventId: string): Promise<any[]> => {
        const res = await axiosInstance.get(`/rounds?eventId=${eventId}`);
        return res.data.data;
    },
    createRound: async (data: { eventId: string; params: any }): Promise<any> => {
        const res = await axiosInstance.post("/rounds/create", {
            eventId: data.eventId,
            ...data.params
        });
        return res.data.rounds;
    },
    updateRound: async (data: any): Promise<void> => {
        const { roundId, ...payload } = data;
        await axiosInstance.put(`/rounds/${roundId}`, payload);
    },
    updateRoundStatus: async (data: { roundId: string; eventId: string; status: string }): Promise<void> => {
        await axiosInstance.put(`/rounds/${data.roundId}`, { eventId: data.eventId, status: data.status });
    },
    deleteRound: async (data: { roundId: string; eventId: string }): Promise<void> => {
        await axiosInstance.delete(`/rounds/${data.roundId}`, { data: { eventId: data.eventId } });
    },
    resetRound: async (data: { roundId: string; eventId: string }): Promise<void> => {
        await axiosInstance.post(`/rounds/${data.roundId}/reset`, { eventId: data.eventId });
    },
    mergeTeamsToRound: async (data: { roundId: string; eventId: string }): Promise<any> => {
        const res = await axiosInstance.post(`/rounds/${data.roundId}/merge-qualified`, { eventId: data.eventId });
        return res.data;
    },

    // Group operations
    getGroups: async (params: { roundId: string; page: number; limit: number; search?: string; status?: string; sortBy?: string }): Promise<any> => {
        const res = await axiosInstance.get("/groups", { params });
        return {
            groups: res.data.data,
            pagination: res.data.pagination
        };
    },
    getGroupDetails: async (groupId: string): Promise<any> => {
        const res = await axiosInstance.get(`/groups/${groupId}`);
        return res.data.group;
    },
    createGroups: async (data: { roundId: string; eventId: string; totalMatch?: number; matchTime?: string }): Promise<void> => {
        await axiosInstance.post("/groups/create", {
            roundId: data.roundId,
            eventId: data.eventId,
            totalMatch: data.totalMatch ?? 1,
            matchTime: data.matchTime
        });
    },
    createSingleGroup: async (data: { roundId: string; eventId: string; groupName?: string; matchTime?: string }): Promise<void> => {
        await axiosInstance.post("/groups/manual-create", data);
    },
    updateGroup: async (data: { groupId: string; eventId: string; payload: any }): Promise<void> => {
        await axiosInstance.put(`/groups/${data.groupId}`, { ...data.payload, eventId: data.eventId });
    },
    deleteGroup: async (data: { groupId: string; eventId: string }): Promise<any> => {
        const { data: resData } = await axiosInstance.delete(`/groups/${data.groupId}`, { params: { eventId: data.eventId } });
        return resData;
    },
    mergeTeamsToGroup: async (data: { groupId: string; eventId: string }): Promise<any> => {
        const res = await axiosInstance.post(`/groups/${data.groupId}/merge-qualified`, { eventId: data.eventId });
        return res.data;
    },
    injectTeam: async (data: { groupId: string; teamId: string; eventId: string }): Promise<any> => {
        const res = await axiosInstance.post("/groups/inject-team", data);
        return res.data;
    },

    // Leaderboard operations
    getLeaderboard: async (groupId: string): Promise<any> => {
        const res = await axiosInstance.get(`/leaderboards/${groupId}`);
        return res.data;
    },
    updateTeamScore: async (data: { groupId: string; eventId: string; teamId: string; stats: any }): Promise<any> => {
        const res = await axiosInstance.put(`/leaderboards/${data.groupId}/score`, {
            teamId: data.teamId,
            eventId: data.eventId,
            ...data.stats,
        });
        return res.data;
    },
    updateGroupResults: async (data: { groupId: string; eventId: string; results: any[]; pairingType?: string }): Promise<any> => {
        const res = await axiosInstance.put(`/leaderboards/${data.groupId}/results`, {
            results: data.results,
            eventId: data.eventId,
            pairingType: data.pairingType,
        });
        return res.data;
    },

    // Team operations
    getRegisteredTeams: async (eventId: string, params: any): Promise<any> => {
        const res = await axiosInstance.get(`/events/registered-teams/${eventId}`, { params });
        return res.data;
    },
    getInvitedTeams: async (eventId: string, params: any): Promise<any> => {
        const res = await axiosInstance.get(`/events/invited-teams/${eventId}`, { params });
        return res.data;
    },
    getT1SpecialTeams: async (eventId: string, params: any): Promise<any> => {
        const res = await axiosInstance.get(`/events/t1-special-teams/${eventId}`, { params });
        return res.data;
    },
    searchTeams: async (params: { search: string; limit: number }): Promise<any> => {
        const res = await axiosInstance.get('/teams', { params });
        return res.data.data;
    },

    // Other
    inviteToGroup: async (data: { targetId: string; playerId: string; targetModel: string; role?: string }): Promise<void> => {
        await axiosInstance.post("/invitations/invite-member", data);
    },
    toggleLike: async (eventId: string): Promise<{ likesCount: number; isLiked: boolean }> => {
        const res = await axiosInstance.post(`/events/${eventId}/like`);
        return res.data.data;
    },
    registerTournament: async (eventId: string): Promise<any> => {
        const response = await axiosInstance.post(TOURNAMENT_ENDPOINTS.REGISTER(eventId), {});
        return response.data;
    },
    getRegistrationStatus: async (eventId: string, teamId: string): Promise<{ registered: boolean; status: "approved" | "pending" | "none" }> => {
        const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.IS_REGISTERED(eventId, teamId));
        return {
            registered: response.data.registered,
            status: response.data.status || (response.data.registered ? "approved" : "none")
        };
    },
    getTournaments: async (params: { search?: string; game?: string; category?: string; cursor?: string | null; limit?: number }): Promise<any> => {
        const response = await axiosInstance.get(TOURNAMENT_ENDPOINTS.ALL, { params });
        return response.data;
    },
};
