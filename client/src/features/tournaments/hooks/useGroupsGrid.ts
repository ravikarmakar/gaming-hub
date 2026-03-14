import { useGroupsData } from './useGroupsData';
import { useGroupsInteractions } from './useGroupsInteractions';

interface UseGroupsGridProps {
    roundId: string;
    eventId: string;
    externalSearch?: string;
    externalStatusFilter?: string;
    externalSortBy?: string;
}

export const useGroupsGrid = ({ roundId, eventId, externalSearch, externalStatusFilter, externalSortBy }: UseGroupsGridProps) => {
    const data = useGroupsData({ roundId, eventId, externalSearch, externalStatusFilter, externalSortBy });
    const interactions = useGroupsInteractions({
        rounds: data.rounds,
        groups: data.groups,
        roundId,
        eventId,
        isLoading: data.isFetching // Use isFetching to catch refetches as well
    });

    return {
        ...data,
        ...interactions
    };
};
