import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminKeys } from "./adminKeys";
import { adminApi } from "../api/adminApi";

export const useUpdateEntityStatusMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: adminApi.updateEntityStatus,
        onSuccess: (_data, variables) => {
            // Invalidate all queries for this entity type so the list refreshes
            queryClient.invalidateQueries({
                queryKey: adminKeys.entities(variables.type),
            });
        },
    });
};
