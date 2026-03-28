import { axiosInstance } from "@/lib/axios";

export interface AdminEntityParams {
    page: number;
    pageSize: number;
    search: string;
    filter: string;
}

export interface AdminEntityResponse {
    data: any[];
    total: number;
    totalPages: number;
}

export const adminApi = {
    fetchEntities: async (
        type: "User" | "Team" | "Organizer",
        params: AdminEntityParams
    ): Promise<AdminEntityResponse> => {
        const response = await axiosInstance.get(`/admin/entities/${type}`, {
            params: {
                page: params.page,
                limit: params.pageSize,
                search: params.search,
                filter: params.filter,
            },
        });
        return {
            data: response.data?.data ?? [],
            total: response.data?.total ?? 0,
            totalPages: response.data?.totalPages ?? 0,
        };
    },

    updateEntityStatus: async ({
        type,
        id,
        updates,
    }: {
        type: "User" | "Team" | "Organizer";
        id: string;
        updates: Record<string, any>;
    }): Promise<void> => {
        await axiosInstance.patch(`/admin/entities/${type}/${id}/status`, updates);
    },
};
