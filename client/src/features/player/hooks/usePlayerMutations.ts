import { useQueryClient } from "@tanstack/react-query";
import { playerKeys } from "./playerKeys";

export const usePlayerMutations = () => {
    const queryClient = useQueryClient();

    const invalidatePlayers = () => {
        queryClient.invalidateQueries({ queryKey: playerKeys.all });
    };

    return {
        invalidatePlayers,
    };
};
