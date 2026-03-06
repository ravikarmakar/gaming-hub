import { axiosInstance } from "@/lib/axios";
import { EVENT_ENDPOINTS } from "@/features/events/lib/endpoints";
import { Event } from "@/features/events/lib/types";

export const tournamentApi = {
    createTournament: async (data: FormData): Promise<Event> => {
        const response = await axiosInstance.post(EVENT_ENDPOINTS.CREATE, data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data.data;
    }
};
