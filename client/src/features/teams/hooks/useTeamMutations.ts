import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamApi } from "../api/teamApi";

export const useCreateTeamMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: teamApi.createTeam,
        onSuccess: () => {
            // Invalidate the generic list of teams when a new one is made
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        }
    });
};
