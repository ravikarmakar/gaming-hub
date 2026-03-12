import { axiosInstance } from "@/lib/axios";
import { EVENT_ENDPOINTS } from "@/features/events/lib/endpoints";
import { Event } from "@/features/events/lib/types";

export const tournamentApi = {
    createTournament: async (data: FormData): Promise<Event> => {
        const response = await axiosInstance.post(EVENT_ENDPOINTS.CREATE, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    },
    deleteTournament: async (eventId: string): Promise<boolean> => {
        const response = await axiosInstance.delete(EVENT_ENDPOINTS.DELETE(eventId));
        return response.status >= 200 && response.status < 300;
    },
    updateTournament: async (data: { eventId: string; payload: FormData }): Promise<Event> => {
        const response = await axiosInstance.put(EVENT_ENDPOINTS.UPDATE(data.eventId), data.payload, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    },
    getTournamentDetails: async (eventId: string): Promise<Event> => {
        const response = await axiosInstance.get(EVENT_ENDPOINTS.DETAILS(eventId));
        return response.data.data;
    },
    getOrgTournaments: async (orgId: string): Promise<Event[]> => {
        const response = await axiosInstance.get(EVENT_ENDPOINTS.ORG_EVENTS(orgId));
        return response.data.data;
    }
};
