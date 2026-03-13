import { Pagination } from "@/features/organizer/types";

export interface ApiListResponse<T> {
    success: boolean;
    data: T[];
    pagination: Pagination;
}

export interface ApiSingleResponse<T> {
    success: boolean;
    data: T;
    pagination?: Pagination;
}
