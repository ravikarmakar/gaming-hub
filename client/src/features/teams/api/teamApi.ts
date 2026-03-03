import { axiosInstance } from "@/lib/axios";
import { TEAM_ENDPOINTS } from "../lib/endpoints";

export const teamApi = {
    createTeam: async (data: FormData) => {
        const response = await axiosInstance.post(TEAM_ENDPOINTS.CREATE, data);
        return response.data.data;
    },
    // Future endpoints (getTeamById, updateTeam, deleteTeam) will go here
};
