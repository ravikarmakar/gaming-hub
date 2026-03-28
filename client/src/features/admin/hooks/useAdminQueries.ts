import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { adminKeys } from "./adminKeys";
import { adminApi, AdminEntityParams } from "../api/adminApi";

export const useAdminEntitiesQuery = (
    type: "User" | "Team" | "Organizer",
    params: AdminEntityParams
) => {
    return useQuery({
        queryKey: adminKeys.entityList(type, params),
        queryFn: () => adminApi.fetchEntities(type, params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 30, // 30 seconds — admin data changes frequently
        refetchOnWindowFocus: false,
    });
};
