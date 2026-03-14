import { useState, useCallback } from 'react';
import { useGetGroupsQuery, useRoundsSidebar } from './';
import { useDebounce } from '@/hooks/useDebounce';

interface UseGroupsDataProps {
    roundId: string;
    eventId: string;
    // Optional: lifted state from parent
    externalSearch?: string;
    externalStatusFilter?: string;
    externalSortBy?: string;
}

export const useGroupsData = ({ roundId, eventId, externalSearch, externalStatusFilter, externalSortBy }: UseGroupsDataProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    // Internal state used only when no external state is provided
    const [internalSearch, setInternalSearch] = useState("");
    const [internalStatusFilter, setInternalStatusFilter] = useState("");
    const [internalSortBy, setInternalSortBy] = useState("matchTime-asc");

    const search = externalSearch !== undefined ? externalSearch : internalSearch;
    const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
    const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;
    const setSearch = setInternalSearch;
    const setStatusFilter = setInternalStatusFilter;
    const setSortBy = setInternalSortBy;

    // Debounce search input
    const debouncedSearch = useDebounce(search, 500);

    const { activeRoundTab, filteredSidebarItems: enrichedRounds } = useRoundsSidebar(eventId);
    const { data: groupsData, isLoading, isFetching } = useGetGroupsQuery(
        roundId,
        currentPage,
        20,
        debouncedSearch,
        statusFilter === "all" ? "" : statusFilter,
        sortBy
    );

    const groups = groupsData?.groups || [];
    const { totalPages, totalGroups } = groupsData?.pagination || { totalPages: 1, totalGroups: 0 };

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    return {
        rounds: enrichedRounds,
        groups,
        isLoading,
        isFetching,
        totalPages,
        totalGroups,
        currentPage,
        activeRoundTab,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        handlePageChange
    };
};

