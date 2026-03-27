import { useState, useCallback, useEffect } from 'react';
import { useGetGroupsQuery, useRoundsSidebar } from './';
import { useDebounce } from '@/hooks/useDebounce';
import { useTournamentDashboard } from '../context/TournamentDashboardContext';

interface UseGroupsDataProps {
    roundId: string;
}

export const useGroupsData = ({ roundId }: UseGroupsDataProps) => {
    const { 
        eventId, 
        search, 
        setSearch,
        statusFilter, 
        setStatusFilter,
        sortBy, 
        setSortBy,
        activeRoundTab
    } = useTournamentDashboard();

    const [currentPage, setCurrentPage] = useState(1);
    
    // Debounce search input
    const debouncedSearch = useDebounce(search, 500);

    // Reset pagination to page 1 when search or status filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter]);

    const { filteredSidebarItems: enrichedRounds } = useRoundsSidebar(eventId);
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

