import { useState, useCallback, useEffect } from 'react';
import { useGetRoundsQuery, useGetGroupsQuery, useRoundsSidebar } from './';

interface UseGroupsDataProps {
    roundId: string;
    eventId: string;
}

export const useGroupsData = ({ roundId, eventId }: UseGroupsDataProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const { activeRoundTab } = useRoundsSidebar(eventId);

    useEffect(() => {
        setCurrentPage(1);
    }, [roundId]);

    const { data: rounds = [] } = useGetRoundsQuery(eventId);
    const { data: groupsData, isLoading } = useGetGroupsQuery(roundId, currentPage);
    
    const groups = groupsData?.groups || [];
    const { totalPages, totalGroups } = groupsData?.pagination || { totalPages: 1, totalGroups: 0 };

    const handlePageChange = useCallback((newPage: number) => {
        setCurrentPage(newPage);
    }, []);

    return {
        rounds,
        groups,
        isLoading,
        totalPages,
        totalGroups,
        currentPage,
        activeRoundTab,
        handlePageChange
    };
};
