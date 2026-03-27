import { useGroupsData } from './useGroupsData';
import { useGroupsInteractions } from './useGroupsInteractions';

interface UseGroupsGridProps {
    roundId: string;
    eventId: string;
}

export const useGroupsGrid = ({ roundId, eventId }: UseGroupsGridProps) => {
    const data = useGroupsData({ roundId });
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
